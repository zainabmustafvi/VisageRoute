const Student = require('../models/Student');
const Driver = require('../models/Driver');
const BusRoute = require('../models/BusRoute');

// --- STUDENT CONTROLLERS ---

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
const getStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('parentId', 'userId').populate('routeId', 'routeName');
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Create a new student
// @route   POST /api/admin/students
// @access  Private/Admin
const createStudent = async (req, res) => {
    try {
        const { name, parentId, routeId } = req.body; // Validation already handled by Zod

        const student = new Student({ name, parentId, routeId });
        await student.save();

        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// --- DRIVER CONTROLLERS ---

// @desc    Get all drivers
// @route   GET /api/admin/drivers
// @access  Private/Admin
const getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find().populate('routeId', 'routeName');
        res.json(drivers);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Create a new driver
// @route   POST /api/admin/drivers
// @access  Private/Admin
const createDriver = async (req, res) => {
    try {
        const { name, phone, licenseNumber, routeId } = req.body;

        const existingLicense = await Driver.findOne({ licenseNumber });
        if (existingLicense) {
            return res.status(400).json({ error: 'License number already exists' });
        }

        const driver = new Driver({ name, phone, licenseNumber, routeId });
        await driver.save();

        res.status(201).json(driver);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// --- BUS ROUTE CONTROLLERS ---

// @desc    Get all bus routes
// @route   GET /api/admin/routes
// @access  Private/Admin
const getBusRoutes = async (req, res) => {
    try {
        const routes = await BusRoute.find().populate('driverId', 'name');
        res.json(routes);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Create a new bus route
// @route   POST /api/admin/routes
// @access  Private/Admin
const createBusRoute = async (req, res) => {
    try {
        const { routeName, driverId, capacity } = req.body;

        const existingRoute = await BusRoute.findOne({ routeName });
        if (existingRoute) {
            return res.status(400).json({ error: 'Route name already exists' });
        }

        const route = new BusRoute({ routeName, driverId, capacity });
        await route.save();

        res.status(201).json(route);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Update bus route schedule
// @route   PUT /api/admin/routes/:id/schedule
// @access  Private/Admin
const updateRouteSchedule = async (req, res) => {
    try {
        const { schedule, status } = req.body;

        const route = await BusRoute.findById(req.params.id);
        if (!route) {
            return res.status(404).json({ error: 'Route not found' });
        }

        if (schedule) route.schedule = { ...route.schedule, ...schedule };
        if (status) route.status = status;

        await route.save();
        res.json(route);
    } catch (err) {
        res.status(500).json({ error: 'Server Error updating schedule' });
    }
};

module.exports = {
    getStudents,
    createStudent,
    getDrivers,
    createDriver,
    getBusRoutes,
    createBusRoute,
    updateRouteSchedule,
};
