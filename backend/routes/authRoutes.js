const express = require('express');
const router = express.Router();
const { login, logout, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');

// Post /api/auth/login
router.post('/login', loginLimiter, login);

// Post /api/auth/logout
router.post('/logout', protect, logout);

// Forgot Password Flows
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Get /api/auth/me
router.get('/me', protect, (req, res) => {
    res.json(req.user);
});

module.exports = router;