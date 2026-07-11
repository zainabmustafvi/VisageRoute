const mongoose = require('mongoose');

const busRouteAssignmentSchema = new mongoose.Schema({
    busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        required: true
    },
    routeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusRoute',
        required: true
    },
    scheduleTime: {
        type: String, // e.g. "08:00 AM - 04:00 PM"
        required: true
    },
    pickupTime: {
        type: String,
        required: false
    },
    dropTime: {
        type: String,
        required: false
    },
    daysOfWeek: {
        type: [Number], // 0 for Sunday, 1 for Monday, etc.
        default: [1, 2, 3, 4, 5] // Default Mon-Fri
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tripName: {
        type: String,
        required: false
    },
    fileName: {
        type: String, // For tracking the source file
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('BusRouteAssignment', busRouteAssignmentSchema);
