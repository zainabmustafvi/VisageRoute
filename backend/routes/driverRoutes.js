const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { getAssignedRoute, getDashboardData, updateTripStatus, getProfile } = require('../controllers/driverController');

// All driver routes must be protected and restricted to the 'driver' role
router.use(protect);
router.use(authorizeRoles('driver', 'admin')); // Admins might need to view this as well

// Get driver's specific route and student manifest
router.get('/route', getAssignedRoute);

// Get dashboard summary
router.get('/dashboard', getDashboardData);

// Get full profile
router.get('/profile', getProfile);

// Update trip status (Online/Offline)
router.patch('/trip-status', updateTripStatus);

module.exports = router;
