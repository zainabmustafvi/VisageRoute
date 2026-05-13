const express = require('express');
const router = express.Router();
const { updateLocation } = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Post /api/location/update
// Restricted to drivers
router.post('/update', protect, authorizeRoles('driver'), updateLocation);

module.exports = router;
