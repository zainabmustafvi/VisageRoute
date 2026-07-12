const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { 
    getStudentSchedule,
    getAnnouncements,
    markAnnouncementRead,
    getChildStatus,
    getParentProfile,
    getPreferences,
    updatePreferences,
    markAllAnnouncementsRead,
    updateFcmToken
} = require('../controllers/parentController');

router.use(protect);
router.use(authorizeRoles('parent'));

router.get('/schedule', getStudentSchedule);
router.get('/announcements', getAnnouncements);
router.put('/announcements/read-all', markAllAnnouncementsRead);
router.put('/announcements/:id/read', markAnnouncementRead);
router.get('/child-status', getChildStatus);
router.get('/profile', getParentProfile);
router.get('/preferences', getPreferences);
router.patch('/preferences', updatePreferences);
router.patch('/fcm-token', updateFcmToken);

module.exports = router;
