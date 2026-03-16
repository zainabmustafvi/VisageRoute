const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

// Haversine formula — calculates straight-line distance (km) between two GPS points
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// School/destination coordinates (update to real coordinates)
const SCHOOL_LOCATION = { lat: 24.8607, lng: 67.0011 }; // Example: Karachi

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST']
        }
    });

    // Security: JWT verification on every socket handshake
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication Error: Token missing'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.user ? decoded.user.id : decoded.id;
            const user = await User.findById(userId).select('-password');

            if (!user) return next(new Error('Authentication Error: User not found'));

            socket.user = user;
            next();
        } catch (err) {
            console.error('Socket Auth Error:', err.message);
            next(new Error('Authentication Error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const { _id, role } = socket.user;
        console.log(`[Socket.io] Connected: ID=${socket.id} | UserID=${_id} | Role=${role}`);

        // ── JOIN ROUTE ROOM ──────────────────────────────────────────────────
        // Both drivers and parents call this to subscribe to a route's updates
        socket.on('joinRouteRoom', (routeId) => {
            const room = `route_${routeId}`;
            socket.join(room);
            socket.currentRoom = room;
            console.log(`[Socket.io] ${role} ${_id} joined room: ${room}`);
        });

        // ── DRIVER: EMIT LOCATION ────────────────────────────────────────────
        // Only drivers can broadcast location updates
        socket.on('updateLocation', ({ lat, lng, routeId }) => {
            // Security: Only allow drivers to emit location events
            if (role !== 'driver') {
                socket.emit('error', { message: 'Unauthorized: Only drivers can emit location.' });
                return;
            }

            const room = `route_${routeId}`;

            // Calculate rough ETA to school (avg bus speed ~30 km/h)
            const distanceKm = haversineDistance(lat, lng, SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng);
            const etaMinutes = Math.round((distanceKm / 30) * 60);

            // Broadcast to all users in this route's room (driver + parents)
            io.to(room).emit('locationUpdate', {
                driverLocation: { lat, lng },
                eta: etaMinutes,
                timestamp: new Date().toISOString(),
            });

            console.log(`[Socket.io] Route ${routeId} update: (${lat.toFixed(4)}, ${lng.toFixed(4)}) | ETA: ${etaMinutes} min`);
        });

        // ── DRIVER: END TRIP ─────────────────────────────────────────────────
        socket.on('endTrip', ({ routeId }) => {
            if (role !== 'driver') return;
            const room = `route_${routeId}`;
            io.to(room).emit('tripEnded', { message: 'The bus has arrived. Trip complete.' });
            console.log(`[Socket.io] Trip ended for route: ${routeId}`);
        });

        socket.on('disconnect', () => {
            console.log(`[Socket.io] Disconnected: ID=${socket.id}`);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) throw new Error('Socket.io not initialized!');
    return io;
};

module.exports = { initSocket, getIo };
