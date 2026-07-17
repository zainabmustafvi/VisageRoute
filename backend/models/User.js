const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Legacy/non-unique userId for display only.
    // Identity must be enforced via email + password.
    userId: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'parent', 'driver'],
        required: true,
    },
    notificationPreferences: {
        arrival_notify: { type: Boolean, default: true },
        start_notify: { type: Boolean, default: true },
        onboard_notify: { type: Boolean, default: true }
    },
    fcmToken: {
        type: String,
        default: null
    },
    resetCode: {
        type: String,
        default: null
    },
    resetCodeExpiry: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);