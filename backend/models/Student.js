const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100, // Security: Length limit
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    busRouteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusRoute',
        required: false, // Can be assigned later by admin
    },
    embeddingHash: {
        type: String,
        required: false, // Populated when face is registered
    },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
