const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const { cosineSimilarity, extractFaceEmbedding } = require('../utils/faceService');
const { getIo } = require('../config/socket');

const getTodayString = () => new Date().toISOString().split('T')[0];

// @desc    Get all students assigned to a specific bus
// @route   GET /api/attendance/students/:busId
// @access  Private/Driver
const getStudentsByBus = async (req, res) => {
    try {
        const { busId } = req.params;
        const students = await Student.find({ busId }).select('name parentId faceEmbedding');

        const today = getTodayString();
        const attendances = await Attendance.find({ busId, date: today });

        const studentsWithStatus = students.map(student => {
            const att = attendances.find(a => a.studentId.toString() === student._id.toString());
            return {
                _id: student._id,
                name: student.name,
                parentId: student.parentId,
                hasBoarded: !!att,
                boardingTime: att ? att.boardingTime : null,
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

        const useClientEmbedding = Array.isArray(embedding) && embedding.length === 128;

        let currentEmbedding = useClientEmbedding ? embedding : null;
        if (!currentEmbedding && imageBase64) {
            currentEmbedding = await extractFaceEmbedding(imageBase64);
        }

        if (!currentEmbedding || currentEmbedding.length !== 128) {
            return res.status(400).json({ error: 'No face detected or embedding provided' });
        }

        const today = getTodayString();
        const students = await Student.find({ busId: bus_id }).select('name faceEmbedding parentId');

        let matchFound = null;
        let bestScore = 0;

        for (const student of students) {
            if (!student.faceEmbedding || student.faceEmbedding.length === 0) continue;
            const score = cosineSimilarity(currentEmbedding, student.faceEmbedding);
            if (score > bestScore) {
                bestScore = score;
                matchFound = student;
            }
        }

        if (bestScore < 0.6 || !matchFound) {
            return res.status(404).json({ message: 'Face not recognized' });
        }

        const existing = await Attendance.findOne({
            studentId: matchFound._id,
            date: today,
        });

        if (existing) {
            return res.status(409).json({
                message: 'Attendance already marked today',
                student: {
                    _id: matchFound._id,
                    name: matchFound.name,
                    boardingTime: existing.boardingTime,
                },
            });
        }

        const boardingTime = new Date();
        const newAttendance = await Attendance.create({
            studentId: matchFound._id,
            busId: bus_id,
            driverId: driver_id,
            date: today,
            boardingTime,
            status: 'boarded',
            verificationMethod: 'face',
        });

        // After attendance saved successfully:
        let student = null;
        let parent = null;
        let bus = null;
        try {
            student = await Student.findById(matchFound._id)
                .populate({
                    path: 'parentId',
                    model: 'User',
                    select: 'fcmToken notificationPreferences'
                });
            parent = student?.parentId;
            const Bus = require('../models/Bus');
            bus = await Bus.findById(bus_id).select('busNumber');
        } catch (dbErr) {
            console.error('DB fetch for notification failed:', dbErr.message);
        }

        const boardingTimeFormatted = new Date(newAttendance.boardingTime)
            .toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

        // Send FCM only if parent has onboard_notify enabled
        if (parent?.fcmToken && parent.notificationPreferences?.onboard_notify !== false) {
            try {
                const { sendNotification } = require('../services/fcmService');
                await sendNotification(
                    parent.fcmToken,
                    '✅ Child Safely On Board',
                    `${student.name} has boarded Bus #${bus ? bus.busNumber : 'N/A'} at ${boardingTimeFormatted}.`,
                    { 
                        type: 'child_boarded',
                        studentName: student.name,
                        busID: bus_id.toString(),
                        boardingTime: newAttendance.boardingTime.toISOString()
                    }
                );
            } catch (fcmErr) {
                console.error('FCM boarding notification failed:', fcmErr.message);
            }
        }

        // Socket.io real-time updates to parent
        try {
            const io = getIo();
            if (parent) {
                io.to(`parent_${parent._id}`).emit('child_boarded', {
                    studentName: student.name,
                    boardingTime: newAttendance.boardingTime,
                    status: 'boarded'
                });
                
                // Legacy event for backward compatibility
                io.to(parent._id.toString()).emit('attendanceUpdate', {
                    studentId: student._id.toString(),
                    studentName: student.name,
                    status: 'boarded',
                    boardingTime: newAttendance.boardingTime,
                    busId: bus_id,
                    message: `Your child ${student.name} has safely boarded the bus.`,
                });
            }
        } catch (socketErr) {
            console.error('Socket notification failed:', socketErr.message);
        }

        res.status(200).json({
            message: 'Attendance marked',
            studentName: matchFound.name,
            boardingTime: newAttendance.boardingTime,
            student: {
                _id: matchFound._id,
                name: matchFound.name,
                boardingTime: newAttendance.boardingTime,
            },
        });
    } catch (err) {
        console.error('Attendance Verification Error:', err);
        res.status(500).json({ error: 'Server Error verifying attendance' });
    }
};

module.exports = {
    getStudentsByBus,
    verifyAttendance,
};
