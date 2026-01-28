const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Define email options
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Secure Gate Pass'} <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html // Optional HTML content
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
