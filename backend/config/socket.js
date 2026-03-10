const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || '*', // Mobile app or local testing
            methods: ['GET', 'POST']
        }
    });

    // Security check: Socket handshake authentication middleware
    io.use(async (socket, next) => {
        try {
            // Clients must pass the token during connection
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication Error: Token missing'));
            }

            // Verify JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // JWT payload is { user: { id, role } } as signed by authController
            const userId = decoded.user ? decoded.user.id : decoded.id;

            // Fetch user from DB to ensure they still exist and have active access
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return next(new Error('Authentication Error: User not found'));
            }

            // Attach user details to socket for future events
            socket.user = user;
            next();
        } catch (err) {
            console.error('Socket Auth Error:', err.message);
            next(new Error('Authentication Error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Socket.io] New secured connection: socket ID ${socket.id}, User ID: ${socket.user._id}, Role: ${socket.user.role}`);

        socket.on('disconnect', () => {
            console.log(`[Socket.io] Disconnected: socket ID ${socket.id}`);
        });

        // Month 3 logic placeholder
        // socket.on('joinRouteRoom', (routeId) => { ... })
        // socket.on('updateLocation', (data) => { ... })
    });

    return io;
};

const getIo = () => {
    if (!io) throw new Error('Socket.io not initialized!');
    return io;
};

module.exports = { initSocket, getIo };
