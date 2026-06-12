const express = require('express');
const router = express.Router();
const { updateLocation, getLatestLocation } = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// POST /api/location/update
// Restricted to drivers
router.post('/update', protect, authorizeRoles('driver'), updateLocation);

// GET /api/location/latest/:busId
// Accessible by drivers, parents, and admins
router.get('/latest/:busId', protect, authorizeRoles('driver', 'parent', 'admin'), getLatestLocation);

module.exports = router;
