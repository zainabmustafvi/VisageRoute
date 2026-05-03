const Student = require('../models/Student');
const Driver = require('../models/Driver');
const Bus = require('../models/Bus');
const BusRoute = require('../models/BusRoute');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendRegistrationEmail } = require('../utils/emailService');
const { extractFaceEmbedding } = require('../utils/faceService');

// Helper to generate a random password
const generatePassword = (length = 10) => {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
};

// --- STUDENT CONTROLLERS ---

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
const getStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .populate('parentId', 'userId')
            .populate('busId', 'plateNumber');
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Register a new student & parent user
// @route   POST /api/admin/students
// @access  Private/Admin
const createStudent = async (req, res) => {
    try {
        const { name, email, phone, address, parentName, parentEmail, department, routeId, imageBase64 } = req.body;

        // 1. Validate required fields
        console.log('--- Starting Student Registration ---');
        console.log('Registration details:', { name, email, phone });

        if (!imageBase64) {
            console.log('Error: Missing imageBase64');
            return res.status(400).json({ error: 'Student photo is required' });
        }

        // 2. Extract face embedding from uploaded photo
        let faceEmbedding;
        try {
            console.log('Extracting face embedding...');
            faceEmbedding = await extractFaceEmbedding(imageBase64);
            console.log('Face embedding extracted successfully. Length:', faceEmbedding ? faceEmbedding.length : 0);
        } catch (error) {
            console.error('CRITICAL: Face processing error details:', error.message || error);
            return res.status(500).json({ error: 'Failed to process face image. Please try again.' });
        }

        // 3. Block registration if no face detected in photo
        if (!faceEmbedding) {
            console.log('Error: No face detected');
            return res.status(400).json({
                error: 'No face detected. Please upload a clear photo of the student\'s face.'
            });
        }

        // 4. Check if parent user already exists
        const existingUser = await User.findOne({ userId: parentEmail });
        if (existingUser) {
            console.log('Error: User already exists:', parentEmail);
            return res.status(400).json({ error: 'A parent account with this email already exists' });
        }

        // 5. Generate random password
        console.log('Generating credentials...');
        const plainPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // 6. Create User (Parent/Guardian account for login)
        console.log('Saving User to database...');
        const user = new User({
            userId: parentEmail,
            password: hashedPassword,
            role: 'parent'
        });
        await user.save();
        console.log('User saved successfully. ID:', user._id);

        // 7. Create Student Profile with 128-d face embedding
        console.log('Saving Student profile to database...');
        const student = new Student({
            name,
            email,
            phone,
            address,
            department,
            busId: routeId, // Mapping routeId to busId as per schema
            faceEmbedding, // 128-d array for attendance system
            parentId: user._id
        });
        await student.save();
        console.log('Student profile saved successfully. ID:', student._id);

        // 8. Send credentials email
        console.log('Sending registration email...');
        const emailSent = await sendRegistrationEmail(parentEmail, parentName, parentEmail, plainPassword);
        console.log('Email sent status:', emailSent);

        console.log('--- Student Registration Completed Successfully ---');
        res.status(201).json({
            message: 'Student registered successfully. Credentials sent to email.',
            student: {
                _id: student._id,
                name: student.name,
                email: student.email,
                phone: student.phone,
                faceEmbeddingLength: faceEmbedding.length, // Confirm 128
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server Error during student registration' });
    }
};

// --- DRIVER CONTROLLERS ---

// @desc    Get all drivers
// @route   GET /api/admin/drivers
// @access  Private/Admin
const getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find();
        res.json(drivers);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Register a new driver & user
// @route   POST /api/admin/drivers
// @access  Private/Admin
const createDriver = async (req, res) => {
    try {
        const { name, email, phone, address, licenseNumber } = req.body;

        // 1. Check if user exists
        const existingUser = await User.findOne({ userId: email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const existingDriver = await Driver.findOne({ licenseNumber });
        if (existingDriver) {
            return res.status(400).json({ error: 'License number already exists' });
        }

        // 2. Generate random password
        const plainPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // 3. Create User
        const user = new User({
            userId: email,
            password: hashedPassword,
            role: 'driver'
        });
        await user.save();

        // 4. Create Driver Profile
        const driver = new Driver({
            name,
            email,
            phone,
            address,
            licenseNumber,
            userId: email // Storing plain email as reference
        });
        await driver.save();

        // 5. Send Email
        await sendRegistrationEmail(email, name, email, plainPassword);

        res.status(201).json({
            message: 'Driver registered successfully',
            driver
        });
    } catch (err) {
        console.error('Driver registration error:', err);
        res.status(500).json({ error: 'Server Error during driver registration' });
    }
};

// --- BUS CONTROLLERS ---

// @desc    Get all buses
// @route   GET /api/admin/buses
// @access  Private/Admin
const getBuses = async (req, res) => {
    try {
        const buses = await Bus.find()
            .populate('driverId', 'name')
            .populate('assignedStudents', 'name');
        res.json(buses);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Register a new bus
// @route   POST /api/admin/buses
// @access  Private/Admin
const createBus = async (req, res) => {
    try {
        const { plateNumber, model, capacity, driverId, assignedStudents } = req.body;

        const existingBus = await Bus.findOne({ plateNumber });
        if (existingBus) {
            return res.status(400).json({ error: 'Bus with this plate number already exists' });
        }

        const bus = new Bus({
            plateNumber,
            model,
            capacity,
            driverId,
            assignedStudents
        });
        await bus.save();

        res.status(201).json(bus);
    } catch (err) {
        console.error('Bus registration error:', err);
        res.status(500).json({ error: 'Server Error during bus registration' });
    }
};

// --- BUS ROUTE CONTROLLERS ---

// @desc    Get all bus routes
// @route   GET /api/admin/routes
// @access  Private/Admin
const getBusRoutes = async (req, res) => {
    try {
        const routes = await BusRoute.find()
            .populate('driverId', 'name email');
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
        const { routeName, driverId, schedule, status } = req.body;

        const existingRoute = await BusRoute.findOne({ routeName });
        if (existingRoute) {
            return res.status(400).json({ error: 'Route with this name already exists' });
        }

        const route = new BusRoute({
            routeName,
            driverId,
            schedule,
            status
        });
        await route.save();

        res.status(201).json(route);
    } catch (err) {
        console.error('Route creation error:', err);
        res.status(500).json({ error: 'Server Error during route creation' });
    }
};

// @desc    Update a route schedule
// @route   PUT /api/admin/routes/:id/schedule
// @access  Private/Admin
const updateRouteSchedule = async (req, res) => {
    try {
        const { departureTime, estimatedArrivalTime } = req.body;
        
        const route = await BusRoute.findById(req.params.id);
        if (!route) {
            return res.status(404).json({ error: 'Route not found' });
        }
        
        route.schedule = {
            departureTime: departureTime || route.schedule.departureTime,
            estimatedArrivalTime: estimatedArrivalTime || route.schedule.estimatedArrivalTime
        };
        
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
    getBuses,
    createBus,
    getBusRoutes,
    createBusRoute,
    updateRouteSchedule,
};
