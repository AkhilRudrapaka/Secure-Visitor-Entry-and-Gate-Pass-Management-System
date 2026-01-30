const User = require('../models/User');

// @desc    Get all hosts (for visitor dropdown)
// @route   GET /api/users/hosts
// @access  Private
exports.getHosts = async (req, res, next) => {
    try {
        let filterRole = 'faculty'; // Default for students

        if (req.user.role === 'visitor') {
            filterRole = 'security';
        }

        const hosts = await User.find({ role: filterRole }).select('name email department');
        res.status(200).json({ success: true, data: hosts });
    } catch (err) {
        next(err);
    }
};
