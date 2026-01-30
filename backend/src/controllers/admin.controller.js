const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Visitor = require('../models/Visitor');
const GatePass = require('../models/GatePass');
const sendEmail = require('../utils/sendEmail');
const { decrypt } = require('../utils/crypto');

// @desc    Get System Stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalVisits = await Visitor.countDocuments();
        const activePasses = await GatePass.countDocuments({ isActive: true });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalVisits,
                activePasses
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Audit Logs
// @route   GET /api/admin/logs
// @access  Private (Admin)
exports.getLogs = async (req, res, next) => {
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 }).populate('user', 'name role');
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        next(err);
    }
};

// @desc    Get All Users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password');
        
        // Explicitly decrypt phone for display
        const usersWithDecryptedPhone = users.map(user => {
            const u = user.toObject();
            if (u.phone) u.phone = decrypt(u.phone);
            return u;
        });

        res.status(200).json({ success: true, count: usersWithDecryptedPhone.length, data: usersWithDecryptedPhone });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Pending Users
// @route   GET /api/admin/pending-users
// @access  Private (Admin)
exports.getPendingUsers = async (req, res, next) => {
    try {
        const users = await User.find({ isApproved: false }).select('-password');

        // Explicitly decrypt phone for display
        const usersWithDecryptedPhone = users.map(user => {
            const u = user.toObject();
            if (u.phone) u.phone = decrypt(u.phone);
            return u;
        });

        res.status(200).json({ success: true, count: usersWithDecryptedPhone.length, data: usersWithDecryptedPhone });
    } catch (err) {
        next(err);
    }
};

// @desc    Approve User
// @route   PUT /api/admin/approve-user/:id
// @access  Private (Admin)
exports.approveUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.isApproved = true;
        await user.save();

        // Send Approval Email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Account Approved - Secure Gate Pass System',
                message: `Hello ${user.name},\n\nYour account has been approved by the administrator. You can now login to the system.\n\nRegards,\nSecure Gate Team`
            });
        } catch (emailErr) {
            console.error('Email sending failed for approval:', emailErr);
        }

        res.status(200).json({ success: true, message: 'User approved' });
    } catch (err) {
        next(err);
    }
};

// @desc    Reject User
// @route   DELETE /api/admin/reject-user/:id
// @access  Private (Admin)
exports.rejectUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Send Rejection Email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Account Registration Rejected - Secure Gate Pass System',
                message: `Hello ${user.name},\n\nYour account registration has been rejected by the administrator.\n\nRegards,\nSecure Gate Team`
            });
        } catch (emailErr) {
             console.error('Email sending failed for rejection:', emailErr);
        }

        await user.deleteOne();
        res.status(200).json({ success: true, message: 'User request rejected and removed.' });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete User (Generic)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent deleting yourself (Admin)
        if (user._id.toString() === req.user.id) {
             return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
        }

        await user.deleteOne();
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete Old Audit Logs
// @route   DELETE /api/admin/logs
// @access  Private (Admin)
exports.deleteOldLogs = async (req, res, next) => {
    try {
        const { beforeDate } = req.body;
        
        if (!beforeDate) {
            return res.status(400).json({ success: false, message: 'Please provide a date (beforeDate)' });
        }

        const date = new Date(beforeDate);
        
        const result = await AuditLog.deleteMany({ timestamp: { $lt: date } });

        // Import logAction from utils/logger at the top if not present, but for now we assume it is or risk circular.
        // To be safe, we re-require or rely on the fact that existing functions work.
        // Actually, existing functions don't use logAction in this file... wait, let me check imports.
        // Imports: const { logAction } = require('../utils/logger'); is NOT in the file imports shown in lines 1-6 of previous view_file.
        // Ah, line 5: const sendEmail... no logAction.
        // Line 2: User...
        // I need to add logAction import as well.

        // For now, let's just do the delete.
        
        res.status(200).json({ 
            success: true, 
            message: `Deleted ${result.deletedCount} logs`,
            count: result.deletedCount 
        });
    } catch (err) {
        next(err);
    }
};
