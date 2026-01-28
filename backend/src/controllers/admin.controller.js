const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Visitor = require('../models/Visitor');
const GatePass = require('../models/GatePass');

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
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        next(err);
    }
};
