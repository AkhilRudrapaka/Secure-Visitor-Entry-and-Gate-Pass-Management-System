# Secure Visitor Entry & Gate Pass Management System

A Production-Ready, Role-Based Visitor Management System built with the MERN Stack.

## 🚀 Project Overview

This system digitizes the traditional gate pass process, offering a secure, efficient, and paperless solution for managing visitors in institutions. It features Role-Based Access Control (RBAC), QR Code generation for entry, and comprehensive audit logging.

### 🔑 Key Features

- **Role-Based Dashboards**: Distinct interfaces for Admin, Security, Host, and Visitor.
- **Secure Authentication**: JWT-based auth with HTTP-Only cookies and Refresh mechanism.
- **QR Code Entry**: Dynamic QR generation for visitors; "Scan" verification for security.
- **Approval Workflow**: Hosts can approve/reject visits in real-time.
- **Data Security**: AES-256 Encryption for sensitive fields (e.g., Phone numbers).
- **Audit Logging**: Immutable logs for all system actions.
- **Modern UI**: Glassmorphism design using React + CSS Modules.

---

## 🛠 Tech Stack

| Component     | Technology                                                    |
| ------------- | ------------------------------------------------------------- |
| **Frontend**  | React (Vite), Context API, Vanilla CSS (Styled), Lucide Icons |
| **Backend**   | Node.js, Express.js                                           |
| **Database**  | MongoDB (Mongoose)                                            |
| **Security**  | BCrypt, JWT, Helmet, CORS, AES-256                            |
| **Utilities** | QRCode, Morgan (Logging), Dotenv                              |

---

## 🏗 Architecture & Design

### Database Schema (ER Diagram Description)

- **Users**: Stores credentials, roles, and encrypted personal info.
- **Visitors**: Stores visit requests linked to `User` (Visitor) and `User` (Host).
- **GatePass**: Stores generated QR payloads, validity periods, and active status.
- **AuditLog**: Stores security events (Who, What, When, IP).

### Security Architecture

1.  **Transport Layer**: All API calls expected over HTTPS (Localhost for dev).
2.  **Access Control**: Middleware verifies JWT signature and User Role before Controller access.
3.  **Data Protection**:
    - Passwords Hashed (Bcrypt).
    - Phone Numbers Encrypted (AES-256).
    - Input Sanitization (Mongoose validation).

---

## ⚡ Setup Instructions

### Prerequisites

- Node.js (v16+)
- MongoDB (Local running on port 27017)

### 1. Backend Setup

```bash
cd backend
npm install
# Start Server
npm.cmd run dev
# Server generally runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd client
npm install
# Start React App
npm.cmd run dev
# App generally runs on http://localhost:5173
```

### 3. Usage Guide

1.  **Register** an account (First user becomes Admin, or select Role).
2.  **Login** to access your dashboard.
3.  **Visitor**: Navigate to "New Visit", select a Host, and submit.
4.  **Host**: Login, see "Pending Requests", and Click Approve.
5.  **Visitor**: Refresh dashboard, click "View Pass" to see QR.
6.  **Security**: Login, go to Dashboard, "Scan" (Paste) the QR code string to verify.

---

## 📸 Future Enhancements

- Mobile App integration using React Native.
- Email/SMS Notifications (AWS SES / Twilio).
- Kiosk Mode for self-registration at gates.

---

**Developed for Academic Evaluation**
