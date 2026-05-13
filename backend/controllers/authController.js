const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Driver = require('../models/Driver');

// @desc    Admin/Driver/Parent Login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { userId, password, role } = req.body;

    // Strict Input Validation (Basic level, Joi will be added in Month 2)
    if (!userId || !password || !role) {
      return res.status(400).json({ error: 'Please provide userId, password, and role' });
    }
    
    // Security: Only allow expected roles
    const validRoles = ['admin', 'parent', 'driver'];
    if (!validRoles.includes(role)) {
       return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Find User
    const user = await User.findOne({ userId, role });

    if (!user) {
      // Security Feedback: Generic error to prevent user enumeration
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const payload = {
      user: {
        id: user.id,
        userId: user.userId,
        role: user.role,
      },
    };

    // Sign Token with Short Expiration (30 mins for high security)
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30m' },
      async (err, token) => {
        if (err) throw err;

        // Security: Send token in HTTP-Only Cookie
        res.cookie('token', token, {
          httpOnly: true, // Prevents client-side JS from reading the cookie
          secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
          sameSite: 'strict', // CSRF protection
          maxAge: 30 * 60 * 1000 // 30 minutes in milliseconds
        });

        const responseData = {
          message: 'Login successful',
          user: {
            id: user.id,
            userId: user.userId,
            role: user.role
          }
        };

        // If driver, add specific IDs for session storage
        if (role === 'driver') {
          const driver = await Driver.findOne({ userId: user.userId });
          if (driver) {
            responseData.user.driverId = driver._id;
            responseData.user.assignedBusId = driver.assignedBusId;
          }
        }

        res.json(responseData);
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Logout User / Clear Cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  // Clear the HTTP-only cookie
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0) // Expire immediately
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  login,
  logout
};
