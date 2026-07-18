const Driver = require('../models/Driver');
const BusRoute = require('../models/BusRoute');
const Student = require('../models/Student');

/**
 * Helper: find the logged-in driver's profile.
 * 
 * Strategy (migration-safe):
 *  1. Try ObjectId reference: Driver.user === req.user.id
 *  2. Fallback: Driver.email === req.user.email  (covers all legacy records)
 */
const findDriverForUser = async (req) => {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    let driver = null;

    // Primary: look up by ObjectId reference if the field is populated
    if (userId) {
        driver = await Driver.findOne({ user: userId });
    }

    // Fallback: look up by matching email (works for ALL existing records)
    if (!driver && userEmail) {
        driver = await Driver.findOne({ email: userEmail.toLowerCase() });

        // Auto-link the user field so future lookups use the faster ObjectId path
        if (driver && userId && !driver.user) {
            driver.user = userId;
            await driver.save();
        }
    }

    return driver;
};

// @desc    Get assigned route and manifest for the logged-in driver
// @route   GET /api/driver/route
// @access  Private/Driver
const getAssignedRoute = async (req, res) => {
    try {
        const driver = await findDriverForUser(req);

        if (!driver) {
            return res.status(404).json({ error: 'Driver profile not found. Please contact admin.' });
        }

        if (!driver.assignedBusId) {
            return res.status(200).json({
                message: 'No bus assigned to this driver yet.',
                route: null,
                bus: null,
                students: []
            });
        }

        const BusRouteAssignment = require('../models/BusRouteAssignment');
        const assignment = await BusRouteAssignment.findOne({ busId: driver.assignedBusId, isActive: true });

        if (!assignment) {
            return res.status(200).json({
                message: 'No active route assignment for this bus.',
                route: null,
                bus: null,
                students: []
            });
        }

        const route = await BusRoute.findById(assignment.routeId);
        const Bus = require('../models/Bus');
        const bus = await Bus.findById(driver.assignedBusId);
        const students = await Student.find({ busId: driver.assignedBusId });

        res.json({ route, bus, students });
    } catch (err) {
        console.error('Driver Route Fetch Error:', err);
        res.status(500).json({ error: 'Server Error fetching route.' });
    }
};

