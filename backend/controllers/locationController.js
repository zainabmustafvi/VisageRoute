const LocationTracking = require('../models/LocationTracking');
const Driver = require('../models/Driver');
const { getIo } = require('../config/socket');

// @desc    Update bus location and broadcast
// @route   POST /api/location/update
// @access  Private/Driver
const updateLocation = async (req, res) => {
    try {
        const { bus_id, latitude, longitude, speed, accuracy, timestamp } = req.body;
        const driverId = req.user.id; // From auth middleware

        if (!bus_id || !latitude || !longitude) {
            return res.status(400).json({ error: 'Missing required location fields' });
        }

        // 1. Save to historical tracking table
        const newLocation = new LocationTracking({
            busId: bus_id,
            driverId,
            latitude,
            longitude,
            speed,
            accuracy,
            timestamp: timestamp ? new Date(timestamp) : Date.now()
        });
        await newLocation.save();

        // 2. Broadcast to all users in the route room
        // Note: The routeId is used for the room name in socket.js
        // We might need to lookup the routeId associated with this bus
        const BusRouteAssignment = require('../models/BusRouteAssignment');
        const assignment = await BusRouteAssignment.findOne({ busId: bus_id, isActive: true });

        if (assignment) {
            const io = getIo();
            const room = `route_${assignment.routeId}`;
            
            io.to(room).emit('locationUpdate', {
                busId: bus_id,
                driverLocation: { lat: latitude, lng: longitude },
                speed,
                timestamp: newLocation.timestamp,
            });
        }

        res.status(200).json({ message: 'Location updated and broadcasted' });

    } catch (err) {
        console.error('Location Update Error:', err);
        res.status(500).json({ error: 'Server Error updating location' });
    }
};

module.exports = {
    updateLocation
};
