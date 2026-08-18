const mongoose = require('mongoose');
const Student = require('../models/Student');
const Bus = require('../models/Bus');
const BusRouteAssignment = require('../models/BusRouteAssignment');
const Announcement = require('../models/Announcement');
const User = require('../models/User');

const getStudentSchedule = async (req, res) => {
    try {
        const { studentId } = req.query;
        let student;
        
        if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
            student = await Student.findOne({ _id: studentId, parentId: req.user.id });
        } else {
            student = await Student.findOne({ parentId: req.user.id });
        }

        if (!student) return res.status(404).json({ error: 'No student found' });
        if (!student.busId) return res.json({ student: { name: student.name }, schedule: [], noBusAssigned: true });

        const assignments = await BusRouteAssignment.find({ busId: student.busId, isActive: true })
            .populate('busId', 'busNumber plateNumber')
            .populate('routeId', 'routeName');

        const Driver = require('../models/Driver');
        const driver = await Driver.findOne({ assignedBusId: student.busId });

        res.json({
            student: {
                name: student.name,
                pickupPoint: student.pickupPoint || 'Not provided',
                dropPoint: student.address || 'Not provided',
                busNumber: assignments[0]?.busId?.busNumber,
                routeName: assignments[0]?.routeId?.routeName
            },
            driver: driver ? {
                name: driver.name,
                phone: driver.phone
            } : null,
            schedule: assignments
        });
    } catch (err) {
        console.error('Error fetching schedule:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};

const getAnnouncements = async (req, res) => {
    try {
        const { studentId } = req.query;
        let student;

        if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
            student = await Student.findOne({ _id: studentId, parentId: req.user.id });
        } else {
            student = await Student.findOne({ parentId: req.user.id });
        }
        
        let busId = null;
        let routeId = null;

        if (student) {
            busId = student.busId;
            if (busId) {
                const assignment = await BusRouteAssignment.findOne({ busId, isActive: true }).select('routeId');
                if (assignment) routeId = assignment.routeId;
            }
        }

        const announcements = await Announcement.find({
            isSent: true,
            $or: [
                { 'recipients.type': 'all' },
                ...(busId ? [{ 'recipients.type': 'bus', 'recipients.targetId': busId }] : []),
                ...(routeId ? [{ 'recipients.type': 'route', 'recipients.targetId': routeId }] : [])
            ]
        }).sort({ createdAt: -1 });

        const result = announcements.map(ann => {
            const isRead = ann.readBy.some(r => r.userId.toString() === req.user.id.toString());
            return {
                ...ann.toObject(),
                isRead
            };
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error fetching announcements' });
    }
};

const markAnnouncementRead = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ error: 'Announcement not found' });

        const alreadyRead = announcement.readBy.some(r => r.userId.toString() === req.user.id.toString());
        if (!alreadyRead) {
            announcement.readBy.push({ userId: req.user.id });
            await announcement.save();
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server Error marking read' });
    }
};

const getChildStatus = async (req, res) => {
    try {
        const { studentId } = req.query;
        let student;
        
        if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
            student = await Student.findOne({ _id: studentId, parentId: req.user.id }).populate('busId');
        } else {
            student = await Student.findOne({ parentId: req.user.id }).populate('busId');
        }

        if (!student) return res.status(404).json({ error: 'No student found' });

        let driverOnline = false;
        let wentOnlineAt = null;
        let routeActive = false;
        let routeId = null;
        let driverRecord = null;

        if (student.busId) {
            const Driver = require('../models/Driver');
            driverRecord = await Driver.findOne({ assignedBusId: student.busId._id });
            if (driverRecord) {
                driverOnline = driverRecord.isOnline;
                wentOnlineAt = driverRecord.wentOnlineAt;
            }

            const assignment = await BusRouteAssignment.findOne({ busId: student.busId._id, isActive: true });
            if (assignment) {
                routeActive = true;
                routeId = assignment.routeId;
            }
        }

        let eta = null;
        let latestLocation = null;
        if (driverOnline && student.busId) {
            const LocationTracking = require('../models/LocationTracking');
            latestLocation = await LocationTracking.findOne({ busId: student.busId._id }).sort({ timestamp: -1 });
            if (latestLocation) {
                const BusRoute = require('../models/BusRoute');
                const route = await BusRoute.findById(routeId);
                if (route && route.stops && route.stops.length > 0) {
                    const R = 6371;
                    let minDist = Infinity;
                    for (const stop of route.stops) {
                        if (!stop.coordinates || !stop.coordinates.latitude || !stop.coordinates.longitude) continue;
                        const dLat = (stop.coordinates.latitude - latestLocation.latitude) * Math.PI / 180;
                        const dLon = (stop.coordinates.longitude - latestLocation.longitude) * Math.PI / 180;
                        const a = Math.sin(dLat / 2) ** 2 +
                            Math.cos(latestLocation.latitude * Math.PI / 180) *
                            Math.cos(stop.coordinates.latitude * Math.PI / 180) *
                            Math.sin(dLon / 2) ** 2;
                        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                        if (dist < minDist) minDist = dist;
                    }
                    if (minDist < Infinity) {
                        eta = Math.round((minDist / 30) * 60);
                    }
                } else {
                    eta = 15;
                }
            }
        }

        res.json({
            student: {
                id: student._id,
                name: student.name,
                grade: student.department || student.year || 'Not provided',
                rollNo: student.rollNo,
                busId: student.busId ? student.busId._id : null,
                busNumber: student.busId ? student.busId.busNumber : null,
            },
            driverInfo: driverRecord ? {
                name: driverRecord.name,
                phone: driverRecord.phone
            } : null,
            attendance: null,
            routeInfo: {
                driverOnline,
                wentOnlineAt,
                routeActive,
                routeId,
                eta,
                latestLocation: latestLocation ? {
                    latitude: latestLocation.latitude,
                    longitude: latestLocation.longitude,
                    timestamp: latestLocation.timestamp
                } : null
            }
        });

    } catch (err) {
        console.error('Child Status Error:', err);
        res.status(500).json({ error: 'Server Error fetching child status' });
    }
};

