const mongoose = require('mongoose');

const locationTrackingSchema = new mongoose.Schema({
    busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    speed: {
        type: Number,
        default: 0
    },
    accuracy: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for geo-spatial queries if needed later
locationTrackingSchema.index({ latitude: 1, longitude: 1 });
locationTrackingSchema.index({ busId: 1, timestamp: -1 });

module.exports = mongoose.model('LocationTracking', locationTrackingSchema);
