const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { getAssignedRoute } = require('../controllers/driverController');

// All driver routes must be protected and restricted to the 'driver' role
router.use(protect);
router.use(authorizeRoles('driver', 'admin')); // Admins might need to view this as well

// Get driver's specific route and student manifest
router.get('/route', getAssignedRoute);

module.exports = router;