const getParentProfile = async (req, res) => {
    try {
        const students = await Student.find({ parentId: req.user.id }).populate('busId');
        if (!students || students.length === 0) {
            return res.status(404).json({ error: 'No parent details or linked students found' });
        }

        const parentInfo = {
            parentName: students[0].parentName || 'Not provided',
            parentEmail: students[0].parentEmail || 'Not provided',
            phone: students[0].phone || 'Not provided',
            address: students[0].address || 'Not provided',
            parentId: req.user.id
        };

        const children = students.map(student => ({
            id: student._id,
            name: student.name,
            grade: student.department || student.year || 'Not provided',
            rollNo: student.rollNo || 'Not provided',
            busId: student.busId ? student.busId._id : null,
            busNumber: student.busId ? student.busId.busNumber : 'Not Assigned',
            isActive: true
        }));

        res.json({
            parent: parentInfo,
            children
        });
    } catch (err) {
        console.error('Error fetching parent profile:', err);
        res.status(500).json({ error: 'Server Error fetching profile' });
    }
};

const getPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user.notificationPreferences || {
            arrival_notify: true,
            start_notify: true,
            onboard_notify: true
        });
    } catch (err) {
        res.status(500).json({ error: 'Server Error fetching preferences' });
    }
};

const updatePreferences = async (req, res) => {
    try {
        const { preference_key, value } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (!user.notificationPreferences) {
            user.notificationPreferences = {
                arrival_notify: true,
                start_notify: true,
                onboard_notify: true
            };
        }

        user.notificationPreferences[preference_key] = value;
        await user.save();

        res.json({ success: true, notificationPreferences: user.notificationPreferences });
    } catch (err) {
        console.error('Preferences Update Error:', err);
        res.status(500).json({ error: 'Server Error updating preferences' });
    }
};

const markAllAnnouncementsRead = async (req, res) => {
    try {
        const student = await Student.findOne({ parentId: req.user.id });
        let busId = null;
        let routeId = null;

        if (student) {
            busId = student.busId;
            if (busId) {
                const assignment = await BusRouteAssignment.findOne({ busId, isActive: true }).select('routeId');
                if (assignment) routeId = assignment.routeId;
            }
        }

        const announcements = await Announcement.find({
            isSent: true,
            $or: [
                { 'recipients.type': 'all' },
                ...(busId ? [{ 'recipients.type': 'bus', 'recipients.targetId': busId }] : []),
                ...(routeId ? [{ 'recipients.type': 'route', 'recipients.targetId': routeId }] : [])
            ]
        });

        for (const ann of announcements) {
            const alreadyRead = ann.readBy.some(r => r.userId.toString() === req.user.id.toString());
            if (!alreadyRead) {
                ann.readBy.push({ userId: req.user.id });
                await ann.save();
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error marking all announcements read:', err);
        res.status(500).json({ error: 'Server Error marking all read' });
    }
};

const updateFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { fcmToken },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'FCM Token registered/refreshed successfully' });
    } catch (err) {
        console.error('Error updating FCM Token:', err);
        res.status(500).json({ error: 'Server Error updating token' });
    }
};

module.exports = {
    getStudentSchedule,
    getAnnouncements,
    markAnnouncementRead,
    getChildStatus,
    getParentProfile,
    getPreferences,
    updatePreferences,
    markAllAnnouncementsRead,
    updateFcmToken
};