// @desc    Get dashboard summary (Name, Bus Number, Trip Status)
// @route   GET /api/driver/dashboard
// @access  Private/Driver
const getDashboardData = async (req, res) => {
    try {
        const driver = await findDriverForUser(req);

        if (!driver) {
            return res.status(404).json({ error: 'Driver profile not found. Please contact admin.' });
        }

        // Populate bus details manually
        const Bus = require('../models/Bus');
        const bus = driver.assignedBusId ? await Bus.findById(driver.assignedBusId) : null;

        const BusRouteAssignment = require('../models/BusRouteAssignment');
        const assignment = driver.assignedBusId
            ? await BusRouteAssignment.findOne({ busId: driver.assignedBusId, isActive: true })
            : null;

        res.json({
            name: driver.name,
            busNumber: bus ? bus.busNumber : 'N/A',
            isOnline: driver.isOnline,
            assignedBusId: driver.assignedBusId || null,
            routeId: assignment ? assignment.routeId : null,
            driverId: driver._id
        });
    } catch (err) {
        console.error('Dashboard Data Error:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Update trip status (Online/Offline)
// @route   PATCH /api/driver/trip-status
// @access  Private/Driver
const updateTripStatus = async (req, res) => {
    try {
        const { isOnline } = req.body;
        const updateData = { isOnline };
        if (isOnline) updateData.wentOnlineAt = new Date();

        // Find first, then update by _id for reliability
        const driver = await findDriverForUser(req);
        if (!driver) return res.status(404).json({ error: 'Driver not found' });

        const updated = await Driver.findByIdAndUpdate(driver._id, updateData, { new: true });
        res.json({ message: `Status updated to ${isOnline ? 'Online' : 'Offline'}`, isOnline: updated.isOnline });
    } catch (err) {
        res.status(500).json({ error: 'Server Error updating status' });
    }
};

// @desc    Get full profile of the logged-in driver
// @route   GET /api/driver/profile
// @access  Private/Driver
const getProfile = async (req, res) => {
    try {
        const driver = await findDriverForUser(req);

        if (!driver) {
            return res.status(404).json({ error: 'Driver profile not found. Please contact admin.' });
        }

        const Bus = require('../models/Bus');
        const bus = driver.assignedBusId ? await Bus.findById(driver.assignedBusId) : null;

        res.json({
            name: driver.name,
            email: driver.email,
            phone: driver.phone,
            employeeId: driver.employeeId,
            licenseNumber: driver.licenseNumber,
            licenseExpiry: driver.licenseExpiry,
            licenseClass: driver.licenseClass,
            isActive: driver.isActive,
            isOnline: driver.isOnline,
            bus: bus ? {
                busNumber: bus.busNumber,
                plateNumber: bus.plateNumber,
                capacity: bus.capacity
            } : null
        });
    } catch (err) {
        console.error('Profile Fetch Error:', err);
        res.status(500).json({ error: 'Server Error fetching profile.' });
    }
};

// @desc    Start trip and notify parents
// @route   PATCH /api/driver/start-trip
// @access  Private/Driver
const startTrip = async (req, res) => {
    try {
        let { busID, driverID } = req.body;

        // Fallback: extract from token/profile if body is missing
        if (!driverID || !busID) {
            const driver = await findDriverForUser(req);
            if (driver) {
                driverID = driverID || driver._id;
                busID = busID || driver.assignedBusId;
            }
        }

        if (!driverID || !busID) {
            return res.status(400).json({ error: 'Driver profile or assigned bus not found.' });
        }

        // 1. Update driver status ONLINE
        await Driver.findByIdAndUpdate(driverID, { isOnline: true, wentOnlineAt: new Date() });

        // 2. Find ALL students on this bus
        const StudentModel = require('../models/Student');
        const students = await StudentModel.find({ busId: busID }).populate({
            path: 'parentId',
            model: 'User',
            select: 'fcmToken notificationPreferences'
        });

        // 3. Get bus number for message
        const Bus = require('../models/Bus');
        const bus = await Bus.findById(busID).select('busNumber');

        if (!bus) {
            return res.status(404).json({ error: 'Bus not found.' });
        }

        // 4. Send FCM (non-blocking)
        try {
            const { sendNotification } = require('../services/fcmService');
            const notifications = students.map(student => {
                const parent = student.parentId;
                if (!parent?.fcmToken) return null;
                if (parent.notificationPreferences?.start_notify === false) return null;
                return sendNotification(
                    parent.fcmToken,
                    '🚌 Bus Route Started',
                    `Bus #${bus.busNumber} has left the station and is on its way.`,
                    { type: 'trip_started', busID: busID.toString() }
                );
            }).filter(Boolean);
            Promise.allSettled(notifications); // fire-and-forget
        } catch (fcmErr) {
            console.error('FCM notification error:', fcmErr.message);
        }

        // 5. Socket.io (non-blocking)
        try {
            const { getIo } = require('../config/socket');
            const io = getIo();
            io.to(`bus_${busID}`).emit('trip_started', {
                busID,
                busNumber: bus.busNumber,
                message: 'Bus has started the route'
            });
        } catch (socketErr) {
            console.error('[Socket.io] trip_started emit error:', socketErr.message);
        }

        res.status(200).json({ message: 'Trip started, parents notified', isOnline: true });
    } catch (err) {
        console.error('Error starting trip:', err);
        res.status(500).json({ error: 'Server Error starting trip' });
    }
};

// @desc    Stop trip and notify parents
// @route   PATCH /api/driver/stop-trip
// @access  Private/Driver
const stopTrip = async (req, res) => {
    try {
        let { busID, driverID } = req.body;

        if (!driverID || !busID) {
            const driver = await findDriverForUser(req);
            if (driver) {
                driverID = driverID || driver._id;
                busID = busID || driver.assignedBusId;
            }
        }

        if (!driverID || !busID) {
            return res.status(400).json({ error: 'Driver profile or assigned bus not found.' });
        }

        await Driver.findByIdAndUpdate(driverID, { isOnline: false });

        const StudentModel = require('../models/Student');
        const students = await StudentModel.find({ busId: busID }).populate({
            path: 'parentId',
            model: 'User',
            select: 'fcmToken notificationPreferences'
        });

        const Bus = require('../models/Bus');
        const bus = await Bus.findById(busID).select('busNumber');

        if (!bus) {
            return res.status(404).json({ error: 'Bus not found.' });
        }

        try {
            const { sendNotification } = require('../services/fcmService');
            const notifications = students.map(student => {
                const parent = student.parentId;
                if (!parent?.fcmToken) return null;
                if (parent.notificationPreferences?.start_notify === false) return null;
                return sendNotification(
                    parent.fcmToken,
                    '🚌 Bus Route Ended',
                    `Bus #${bus.busNumber} has completed its route and is offline.`,
                    { type: 'trip_ended', busID: busID.toString() }
                );
            }).filter(Boolean);
            Promise.allSettled(notifications); // fire-and-forget
        } catch (fcmErr) {
            console.error('FCM notification error:', fcmErr.message);
        }

        try {
            const { getIo } = require('../config/socket');
            const io = getIo();
            io.to(`bus_${busID}`).emit('trip_ended', {
                busID,
                busNumber: bus.busNumber,
                message: 'Bus has ended the route'
            });
        } catch (socketErr) {
            console.error('[Socket.io] trip_ended emit error:', socketErr.message);
        }

        res.status(200).json({ message: 'Trip stopped, parents notified', isOnline: false });
    } catch (err) {
        console.error('Error stopping trip:', err);
        res.status(500).json({ error: 'Server Error stopping trip' });
    }
};

module.exports = {
    getAssignedRoute,
    getDashboardData,
    updateTripStatus,
    getProfile,
    startTrip,
    stopTrip
};
