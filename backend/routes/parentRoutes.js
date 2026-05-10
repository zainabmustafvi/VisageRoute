const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { 
    getStudentSchedule,
    getAnnouncements,
    markAnnouncementRead 
} = require('../controllers/parentController');

router.use(protect);
router.use(authorizeRoles('parent'));

router.get('/schedule', getStudentSchedule);
router.get('/announcements', getAnnouncements);
router.put('/announcements/:id/read', markAnnouncementRead);

module.exports = router;
