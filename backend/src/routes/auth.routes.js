const express = require('express');
const { register, login, logout, getMe, forgotPassword, resetPassword, verifyOTP, resendOTP, toggle2FA } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.put('/toggle-2fa', protect, toggle2FA);

module.exports = router;
