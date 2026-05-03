const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    plateNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    model: {
        type: String,
        required: true,
        trim: true,
    },
    capacity: {
        type: Number,
        required: true,
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
