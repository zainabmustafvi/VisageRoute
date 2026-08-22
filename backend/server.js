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
const { startKeepAlive } = require('./services/keepAliveService');

const app = express();

app.set('trust proxy', 1);

const server = http.createServer(app);

initSocket(server);

// Lightweight Health Check Endpoint (Bypasses rate limiting for monitoring and keep-alive)
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'online',
    uptime: Number(process.uptime().toFixed(2)),
    environment: process.env.ENVIRONMENT || (process.env.NODE_ENV === 'production' ? 'production' : 'local-port-forward'),
    timestamp: new Date().toISOString()
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' && process.env.CLIENT_URL && process.env.CLIENT_URL !== '*' 
    ? process.env.CLIENT_URL.split(',').map(url => url.trim()) 
    : true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const driverRoutes = require('./routes/driverRoutes');
const parentRoutes = require('./routes/parentRoutes');
const locationRoutes = require('./routes/locationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/notifications', parentRoutes);
app.use('/api/location', locationRoutes);

app.get('/', (req, res) => {
  res.send('VisageRoute API is running securely.');
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    server.listen(PORT, HOST, () => {
      console.log(`Server and Socket.io running securely on http://${HOST}:${PORT}`);
      startKeepAlive();
    });
  })
  .catch((error) => console.error('MongoDB connection error:', error));


