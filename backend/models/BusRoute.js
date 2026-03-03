const mongoose = require('mongoose');

const busRouteSchema = new mongoose.Schema({
    routeName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxLength: 50, // Security: Length limit
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Driver can be assigned later
    },
    schedule: {
        departureTime: String,
        arrivalTime: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('BusRoute', busRouteSchema);
