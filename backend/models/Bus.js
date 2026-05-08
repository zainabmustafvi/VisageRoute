const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    busNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    plateNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    gpsDeviceId: {
        type: String,
        unique: true,
        sparse: true, // Allow nulls while maintaining uniqueness
    },
    status: {
        type: String,
        enum: ['available', 'in-use', 'maintenance'],
        default: 'available',
    },
    lastMaintenance: {
        type: Date,
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: false,
    },
    assignedStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);
