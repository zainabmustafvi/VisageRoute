const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetRole: {
        type: String,
        default: 'Specific'
    },
    recipients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
