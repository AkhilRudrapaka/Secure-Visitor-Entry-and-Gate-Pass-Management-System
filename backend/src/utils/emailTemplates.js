
const getOtpEmailTemplate = (otp, title = 'Authentication Required') => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0f1219; /* bg-dark */
            color: #e2e8f0; /* text-main */
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .glass-card {
            background-color: #1a1e26; /* bg-card fallback */
            border: 1px solid rgba(255, 255, 255, 0.08); /* glass border */
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
            text-align: center;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #7c5dfa; /* primary */
            margin-bottom: 20px;
            letter-spacing: 1px;
            text-transform: uppercase;
            background: linear-gradient(135deg, #a78bfa, #5eead4); /* primary-light to secondary */
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: inline-block;
        }
        .title {
            font-size: 20px;
            margin-bottom: 20px;
            color: #f1f5f9;
        }
        .otp-box {
            background: rgba(124, 93, 250, 0.1); /* primary with opacity */
            border: 1px solid rgba(124, 93, 250, 0.3);
            border-radius: 8px;
            padding: 15px;
            font-size: 32px;
            font-weight: bold;
            color: #7c5dfa; /* primary */
            letter-spacing: 5px;
            margin: 30px 0;
            display: inline-block;
        }
        .message {
            color: #94a3b8; /* text-muted */
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #64748b;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(124, 93, 250, 0.5), transparent);
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="glass-card">
            <!-- Logo/Header -->
            <div style="margin-bottom: 20px;">
                 <h1 style="margin: 0; font-size: 28px; background: linear-gradient(135deg, #a78bfa, #2dd4bf); -webkit-background-clip: text; -webkit-text-fill-color: transparent; color: #a78bfa;">SecureGate</h1>
            </div>
            
            <div class="divider"></div>

            <h2 class="title">${title}</h2>
            
            <p class="message">
                For security reasons, we require you to verify your identity. <br>
                Please use the One-Time Password (OTP) below to complete your request.
            </p>

            <div class="otp-box">
                ${otp}
            </div>

            <p class="message" style="font-size: 12px;">
                This code is valid for <strong>5 minutes</strong>.<br>
                If you did not request this code, please ignore this email or contact support immediately.
            </p>

            <div class="divider"></div>

            <div class="footer">
                &copy; ${new Date().getFullYear()} SecureGate System. All rights reserved.<br>
                <span style="opacity: 0.7;">Secure Access Management</span>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = { getOtpEmailTemplate };
