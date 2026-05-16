const Student = require('../models/Student');
const Bus = require('../models/Bus');
const BusRouteAssignment = require('../models/BusRouteAssignment');
const Announcement = require('../models/Announcement');

// @desc    Get schedule for student linked to parent
// @route   GET /api/parent/schedule
// @access  Private/Parent
const getStudentSchedule = async (req, res) => {
    try {
        const student = await Student.findOne({ parentId: req.user.id });
        if (!student) return res.status(404).json({ error: 'No student found' });
        if (!student.busId) return res.status(400).json({ error: 'No bus assigned' });

        const assignments = await BusRouteAssignment.find({ busId: student.busId, isActive: true })
            .populate('busId', 'busNumber plateNumber')
            .populate('routeId', 'routeName');

        res.json({
            student: {
                name: student.name,
                busNumber: assignments[0]?.busId?.busNumber,
                routeName: assignments[0]?.routeId?.routeName
            },
            schedule: assignments
        });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Get announcements for parent
// @route   GET /api/parent/announcements
// @access  Private/Parent
const getAnnouncements = async (req, res) => {
    try {
        const student = await Student.findOne({ parentId: req.user.id });
        
        let busId = null;
        let routeId = null;

        if (student) {
            busId = student.busId;
            if (busId) {
                const BusRouteAssignment = require('../models/BusRouteAssignment');
                const assignment = await BusRouteAssignment.findOne({ busId, isActive: true }).select('routeId');
                if (assignment) routeId = assignment.routeId;
            }
        }

        // Fetch announcements matching criteria
        // If no student/bus/route, they only get 'all'
        const announcements = await Announcement.find({
            isSent: true,
            $or: [
                { 'recipients.type': 'all' },
                ...(busId ? [{ 'recipients.type': 'bus', 'recipients.targetId': busId }] : []),
                ...(routeId ? [{ 'recipients.type': 'route', 'recipients.targetId': routeId }] : [])
            ]
        }).sort({ createdAt: -1 });

        // Map to include 'isRead' status for THIS user
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

// @desc    Mark announcement as read
// @route   PUT /api/parent/announcements/:id/read
// @access  Private/Parent
const markAnnouncementRead = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ error: 'Announcement not found' });

        // Check if already read
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

module.exports = {
    getStudentSchedule,
    getAnnouncements,
    markAnnouncementRead
};
