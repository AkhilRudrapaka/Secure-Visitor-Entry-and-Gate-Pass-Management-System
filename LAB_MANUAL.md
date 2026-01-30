# Laboratory Evaluation Report: Secure Visitor Entry & Gate Pass System

## 1. Project Overview
**Application:** Secure Visitor Entry and Gate Pass Management System  
**Description:** A secure web application designed to manage visitor entry, exit, and gate passes for an organization (e.g., college campus). It ensures that only authorized personnel can approve visits and that gate passes are verifiable and tamper-proof.

---

## 2. Implementation Mapping to Evaluation Components

### Component 1: Authentication
**Objective:** Confirm the identity of the user.

*   **1.1 Single-Factor Authentication (SFA)**
    *   **Implementation:** Username (Email) and Password login.
    *   **Code Location:** `backend/src/controllers/auth.controller.js` -> `login` function.
    *   **Mechanism:** Users provide credentials. The backend compares the provided password with the stored hash using `bcrypt`.
    
*   **1.2 Multi-Factor Authentication (MFA)**
    *   **Implementation:** Email OTP (Time-based One-Time Password) is enforced for Visitors and users with 2FA enabled.
    *   **Code Location:** 
        *   `backend/src/controllers/auth.controller.js` -> Checks `user.twoFactorEnabled` or `user.role === 'visitor'`.
        *   Generates a 6-digit random code, hashes it, saves it to the DB with an expiration time, and sends it via Email.
    *   **Mechanism:** Something you know (Password) + Something you have (Access to Email).

### Component 2: Authorization (Access Control)
**Objective:** Control what authenticated users can do.

*   **2.1 Access Control Model (ACL/RBAC)**
    *   **Subjects:** Admin, Security, Faculty, Student, Visitor.
    *   **Objects:** User Management, Visit Requests, Gate Pass Generation, Gate Pass Verification.
    *   **Matrix:**
        *   **Admin:** Full access (CRUD Users, View Logs).
        *   **Host (Faculty):** Approve/Reject Visits assigned to them.
        *   **Security:** Verify Passes, Mark Entry, Approve Visits (as Host).
        *   **Visitor/Student:** Create Visit Request, View Own History.

*   **2.2 Policy Definition & Justification**
    *   *Why?* To prevent privilege escalation. For example, a student cannot approve their own gate pass; only a Faculty member can.
    *   *Where?* Defined in `backend/src/routes/*.routes.js`.

*   **2.3 Implementation**
    *   **Code Location:** `backend/src/middleware/auth.middleware.js`.
    *   **Mechanism:** Middleware functions `protect` (verifies JWT) and `authorize(...roles)` (checks if user role is in the allowed list) are applied to specific routes.
    *   **Example:** `router.post('/verify', authorize('security', 'admin'), verifyPass)` restricts verification to Security/Admin.

### Component 3: Encryption
**Objective:** Protect confidentiality of data.

*   **3.1 Key Generation / Handling**
    *   **Implementation:** Key derivation using `scrypt`.
    *   **Code Location:** `backend/src/utils/crypto.js`
    *   **Mechanism:** Uses `crypto.scryptSync` to derive a secure 32-byte key from the application secret (`JWT_SECRET`) and a salt. This ensures the encryption key is cryptographically strong even if the secret is a simple string.

*   **3.2 Encryption & Decryption (AES)**
    *   **Implementation:** Protection of Personally Identifiable Information (Phone Numbers).
    *   **Code Location:** `backend/src/utils/crypto.js` & `backend/src/models/User.js`.
    *   **Mechanism:** 
        *   **Algorithm:** AES-256-CBC (Advanced Encryption Standard).
        *   **Flow:** When a user registers, their phone number is encrypted before saving to MongoDB. When an Admin views the user list, it is explicitly decrypted.

### Component 4: Hashing & Digital Signature
**Objective:** Ensure integrity and password security.

*   **4.1 Hashing with Salt**
    *   **Implementation:** Password Storage.
    *   **Code Location:** `backend/src/models/User.js` -> Pre-save hook.
    *   **Mechanism:** Uses `bcrypt`. `bcrypt` automatically generates a random **salt** for every password and hashes it using the Blowfish cipher. This prevents Rainbow Table attacks.

