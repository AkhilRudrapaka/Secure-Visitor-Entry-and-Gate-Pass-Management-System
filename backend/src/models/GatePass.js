const mongoose = require('mongoose');

const GatePassSchema = new mongoose.Schema({
    visitorRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visitor',
        required: true
    },
    passCode: {
        type: String,
        required: true,
        unique: true
    },
    validFrom: {
        type: Date,
        required: true
    },
    validUntil: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GatePass', GatePassSchema);
