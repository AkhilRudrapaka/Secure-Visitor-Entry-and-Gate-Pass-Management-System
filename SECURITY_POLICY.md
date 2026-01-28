# Security Policy & Implementation Documentation

## 1. Access Control Policy (Authorization)

### Access Control Matrix
This project implements a Role-Based Access Control (RBAC) model defining explicit permissions for each Subject (Role) over Objects (Resources).

| Subject (Role) | Object (Resource) | Permission | Justification |
| :--- | :--- | :--- | :--- |
| **Admin** | User Data | Read/Write | Admin needs to manage users and oversee system security. |
| **Admin** | Audit Logs | Read Only | Admin must monitor system activity for security breaches but not tamper with logs. |
| **Host/Faculty** | Gate Pass Request | Approve/Reject | Only authorized hosts can verify the purpose of a visit. |
| **Student** | Pass Request | Create/View Own | Students need to apply for leave/outings but cannot approve their own. |
| **Visitor** | Pass Request | Create/View Own | Visitors need to request entry but cannot access internal data. |
| **Security** | Gate Pass | Verify/Scan | Security staff need to validate passes at the physical gate. |

---

## 2. Cryptographic Mechanisms (Encryption & Hashing)

### A. Hosting & Password Security
*   **Algorithm:** Bcrypt (Blowfish-based variant).
*   **Salt:** Automatic salt generation (10 rounds).
*   **Implementation:** `User.js` pre-save hook.
*   **Why:** Prevents Rainbow Table attacks; even if the database is leaked, passwords remain secure.

### B. Data Encryption (Confidentiality)
*   **Algorithm:** AES-256-CBC (Advanced Encryption Standard).
*   **Key Management:** Keys derived securely from `JWT_SECRET` using `scrypt`.
*   **Usage:** Personally Identifiable Information (PII) like **Phone Numbers** are encrypted before storage.
*   **Why:** Protects sensitive user contact details from unauthorized database access.

### C. Digital Signatures (Integrity)
*   **Mechanism:** JSON Web Token (JWT).
*   **Algorithm:** HMAC-SHA256.
*   **Usage:** Authentication tokens are signed by the server.
*   **Why:** Prevents "Token Tampering". A user cannot modify their role inside the cookie from 'visitor' to 'admin' because the signature would become invalid.

---

## 3. Authentication Policy

### Multi-Factor Authentication (MFA)
*   **Factor 1 (Something you know):** Password.
*   **Factor 2 (Something you have):** Email Access (OTP).
*   **Enforcement:** Mandatory for ALL logins.
*   **Session Management:** Login requires valid credentials AND a fresh 6-digit OTP verified within 5 minutes.

---

## 4. Attack Countermeasures

This application is engineered to prevent common OWASP vulnerabilities:

| Attack Vector | Countermeasure Implemented | Code Reference |
| :--- | :--- | :--- |
| **SQL Injection** | **NoSQL Injection Prevention**: Using Mongoose ODM with sanitized inputs. We do not use raw queries. | `auth.controller.js` |
| **XSS (Cross-Site Scripting)** | **React Output Escaping**: React automatically escapes logic before rendering. | Frontend Components |
| **CSRF (Cross-Site Request Forgery)** | **SameSite Cookies**: Session tokens are stored in HTTPOnly cookies. | `auth.controller.js` (Cookie settings) |
| **Privilege Escalation** | **Backend Validation**: Admin role registration is strictly blocked by logic unless it is the first user. | `auth.controller.js` (`isFirstAccount`) |
| **Brute Force** | **OTP Expiry**: OTPs expire in 5 minutes and are one-time use. | `auth.controller.js` (`otpExpire`) |

---

## 5. Encoding Implementation
*   **Technique:** QR Code (2D Barcode).
*   **Usage:** Gate Pass data is encoded into a visual QR code.
*   **Format:** The payload includes a unique 9-digit Validation Code.
