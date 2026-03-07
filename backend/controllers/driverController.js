const Driver = require('../models/Driver');
const BusRoute = require('../models/BusRoute');
const Student = require('../models/Student');

// @desc    Get assigned route and manifest for the logged-in driver
// @route   GET /api/driver/route
// @access  Private/Driver
const getAssignedRoute = async (req, res) => {
    try {
        // req.user has the decoded JWT payload
        // We first need to find the Driver record that corresponds to this user account
        // Assuming req.user._id maps to Driver.userId (or you fetch by matching something unique)
        // For right now, let's fetch based on the assumption that Driver has a userId field

        const driver = await Driver.findOne({ userId: req.user._id });

        if (!driver) {
            // For testing purposes, if seed didn't link userId, we fallback to just fetching all for now
            // In a real prod environment, we strictly return 404 here.
            return res.status(404).json({ error: 'Driver profile not found for this user.' });
        }

        if (!driver.routeId) {
            return res.status(404).json({ error: 'No bus route assigned to this driver yet.' });
        }

        // Fetch the Route Details
        const route = await BusRoute.findById(driver.routeId);

        // Fetch all Students assigned to this Route
        const students = await Student.find({ routeId: driver.routeId })
            .populate('parentId', 'userId'); // Optionally populate Parent details

        res.json({
            route,
            students,
        });

    } catch (err) {
        console.error("Driver Route Fetch Error:", err);
        res.status(500).json({ error: 'Server Error fetching route.' });
    }
};

module.exports = {
    getAssignedRoute,
};
