const rateLimit = require('express-rate-limit');

// 1. Strict Login Limiter
// Purpose: Prevent Brute Force and Credential Stuffing attacks on authentication
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 failed requests per `window` (here, per 15 minutes)
    message: { error: 'Too many login attempts from this IP, please try again after 15 minutes.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// 2. Broadcast/Notification Limiter (For future Month 3)
// Purpose: Prevent spamming of push notifications
const broadcastLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // Limit each IP to 3 requests per minute
    message: { error: 'Too many broadcasts sent. Please wait before sending another alert.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    loginLimiter,
    broadcastLimiter,
};
