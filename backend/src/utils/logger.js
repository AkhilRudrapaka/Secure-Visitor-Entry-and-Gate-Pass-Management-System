const AuditLog = require('../models/AuditLog');

const logAction = async (userId, action, details, req) => {
    try {
        await AuditLog.create({
            user: userId,
            action,
            details,
            ipAddress: req?.ip || req?.connection?.remoteAddress,
            userAgent: req?.get('User-Agent')
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

module.exports = { logAction };
