const User = require('../models/User');

// @desc    Get all hosts (for visitor dropdown)
// @route   GET /api/users/hosts
// @access  Private
exports.getHosts = async (req, res, next) => {
    try {
        const hosts = await User.find({ role: { $in: ['host', 'faculty'] } }).select('name email department');
        res.status(200).json({ success: true, data: hosts });
    } catch (err) {
        next(err);
    }
};
