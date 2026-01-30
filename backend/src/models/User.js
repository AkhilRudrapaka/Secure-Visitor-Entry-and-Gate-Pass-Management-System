const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { encrypt, decrypt } = require('../utils/crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true, // Automatically convert to lowercase
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'security', 'visitor', 'student', 'faculty'],
        default: 'visitor'
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    department: {
        type: String,
        // Only for hosts
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    twoFactorEnabled: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: true // Default true for everyone, but overridden for restricted roles in controller
    },
    twoFactorSecret: String, // Stores OTP temporarily
    otpExpire: Date, // OTP expiration time
    tempEmail: String,
    tempEmailSecret: String,
    tempEmailExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: {
        transform: function (doc, ret) {
            if (ret.phone) ret.phone = decrypt(ret.phone);
            delete ret.password;
            delete ret.__v;
        }
    },
    toObject: {
        transform: function (doc, ret) {
            if (ret.phone) ret.phone = decrypt(ret.phone);
        }
    }
});

// Encrypt phone and hash password
// Encrypt phone and hash password
UserSchema.pre('save', async function () {
    try {
        if (this.isModified('phone')) {
            this.phone = encrypt(this.phone);
        }

        if (!this.isModified('password')) {
            return;
        }
        
        console.log('Hashing password for user:', this.email);
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        console.error('Error in pre-save hook:', error);
        throw error;
    }
});


// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Sign Refresh Token
UserSchema.methods.getRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.REFRESH_SECRET, {
        expiresIn: process.env.REFRESH_EXPIRE
    });
};

module.exports = mongoose.model('User', UserSchema);
