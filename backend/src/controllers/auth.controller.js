const User = require('../models/User');
const { logAction } = require('../utils/logger');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, phone, department } = req.body;

        const cleanEmail = email ? email.trim().toLowerCase() : '';
        const cleanName = name ? name.trim() : '';
        const cleanPhone = phone ? phone.trim() : '';

        // Check if this is the first user (make them admin)
        // Check if this is the first user (make them admin)
        const isFirstAccount = (await User.countDocuments({})) === 0;
        
        let finalRole = role || 'visitor';

        if (isFirstAccount) {
            finalRole = 'admin';
        } else if (role === 'admin') {
            return res.status(403).json({ success: false, message: 'Admin registration is restricted.' });
        }

        const user = await User.create({
            name: cleanName,
            email: cleanEmail,
            password,
            role: finalRole,
            phone: cleanPhone,
            department,
            twoFactorEnabled: true // Enforce 2FA for everyone by default
        });

        await logAction(user._id, 'register', `User ${name} registered as ${finalRole}`);

        const token = user.getSignedJwtToken();
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        console.log(`Login attempt for: ${email}`);

        const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

        if (!user) {
            console.log(`Login failed: User not found for email: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            console.log(`Login failed: Password mismatch for user: ${email}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // MANDATORY OTP FLOW
        // Always generate and send OTP regardless of user preference
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP (hashed) and expiry (5 minutes)
        user.twoFactorSecret = crypto.createHash('sha256').update(otp).digest('hex');
        user.otpExpire = Date.now() + 5 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        // Send OTP via email
        try {
            const transporter = nodemailer.createTransport({
                service: process.env.EMAIL_SERVICE,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            await transporter.sendMail({
                from: `SecureGate <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Your Login OTP Code',
                text: `Your OTP code is: ${otp}\n\nThis code will expire in 5 minutes.`
            });

            await logAction(user._id, 'otp_sent', `OTP sent to ${user.email}`, req);

            return res.status(200).json({
                success: true,
                requiresOTP: true,
                message: 'OTP sent to your email'
            });
        } catch (err) {
            console.error('Email error:', err);
            return res.status(500).json({ success: false, message: 'Failed to send OTP' });
        }
    } catch (error) {
        console.error('LOGIN ERROR:', error);
        res.status(500).json({ success: false, message: error.stack || error.message });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    try {
        await logAction(req.user.id, 'logout', `User ${req.user.name} logged out`, req);
        
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 1 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ success: false, message: 'No user found with that email' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire (10 minutes)
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5174'}/reset-password?token=${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.`;

        try {
            // Send email
            const transporter = nodemailer.createTransport({
                service: process.env.EMAIL_SERVICE,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            await transporter.sendMail({
                from: `SecureGate <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Password Reset Request',
                text: message
            });

            await logAction(user._id, 'password_reset_request', `Password reset requested for ${user.email}`);

            res.status(200).json({ success: true, message: 'Email sent successfully' });
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify OTP for 2FA login
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.findOne({
            email: email.toLowerCase(),
            twoFactorSecret: hashedOTP,
            otpExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Clear OTP
        user.twoFactorSecret = undefined;
        user.otpExpire = undefined;
        await user.save({ validateBeforeSave: false });

        await logAction(user._id, 'login', `User ${user.name} logged in with 2FA`);

        const token = user.getSignedJwtToken();

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        user.twoFactorSecret = crypto.createHash('sha256').update(otp).digest('hex');
        user.otpExpire = Date.now() + 5 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        // Send email
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `SecureGate <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Your New Login OTP Code',
            text: `Your new OTP code is: ${otp}\n\nThis code will expire in 5 minutes.`
        });

        res.status(200).json({ success: true, message: 'New OTP sent' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Toggle 2FA on/off
// @route   PUT /api/auth/toggle-2fa
// @access  Private
exports.toggle2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        user.twoFactorEnabled = !user.twoFactorEnabled;
        await user.save();

        await logAction(user._id, 'toggle_2fa', `2FA ${user.twoFactorEnabled ? 'enabled' : 'disabled'}`);

        res.status(200).json({
            success: true,
            twoFactorEnabled: user.twoFactorEnabled,
            message: `2FA ${user.twoFactorEnabled ? 'enabled' : 'disabled'} successfully`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.body.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        await logAction(user._id, 'password_reset', `Password reset successful for ${user.email}`);

        const token = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            token,
            message: 'Password reset successful'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
