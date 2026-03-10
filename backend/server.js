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
const server = http.createServer(app);

// Initialize Socket.io securely
initSocket(server);

// Security Middleware
app.use(helmet()); // Sets generic security-related HTTP headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8081', // Adjust based on React Native IP
  credentials: true // Crucial for receiving cookies from the client
}));
app.use(express.json());
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

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/driver', driverRoutes);

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
