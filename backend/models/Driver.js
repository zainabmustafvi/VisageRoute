const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        maxLength: 15,
    },
    licenseNumber: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxLength: 20,
    },
    userId: {
        type: String, // Maps to the User collection if needed for auth linkage
        required: false,
    },
    routeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusRoute',
    }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
