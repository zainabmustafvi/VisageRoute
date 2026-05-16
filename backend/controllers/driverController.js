const Driver = require('../models/Driver');
const BusRoute = require('../models/BusRoute');
const Student = require('../models/Student');

// @desc    Get assigned route and manifest for the logged-in driver
// @route   GET /api/driver/route
// @access  Private/Driver
const getAssignedRoute = async (req, res) => {
    try {
        const driver = await Driver.findOne({ userId: req.user.userId });

        if (!driver) {
            return res.status(404).json({ error: 'Driver profile not found.' });
        }

        if (!driver.assignedBusId) {
            return res.status(404).json({ error: 'No bus assigned to this driver.' });
        }

        // Find route via Bus Assignment
        const BusRouteAssignment = require('../models/BusRouteAssignment');
        const assignment = await BusRouteAssignment.findOne({ busId: driver.assignedBusId, isActive: true });

        if (!assignment) {
            return res.status(404).json({ error: 'No active route assignment for this bus.' });
        }

        // Fetch the Route Details
        const route = await BusRoute.findById(assignment.routeId);

        // Fetch Bus Details
        const Bus = require('../models/Bus');
        const bus = await Bus.findById(driver.assignedBusId);

        // Fetch all Students assigned to this Bus
        const students = await Student.find({ busId: driver.assignedBusId });

        res.json({
            route,
            bus,
            students,
        });

    } catch (err) {
        console.error("Driver Route Fetch Error:", err);
        res.status(500).json({ error: 'Server Error fetching route.' });
    }
};

// @desc    Get dashboard summary (Name, Bus Number, Trip Status)
// @route   GET /api/driver/dashboard
// @access  Private/Driver
const getDashboardData = async (req, res) => {
    try {
        const driver = await Driver.findOne({ userId: req.user.userId }).populate('assignedBusId');
        
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        // Find routeId if available
        const BusRouteAssignment = require('../models/BusRouteAssignment');
        const assignment = await BusRouteAssignment.findOne({ busId: driver.assignedBusId?._id, isActive: true });

        res.json({
            name: driver.name,
            busNumber: driver.assignedBusId ? driver.assignedBusId.busNumber : 'N/A',
            isOnline: driver.isOnline,
            assignedBusId: driver.assignedBusId ? driver.assignedBusId._id : null,
            routeId: assignment ? assignment.routeId : null
        });
    } catch (err) {
        console.error("Dashboard Data Error:", err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Update trip status (Online/Offline)
// @route   PATCH /api/driver/trip-status
// @access  Private/Driver
const updateTripStatus = async (req, res) => {
    try {
        const { isOnline } = req.body;
        const driver = await Driver.findOneAndUpdate(
            { userId: req.user.userId },
            { isOnline },
            { new: true }
        );

        if (!driver) return res.status(404).json({ error: 'Driver not found' });

        res.json({ message: `Status updated to ${isOnline ? 'Online' : 'Offline'}`, isOnline: driver.isOnline });
    } catch (err) {
        res.status(500).json({ error: 'Server Error updating status' });
    }
};

// @desc    Get full profile of the logged-in driver
// @route   GET /api/driver/profile
// @access  Private/Driver
const getProfile = async (req, res) => {
    try {
        const driver = await Driver.findOne({ userId: req.user.userId }).populate('assignedBusId');

        if (!driver) {
            return res.status(404).json({ error: 'Driver profile not found.' });
        }

        res.json({
            name: driver.name,
            email: driver.email,
            phone: driver.phone,
            employeeId: driver.employeeId,
            licenseNumber: driver.licenseNumber,
            licenseExpiry: driver.licenseExpiry,
            isActive: driver.isActive,
            bus: driver.assignedBusId ? {
                busNumber: driver.assignedBusId.busNumber,
                plateNumber: driver.assignedBusId.plateNumber,
                capacity: driver.assignedBusId.capacity
            } : null
        });
    } catch (err) {
        console.error("Profile Fetch Error:", err);
        res.status(500).json({ error: 'Server Error fetching profile.' });
    }
};

module.exports = {
    getAssignedRoute,
    getDashboardData,
    updateTripStatus,
    getProfile
};
