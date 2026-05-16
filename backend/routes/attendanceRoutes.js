const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { getStudentsByBus, verifyAttendance } = require('../controllers/attendanceController');

// All attendance routes are protected
router.use(protect);

// Get students for a specific bus (for manifest)
router.get('/students/:busId', authorizeRoles('driver', 'admin'), getStudentsByBus);

// Verify and log attendance
router.post('/verify', authorizeRoles('driver'), verifyAttendance);

module.exports = router;
