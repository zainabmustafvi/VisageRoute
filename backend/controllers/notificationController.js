const User = require('../models/User');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');
const Driver = require('../models/Driver');
const Student = require('../models/Student');
const BusRouteAssignment = require('../models/BusRouteAssignment');

// @desc    Send notification from Admin panel
// @route   POST /api/admin/notifications (or /api/notifications)
// @access  Private/Admin
const sendNotification = async (req, res) => {
    try {
        const { title, message, content, targetRole, recipientId, recipients } = req.body;
        const adminId = req.user?._id || req.user?.id; // Normalized ObjectId from authMiddleware

        const notifTitle = title;
        const notifMessage = message || content;

        if (!notifTitle || !notifMessage) {
            return res.status(400).json({ success: false, message: 'Title and message are required.' });
        }

        let recipientUserIds = [];

        if (recipientId) {
            // Direct recipient lookup by ObjectId (NOT legacy string IDs)
            const mongoose = require('mongoose');
            if (mongoose.Types.ObjectId.isValid(recipientId)) {
                const user = await User.findById(recipientId);
                if (user) {
                    recipientUserIds.push(user._id);
                } else {
                    const driver = await Driver.findById(recipientId);
                    if (driver && driver.user) {
                        recipientUserIds.push(driver.user);
                    } else {
                        return res.status(404).json({ success: false, message: 'Target recipient user not found.' });
                    }
                }
            } else {
                return res.status(400).json({ success: false, message: 'Invalid recipient ID format.' });
            }
        } else if (targetRole) {
            // Role-based notification (Parent, Driver, or All)
            const query = (targetRole === 'All' || targetRole === 'all')
                ? { role: { $in: ['parent', 'driver'] } }
                : { role: targetRole.toLowerCase() };
            const users = await User.find(query).select('_id');
            recipientUserIds = users.map(u => u._id);
        } else if (recipients && typeof recipients === 'object') {
            // For announcement payload format { type: 'all' | 'route' | 'bus', targetId }
            if (recipients.type === 'all') {
                const users = await User.find({ role: { $in: ['parent', 'driver'] } }).select('_id');
                recipientUserIds = users.map(u => u._id);
            } else if (recipients.type === 'route' && recipients.targetId) {
                const assignments = await BusRouteAssignment.find({ routeId: recipients.targetId }).select('busId');
                const busIds = [...new Set(assignments.map(a => a.busId.toString()))];
                const students = await Student.find({ busId: { $in: busIds } });
                const parentIds = students.map(s => s.parentId).filter(Boolean);
                const drivers = await Driver.find({ assignedBusId: { $in: busIds } });
                const driverUserIds = drivers.map(d => d.user).filter(Boolean);
                const users = await User.find({
                    $or: [
                        { _id: { $in: parentIds } },
                        { _id: { $in: driverUserIds } }
                    ]
                }).select('_id');
                recipientUserIds = users.map(u => u._id);
            } else if (recipients.type === 'bus' && recipients.targetId) {
                const students = await Student.find({ busId: recipients.targetId });
                const parentIds = students.map(s => s.parentId).filter(Boolean);
                const drivers = await Driver.find({ assignedBusId: recipients.targetId });
                const driverUserIds = drivers.map(d => d.user).filter(Boolean);
                const users = await User.find({
                    $or: [
                        { _id: { $in: parentIds } },
                        { _id: { $in: driverUserIds } }
                    ]
                }).select('_id');
                recipientUserIds = users.map(u => u._id);
            }
        } else {
            const users = await User.find({ role: { $in: ['parent', 'driver'] } }).select('_id');
            recipientUserIds = users.map(u => u._id);
        }

        // Save Notification record
        const notification = await Notification.create({
            title: notifTitle,
            message: notifMessage,
            sender: adminId,
            targetRole: targetRole || (recipientId ? 'Specific' : 'All'),
            recipients: recipientUserIds,
            recipient: recipientUserIds.length === 1 ? recipientUserIds[0] : null,
            createdAt: new Date(),
        });

        // Also save Announcement for backwards compatibility
        try {
            await Announcement.create({
                adminId,
                title: notifTitle,
                content: notifMessage,
                recipients: { type: 'all' },
                isSent: true,
                sentAt: new Date()
            });
        } catch (annErr) {
            console.error('Secondary Announcement creation error:', annErr.message);
        }

        // Send via Socket.io & FCM Push Notifications
        try {
            const { sendToMultiple } = require('../services/fcmService');
            const targetUsers = await User.find({ _id: { $in: recipientUserIds } }).select('fcmToken');
            const fcmTokens = targetUsers.map(u => u.fcmToken).filter(Boolean);
            if (fcmTokens.length > 0) {
                await sendToMultiple(fcmTokens, `📢 ${notifTitle}`, notifMessage, { type: 'notification' });
            }
        } catch (pushErr) {
            console.error('Push notification delivery error:', pushErr.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Notification sent successfully!',
            data: notification,
        });

    } catch (error) {
        console.error('Notification Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to send notification.',
        });
    }
};

module.exports = { sendNotification };
