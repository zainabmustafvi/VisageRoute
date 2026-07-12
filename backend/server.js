require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

const http = require('http');
const { initSocket } = require('./config/socket');

const app = express();

// Trust Railway's proxy so express-rate-limit can correctly read the
// client IP from the X-Forwarded-For header.
app.set('trust proxy', 1);

const server = http.createServer(app);

// Initialize Socket.io securely
initSocket(server);

// Security Middleware
app.use(helmet()); // Sets generic security-related HTTP headers
app.use(cors({
  // In development, React Native on a physical device sends requests from its IP.
  // We allow all origins in dev and will tighten to a specific domain in production.
  origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Strict Rate Limiting (Security Hardening)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', limiter);

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const driverRoutes = require('./routes/driverRoutes');
const parentRoutes = require('./routes/parentRoutes');
const locationRoutes = require('./routes/locationRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/attendance', attendanceRoutes);

// Placeholder routes
app.get('/', (req, res) => {
  res.send('VisageRoute API is running securely.');
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    server.listen(PORT, () => console.log(`Server and Socket.io running securely on port ${PORT}`));
  })
  .catch((error) => console.error('MongoDB connection error:', error));

// Trigger nodemon restart after .env file update for standard MongoDB URI format

