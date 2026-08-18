const LocationTracking = require('../models/LocationTracking');
const Driver = require('../models/Driver');
const BusRouteAssignment = require('../models/BusRouteAssignment');
const BusRoute = require('../models/BusRoute');
const { getIo } = require('../config/socket');

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude, speed, accuracy, timestamp } = req.body;

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: 'Missing required location fields' });
        }

        const driver = await Driver.findOne({ user: req.user.id });
        if (!driver) {
            return res.status(404).json({ error: 'Driver profile not found' });
        }
        if (!driver.assignedBusId) {
            return res.status(400).json({ error: 'No bus assigned to this driver' });
        }

        const bus_id = driver.assignedBusId;

        const newLocation = new LocationTracking({
            busId: bus_id,
            driverId: driver._id,
            latitude,
            longitude,
            speed,
            accuracy,
            timestamp: timestamp ? new Date(timestamp) : Date.now()
        });
        await newLocation.save();

        let eta = null;
        const assignment = await BusRouteAssignment.findOne({ busId: bus_id, isActive: true });
        if (assignment) {
            const route = await BusRoute.findById(assignment.routeId);
            if (route && route.stops && route.stops.length > 0) {
                let minDist = Infinity;
                for (const stop of route.stops) {
                    if (!stop.coordinates || !stop.coordinates.latitude || !stop.coordinates.longitude) continue;
                    const dist = haversineDistance(latitude, longitude, stop.coordinates.latitude, stop.coordinates.longitude);
                    if (dist < minDist) minDist = dist;
                }
                if (minDist < Infinity) {
                    eta = Math.round((minDist / 30) * 60);
                }
            }

            const io = getIo();
            const busRoom = `bus_${bus_id}`;
            io.to(busRoom).emit('bus_location_update', {
                busID: bus_id,
                latitude,
                longitude,
                speed: speed || 0,
                timestamp: newLocation.timestamp,
                eta
            });

            const routeRoom = `route_${assignment.routeId}`;
            io.to(routeRoom).emit('locationUpdate', {
                driverLocation: { lat: latitude, lng: longitude },
                eta,
                timestamp: newLocation.timestamp,
            });
        }

        res.status(200).json({ message: 'Location updated and broadcasted' });

    } catch (err) {
        console.error('Location Update Error:', err);
        res.status(500).json({ error: 'Server Error updating location' });
    }
};

const getLatestLocation = async (req, res) => {
    try {
        const { busId } = req.params;

        const latest = await LocationTracking.findOne({ busId })
            .sort({ timestamp: -1 })
            .lean();

        if (!latest) {
            return res.status(404).json({ error: 'No location data found for this bus' });
        }

        let eta = null;
        const assignment = await BusRouteAssignment.findOne({ busId, isActive: true });
        if (assignment) {
            const route = await BusRoute.findById(assignment.routeId);
            if (route && route.stops && route.stops.length > 0) {
                let minDist = Infinity;
                for (const stop of route.stops) {
                    if (!stop.coordinates || !stop.coordinates.latitude || !stop.coordinates.longitude) continue;
                    const dist = haversineDistance(latest.latitude, latest.longitude, stop.coordinates.latitude, stop.coordinates.longitude);
                    if (dist < minDist) minDist = dist;
                }
                if (minDist < Infinity) {
                    eta = Math.round((minDist / 30) * 60);
                }
            }
        }

        res.json({
            busId: latest.busId,
            latitude: latest.latitude,
            longitude: latest.longitude,
            speed: latest.speed,
            timestamp: latest.timestamp,
            eta
        });

    } catch (err) {
        console.error('Get Latest Location Error:', err);
        res.status(500).json({ error: 'Server Error fetching latest location' });
    }
};

module.exports = {
    updateLocation,
    getLatestLocation
};
