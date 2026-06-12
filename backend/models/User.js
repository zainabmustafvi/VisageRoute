const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
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
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
