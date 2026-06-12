const mongoose = require('mongoose');

const announcementDeliverySchema = new mongoose.Schema({
    announcementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Announcement',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['sent', 'failed'],
        default: 'sent'
    },
    sentAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('AnnouncementDelivery', announcementDeliverySchema);
