const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // The visitor's user account
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // The host being visited
    },
    purpose: {
        type: String,
        required: true
    },
    expectedEntryTime: {
        type: Date,
        required: true
    },
    expectedExitTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'checked-in', 'checked-out', 'cancelled'],
        default: 'pending'
    },
    remarks: {
        type: String
    },
    additionalGuests: {
        type: Number,
        default: 0
    },
    checkInTime: {
        type: Date
    },
    checkOutTime: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Visitor', VisitorSchema);
