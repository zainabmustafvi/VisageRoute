const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    recipients: {
        type: {
            type: String,
            enum: ['all', 'route', 'bus'],
            default: 'all'
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false // Only required if type is 'route' or 'bus'
        }
    },
    deliveryOptions: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: false }
    },
    priority: {
        type: String,
        enum: ['normal', 'urgent'],
        default: 'normal'
    },
    isSent: {
        type: Boolean,
        default: false
    },
    sentAt: {
        type: Date
    },
    scheduledFor: {
        type: Date
    },
    readBy: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
