const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
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
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    parentName: {
        type: String,
        required: true,
        trim: true,
    },
    parentEmail: {
        type: String,
        required: true,
        trim: true,
    },
    department: {
        type: String,
        trim: true,
    },
    rollNo: {
        type: String,
        trim: true,
    },
    year: {
        type: String,
        trim: true,
    },
    semester: {
        type: String,
        trim: true,
    },
    pickupPoint: {
        type: String,
        trim: true,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    faceEmbedding: {
        type: [Number], // 128-d face embedding array
        required: false,
    },
    busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        required: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
