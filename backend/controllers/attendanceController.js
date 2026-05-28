const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const { compareEmbeddings, extractFaceEmbedding } = require('../utils/faceService');
const { getIo } = require('../config/socket');

// @desc    Get all students assigned to a specific bus
// @route   GET /api/attendance/students/:busId
// @access  Private/Driver
const getStudentsByBus = async (req, res) => {
    try {
        const { busId } = req.params;
        const students = await Student.find({ busId }).select('name parentId faceEmbedding');
        
        // Return students with basic info and attendance status for today
        const today = new Date().toISOString().split('T')[0];
        const attendances = await Attendance.find({ busId, date: today });
        
        const studentsWithStatus = students.map(student => {
            const att = attendances.find(a => a.studentId.toString() === student._id.toString());
            return {
                _id: student._id,
                name: student.name,
                parentId: student.parentId,
                hasBoarded: !!att,
                boardingTime: att ? att.boardingTime : null
            };
        });

        res.json(studentsWithStatus);
    } catch (err) {
        res.status(500).json({ error: 'Server Error fetching students' });
    }
};

// @desc    Verify face embedding or image and log attendance
// @route   POST /api/attendance/verify
// @access  Private/Driver
const verifyAttendance = async (req, res) => {
    try {
        const { embedding, imageBase64, bus_id, driver_id } = req.body;

        if (!bus_id || !driver_id) {
            return res.status(400).json({ error: 'Missing bus_id or driver_id' });
        }

        // 1. Get current embedding (either from request or by processing image)
        let currentEmbedding = embedding;
        if (!currentEmbedding && imageBase64) {
            currentEmbedding = await extractFaceEmbedding(imageBase64);
        }

        if (!currentEmbedding) {
            return res.status(400).json({ error: 'No face detected or embedding provided' });
        }

        // 2. Fetch all students on this bus who haven't boarded today
        const today = new Date().toISOString().split('T')[0];
        const students = await Student.find({ busId: bus_id }).select('name faceEmbedding parentId');
        const loggedAttendances = await Attendance.find({ busId: bus_id, date: today }).select('studentId');
        const loggedIds = loggedAttendances.map(a => a.studentId.toString());

        let matchFound = null;
        let minDistance = 1.0;

        for (const student of students) {
            if (loggedIds.includes(student._id.toString())) continue;
            if (!student.faceEmbedding || student.faceEmbedding.length === 0) continue;

            const distance = compareEmbeddings(currentEmbedding, student.faceEmbedding);
            if (distance < 0.5) { // Strict threshold for safety
                if (distance < minDistance) {
                    minDistance = distance;
                    matchFound = student;
                }
            }
        }

        if (!matchFound) {
            return res.status(404).json({ error: 'Identity not found' });
        }

        // 3. Log Attendance
        const newAttendance = new Attendance({
            studentId: matchFound._id,
            busId: bus_id,
            driverId: driver_id,
            date: today,
            boardingTime: new Date(),
            status: 'boarded',
            verificationMethod: 'face'
        });

        await newAttendance.save();

        // 4. Notify Parent via Socket.io
        try {
            const io = getIo();
            io.to(matchFound.parentId.toString()).emit('attendanceUpdate', {
                studentName: matchFound.name,
                status: 'boarded',
                time: newAttendance.boardingTime,
                message: `Your child ${matchFound.name} has safely boarded the bus.`
            });
        } catch (socketErr) {
            console.error('Socket notification failed:', socketErr.message);
        }

        res.json({
            message: `Attendance Logged - ${matchFound.name} confirmed`,
            student: {
                _id: matchFound._id,
                name: matchFound.name,
                boardingTime: newAttendance.boardingTime
            }
        });

    } catch (err) {
        console.error('Attendance Verification Error:', err);
        res.status(500).json({ error: 'Server Error verifying attendance' });
    }
};

module.exports = {
    getStudentsByBus,
    verifyAttendance
};
