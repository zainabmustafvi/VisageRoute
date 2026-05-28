const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        required: true,
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true,
    },
    date: {
        type: String, // format: YYYY-MM-DD
        required: true,
    },
    boardingTime: {
        type: Date,
        default: Date.now,
    },
    alightingTime: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['boarded', 'dropped_off', 'absent'],
        default: 'boarded',
    },
    verificationMethod: {
        type: String,
        enum: ['face', 'manual'],
        default: 'face',
    },
}, { timestamps: true });

// Ensure unique attendance per student per day
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