*   **4.2 Digital Signature**
    *   **Implementation:** QR Code Tamper Protection.
    *   **Code Location:** `backend/src/controllers/gatepass.controller.js` -> `generatePass`.
    *   **Mechanism:** 
        *   **HMAC-SHA256**: Keyed-Hash Message Authentication Code.
        *   The system takes the pass data (ID, Name, Expiry) and signs it using the server's secret key (`JWT_SECRET`).
        *   The signature is embedded in the QR code.
        *   **Verification:** When Security scans the code, the server re-calculates the signature. If the data in the QR code was modified (e.g., changing expiry date), the signatures won't match, and access is denied.

### Component 5: Encoding
**Objective:** Data representation.

*   **5.1 Encoding Implementation**
    *   **Implementation:** QR Code Generation.
    *   **Code Location:** `backend/src/controllers/gatepass.controller.js`.
    *   **Mechanism:** The JSON payload containing pass details and the digital signature is **Encoded** into a 2D Matrix Barcode (QR Code) using the `qrcode` library. This allows for rapid machine reading.

---

## 3. Viva Voce Questions & Answers

### Topic: Authentication & Authorization
**Q1: What is the difference between Authentication and Authorization?**
*   **A:** Authentication (AuthN) verifies **who you are** (e.g., logging in with password/OTP). Authorization (AuthZ) verifies **what you can do** (e.g., an Admin can delete users, a Student cannot).

**Q2: Why did we use OTP for Visitors?**
*   **A:** Visitors often use temporary or weak passwords. OTP (Multi-Factor Authentication) adds a layer of security by verifying they have access to the email address provided, mitigating risks if their password is compromised.

**Q3: Explain the "Least Privilege Principle" in your project.**
*   **A:** We applied this by creating specific roles. For instance, the 'Security' role can verify passes but cannot delete users. This limits the damage if a Security account is compromised.

### Topic: Encryption & Hashing
**Q4: Why use Hashing for passwords instead of Encryption?**
*   **A:** Encryption is reversible (you can get the original password back with a key). Hashing is **one-way**. Even if the database is stolen, the attacker gets hashes, not actual passwords. This is standard practice for password storage.

**Q5: Why did you use `bcrypt` instead of `MD5` or `SHA256`?**
*   **A:** MD5 and SHA256 are fast. Attackers can compute billions of hashes per second to brute-force them. `bcrypt` is designed to be **slow** (computationally expensive) and includes a **Work Factor**, making brute-force attacks significantly harder. It also handles salting automatically.

**Q6: What is the purpose of the 'Salt' in hashing?**
*   **A:** A Salt is random data added to the password before hashing. It prevents **Rainbow Table Attacks** (using precomputed lists of hashes) and ensures that two users with the same password ("password123") have different hashes.

**Q7: In your project, you encrypt Phone Numbers. Why?**
*   **A:** Phone numbers are PII (Personally Identifiable Information). Encrypting them ensures privacy compliance. If the DB is leaked, the phone numbers remain unreadable without the specific decryption key.

### Topic: Digital Signatures & Attacks
**Q8: How does your QR code prevent tampering? (e.g., A student changes the expiry date in the QR string)**
*   **A:** We use a **Digital Signature (HMAC)**. The QR contains data + a signature derived from that data + a secret key.
    *   If a student changes `"exp": "10:00"` to `"exp": "12:00"`, the signature on the server won't match the signature of the new data because the student doesn't have the Server's Secret Key to generate a valid new signature.

**Q9: What is a Replay Attack, and how might it apply here?**
*   **A:** A Replay Attack is when an attacker uses a valid captured signal (like a screenshot of a valid QR code) at a later time.
    *   *Countermeasure:* Our Gate Pass has an `expectedExitTime` and a status check in the database. Even if they replay the QR, if the pass is expired or already marked 'Checked-Out', the server rejects it.

**Q10: What is SQL Injection, and is your project vulnerable?**
*   **A:** SQL Injection involves checking malicious SQL commands into input fields to manipulate the database.
    *   *Our Project:* We use **MongoDB (NoSQL)**, so traditional SQL injection isn't possible. However, NoSQL Injection is a risk. We mitigate this by using Mongoose Object Data Modeling (ODM), which sanitizes inputs and parameters, preventing direct query manipulation.

**Q11: What is XSS (Cross-Site Scripting)?**
*   **A:** XSS is when an attacker injects malicious scripts into web pages viewed by other users.
    *   *Our Project:* React escapes content by default before rendering, preventing most XSS. We also validate inputs on the backend.
