const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        maxLength: 15,
    },
    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    address: {
        type: String,
        required: false,
        trim: true,
    },
    licenseNumber: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxLength: 20,
    },
    licenseClass: {
        type: String,
        required: true,
        enum: ['Class A', 'Class B', 'Class C'],
        default: 'Class C',
    },
    licenseExpiry: {
        type: Date,
        required: true,
    },
    // Legacy display-only field — not used for identity lookups
    userId: {
        type: String,
        required: false,
        sparse: true,
    },
    // Modern reference: ObjectId link to the User account (optional for backward compat)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        sparse: true,
    },
    assignedBusId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
    },
    rating: {
        type: Number,
        default: 5.0,
    },
    totalTrips: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    wentOnlineAt: {
        type: Date,
        required: false,
    }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);

