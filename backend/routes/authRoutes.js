const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Post /api/auth/login
router.post('/login', login);

// Post /api/auth/logout
router.post('/logout', protect, logout);

// Get /api/auth/me (To verify token and get current user data)
router.get('/me', protect, (req, res) => {
    res.json(req.user);
});

module.exports = router;
