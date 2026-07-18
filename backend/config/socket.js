const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LocationTracking = require('../models/LocationTracking');
const BusRouteAssignment = require('../models/BusRouteAssignment');
const BusRoute = require('../models/BusRoute');

let io;
const sentArrivalNotifications = new Set();
setInterval(() => sentArrivalNotifications.clear(), 24 * 60 * 60 * 1000);

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const calculateETA = async (busId, currentLat, currentLng) => {
    try {
        const assignment = await BusRouteAssignment.findOne({ busId, isActive: true });
        if (!assignment) return null;

        const route = await BusRoute.findById(assignment.routeId);
        if (!route || !route.stops || route.stops.length === 0) return null;

        let minDist = Infinity;
        let nextStop = null;
        for (const stop of route.stops) {
            if (!stop.coordinates || !stop.coordinates.latitude || !stop.coordinates.longitude) continue;
            const dist = haversineDistance(currentLat, currentLng, stop.coordinates.latitude, stop.coordinates.longitude);
            if (dist < minDist) {
                minDist = dist;
                nextStop = stop;
            }
        }

        if (!nextStop) return null;

        const avgSpeedKmH = 30;
        const etaMinutes = Math.round((minDist / avgSpeedKmH) * 60);
        return etaMinutes;
    } catch (err) {
        console.error('ETA Calculation Error:', err);
        return null;
    }
};

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST']
        }
    });

    io.use(async (socket, next) => {
        try {
            let token = socket.handshake.auth?.token || 
                        socket.handshake.headers?.authorization || 
                        socket.handshake.headers?.['x-auth-token'];

            if (token && token.startsWith('Bearer ')) {
                token = token.slice(7);
            }

            if (!token) return next(new Error('Authentication Error: Token missing'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const id = decoded.id || decoded.userId || (decoded.user ? (decoded.user.id || decoded.user._id) : null);
            const role = decoded.role || (decoded.user ? decoded.user.role : null);

            if (!id) return next(new Error('Authentication Error: Invalid token payload'));

            socket.user = { id, role };
            next();
        } catch (err) {
            console.error('Socket Auth Error:', err.message);
            next(new Error('Authentication Error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const { id, role } = socket.user;
        console.log(`[Socket.io] Connected: ID=${socket.id} | UserID=${id} | Role=${role}`);

        socket.join(id.toString());

        // ── JOIN ROUTE ROOM (legacy) ─────────────────────────────────────────
        socket.on('joinRouteRoom', (routeId) => {
            const room = `route_${routeId}`;
            socket.join(room);
            socket.currentRoom = room;
            console.log(`[Socket.io] ${role} ${id} joined room: ${room}`);
        });

        // ── DRIVER: JOIN BUS ROOM ────────────────────────────────────────────
        socket.on('join_bus_room', ({ busID }) => {
            if (role !== 'driver') return;
            const room = `bus_${busID}`;
            socket.join(room);
            socket.busRoom = room;
            socket.busID = busID;
            console.log(`[Socket.io] Driver joined bus room: ${room}`);
        });

        // ── PARENT: SUBSCRIBE TO BUS ─────────────────────────────────────────
        socket.on('subscribe_bus', (data) => {
            const busID = data?.busID || data?.busId;
            if (!busID) return;
            const room = `bus_${busID}`;
            socket.join(room);
            socket.busRoom = room;
            socket.busID = busID;
            console.log(`[Socket.io] Parent subscribed to bus room: ${room}`);
        });

        // ── DRIVER: EMIT BUS LOCATION UPDATE (Unified) ───────────────────────
        const handleLocationUpdate = async (data) => {
            if (role !== 'driver') {
                socket.emit('error', { message: 'Unauthorized: Only drivers can emit location.' });
                return;
            }

            const latitude = data.latitude !== undefined ? data.latitude : data.lat;
            const longitude = data.longitude !== undefined ? data.longitude : data.lng;
            const speed = data.speed || 0;
            const timestamp = data.timestamp || new Date().toISOString();

            if (latitude === undefined || longitude === undefined) {
                return;
            }

            try {
                const driverDoc = require('../models/Driver');
                const driverRecord = await driverDoc.findOne({ user: id });

                if (!driverRecord) {
                    console.error('[Socket.io] Driver profile not found for user ID:', id);
                    return;
                }

                const busID = data.busID || data.busId || driverRecord.assignedBusId;
                if (!busID) {
                    console.error('[Socket.io] No bus assigned to driver:', driverRecord._id);
                    return;
                }

                // 1. Save to MongoDB
                await LocationTracking.create({
                    busId: busID,
                    driverId: driverRecord._id,
                    latitude,
                    longitude,
                    speed,
                    timestamp: new Date(timestamp)
                });

                // 2. Calculate ETA using route stops
                const eta = await calculateETA(busID, latitude, longitude);

                // 3. Broadcast to all parents in this bus room
                const room = `bus_${busID}`;
                const broadcastData = {
                    busID,
                    busId: busID,
                    latitude,
                    longitude,
                    speed,
                    timestamp,
                    eta
                };

                io.to(room).emit('location_changed', broadcastData);
                io.to(room).emit('bus_location_update', broadcastData);

                // Also broadcast to legacy route room if driver has one
                if (socket.currentRoom) {
                    io.to(socket.currentRoom).emit('locationUpdate', {
                        driverLocation: { lat: latitude, lng: longitude },
                        eta,
                        timestamp,
                    });
                }

                // 4. CHECK ARRIVAL THRESHOLD for each parent on this bus
                if (eta !== null && eta <= 5) {
                    try {
                        const Student = require('../models/Student');
                        const Bus = require('../models/Bus');
                        const { sendNotification } = require('../services/fcmService');

                        const students = await Student.find({ 
                            busId: busID
                        }).populate({
                            path: 'parentId',
                            model: 'User',
                            select: 'fcmToken notificationPreferences'
                        });

                        const bus = await Bus.findById(busID).select('busNumber');

                        if (bus) {
                            for (const student of students) {
                                const parent = student.parentId;
                                if (!parent?.fcmToken) continue;
                                if (parent.notificationPreferences?.arrival_notify === false) continue;

                                // Prevent duplicate arrival notifications
                                const notifKey = `arrival_${busID}_${parent._id}_${new Date().toDateString()}`;
                                if (sentArrivalNotifications.has(notifKey)) continue;
                                sentArrivalNotifications.add(notifKey);

                                await sendNotification(
                                    parent.fcmToken,
                                    '📍 Bus Arriving Soon',
                                    `Bus #${bus.busNumber} is arriving at your pickup point in ~${eta} minutes.`,
                                    { 
                                        type: 'bus_arriving',
                                        busID: busID.toString(),
                                        etaMinutes: eta.toString()
                                    }
                                );
                            }
                        }
                    } catch (arrErr) {
                        console.error('[Socket.io] ETA check notification failed:', arrErr.message);
                    }
                }
            } catch (err) {
                console.error('[Socket.io] Error in location update handler:', err.message);
            }
        };

        socket.on('bus_location_update', handleLocationUpdate);
        socket.on('update_location', handleLocationUpdate);

        // ── DRIVER: END TRIP ─────────────────────────────────────────────────
        socket.on('trip_ended', ({ busID }) => {
            if (role !== 'driver') return;
            const room = `bus_${busID}`;
            io.to(room).emit('trip_ended', { busID });
            console.log(`[Socket.io] Trip ended for bus: ${busID}`);
        });

        // ── DRIVER: EMIT LOCATION (legacy) ───────────────────────────────────
        socket.on('updateLocation', ({ lat, lng, routeId }) => {
            if (role !== 'driver') {
                socket.emit('error', { message: 'Unauthorized: Only drivers can emit location.' });
                return;
            }

            const room = `route_${routeId}`;
            const distanceKm = haversineDistance(lat, lng, 24.8607, 67.0011);
            const etaMinutes = Math.round((distanceKm / 30) * 60);

            io.to(room).emit('locationUpdate', {
                driverLocation: { lat, lng },
                eta: etaMinutes,
                timestamp: new Date().toISOString(),
            });
        });

        socket.on('endTrip', ({ routeId }) => {
            if (role !== 'driver') return;
            const room = `route_${routeId}`;
            io.to(room).emit('tripEnded', { message: 'The bus has arrived. Trip complete.' });
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
