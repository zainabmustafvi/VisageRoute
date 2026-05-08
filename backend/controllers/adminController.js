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

// Helper to generate the next Driver ID (DR + number)
const generateDriverId = async () => {
    const lastDriver = await Driver.findOne({ userId: /^DR\d+$/ })
        .sort({ userId: -1 }); // Sort by userId descending to get the highest number
    
    if (!lastDriver) return 'DR1001'; // Start from 1001 if no drivers exist
    
    const lastId = lastDriver.userId.replace('DR', '');
    const nextNumber = parseInt(lastId) + 1;
    return `DR${nextNumber}`;
};

// --- STUDENT CONTROLLERS ---

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
// @desc    Get a single student by ID
// @route   GET /api/admin/students/:id
// @access  Private/Admin
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('parentId', 'userId')
            .populate('busId', 'plateNumber');
        
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

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
            parentName,
            parentEmail,
            department,
            rollNo: req.body.rollNo,
            year: req.body.year,
            semester: req.body.semester,
            pickupPoint: req.body.pickupPoint,
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

// @desc    Update a student
// @route   PUT /api/admin/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
    try {
        const { name, email, phone, address, parentName, parentEmail, department, routeId, imageBase64 } = req.body;
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // 1. Update Student Basic Info
        student.name = name || student.name;
        student.email = email || student.email;
        student.phone = phone || student.phone;
        student.address = address || student.address;
        student.parentName = parentName || student.parentName;
        student.parentEmail = parentEmail || student.parentEmail;
        student.department = department || student.department;
        student.rollNo = req.body.rollNo || student.rollNo;
        student.year = req.body.year || student.year;
        student.semester = req.body.semester || student.semester;
        student.pickupPoint = req.body.pickupPoint || student.pickupPoint;
        student.busId = routeId || student.busId;

        // 2. Update Face Embedding if new image is provided
        if (imageBase64) {
            console.log('New photo provided, re-extracting face embedding...');
            const faceEmbedding = await extractFaceEmbedding(imageBase64);
            if (!faceEmbedding) {
                return res.status(400).json({ error: 'No face detected in new photo' });
            }
            student.faceEmbedding = faceEmbedding;
        }

        await student.save();

        // 3. Update Parent Info in User model if email changed
        if (parentEmail || parentName) {
            const user = await User.findById(student.parentId);
            if (user) {
                if (parentEmail) user.userId = parentEmail;
                // If we had a 'name' field in User model, we'd update it here
                await user.save();
            }
        }

        res.json({ message: 'Student updated successfully', student });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: 'Server Error during student update' });
    }
};

// @desc    Delete a student
// @route   DELETE /api/admin/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Note: In a production app, we might want to delete the Parent User as well
        // but only if they don't have other students. For now, we just delete the student.
        await Student.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Server Error during student deletion' });
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
        const { name, email, phone, employeeId, address, licenseNumber, licenseClass, licenseExpiry, assignedBusId } = req.body;

        // 1. Validation for uniqueness
        const existingEmail = await Driver.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const existingLicense = await Driver.findOne({ licenseNumber });
        if (existingLicense) {
            return res.status(400).json({ error: 'License number already exists' });
        }

        const existingEmployee = await Driver.findOne({ employeeId });
        if (existingEmployee) {
            return res.status(400).json({ error: 'Employee ID already exists' });
        }

        // 2. Generate Credentials
        const generatedUserId = await generateDriverId();
        const plainPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // 3. Create User Account
        const user = new User({
            userId: generatedUserId,
            password: hashedPassword,
            role: 'driver'
        });
        await user.save();

        // 4. Create Driver Profile
        const driver = new Driver({
            name,
            email,
            phone,
            employeeId,
            address,
            licenseNumber,
            licenseClass,
            licenseExpiry,
            userId: generatedUserId,
            assignedBusId: assignedBusId || null
        });
        await driver.save();

        // 5. Update Bus assignment if provided
        if (assignedBusId) {
            await Bus.findByIdAndUpdate(assignedBusId, { driverId: driver._id });
        }

        // 6. Send Credentials to driver's email
        // We use the driver's email for notification, but they log in with DRxxxx ID
        await sendRegistrationEmail(email, name, generatedUserId, plainPassword);

        res.status(201).json({
            message: 'Driver registered successfully',
            driver: {
                _id: driver._id,
                name: driver.name,
                userId: driver.userId,
                email: driver.email
            }
        });
    } catch (err) {
        console.error('Driver registration error:', err);
        res.status(500).json({ error: 'Server Error during driver registration' });
    }
};

// @desc    Update a driver
// @route   PUT /api/admin/drivers/:id
// @access  Private/Admin
const updateDriver = async (req, res) => {
    try {
        const { name, email, phone, employeeId, address, licenseNumber, licenseClass, licenseExpiry, assignedBusId } = req.body;
        const driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        // Check for conflicts if fields changed
        if (email && email !== driver.email) {
            const existing = await Driver.findOne({ email });
            if (existing) return res.status(400).json({ error: 'Email already exists' });
        }
        if (licenseNumber && licenseNumber !== driver.licenseNumber) {
            const existing = await Driver.findOne({ licenseNumber });
            if (existing) return res.status(400).json({ error: 'License number already exists' });
        }

        driver.name = name || driver.name;
        driver.email = email || driver.email;
        driver.phone = phone || driver.phone;
        driver.employeeId = employeeId || driver.employeeId;
        driver.address = address || driver.address;
        driver.licenseNumber = licenseNumber || driver.licenseNumber;
        driver.licenseClass = licenseClass || driver.licenseClass;
        driver.licenseExpiry = licenseExpiry || driver.licenseExpiry;

        // Handle Bus Reassignment
        if (assignedBusId !== undefined && assignedBusId !== driver.assignedBusId) {
            // Unlink old bus if exists
            if (driver.assignedBusId) {
                await Bus.findByIdAndUpdate(driver.assignedBusId, { driverId: null });
            }
            // Link new bus if provided
            if (assignedBusId) {
                await Bus.findByIdAndUpdate(assignedBusId, { driverId: driver._id });
            }
            driver.assignedBusId = assignedBusId;
        }

        await driver.save();
        res.json({ message: 'Driver updated successfully', driver });
    } catch (err) {
        console.error('Driver update error:', err);
        res.status(500).json({ error: 'Server Error during driver update' });
    }
};

// @desc    Soft-delete a driver
// @route   DELETE /api/admin/drivers/:id
// @access  Private/Admin
const deleteDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) return res.status(404).json({ error: 'Driver not found' });

        driver.isActive = false;
        // Also unlink bus if assigned
        if (driver.assignedBusId) {
            await Bus.findByIdAndUpdate(driver.assignedBusId, { driverId: null });
            driver.assignedBusId = null;
        }
        
        await driver.save();
        res.json({ message: 'Driver deactivated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server Error during driver deletion' });
    }
};

// @desc    Get buses without an assigned driver
// @route   GET /api/admin/available-buses
// @access  Private/Admin
const getAvailableBuses = async (req, res) => {
    try {
        // Find buses where driverId is not set or null
        const buses = await Bus.find({ 
            $or: [
                { driverId: { $exists: false } },
                { driverId: null }
            ]
        });
        res.json(buses);
    } catch (err) {
        console.error('Error fetching available buses:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// @desc    Get drivers without an assigned bus
// @route   GET /api/admin/available-drivers
// @access  Private/Admin
const getAvailableDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find({
            $or: [
                { assignedBusId: { $exists: false } },
                { assignedBusId: null }
            ]
        }).select('name email phone employeeId');
        res.json(drivers);
    } catch (err) {
        console.error('Error fetching available drivers:', err);
        res.status(500).json({ error: 'Server Error' });
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
        const { busNumber, plateNumber, capacity, driverId, gpsDeviceId } = req.body;

        // Check for duplicate Bus Number
        const existingBusNum = await Bus.findOne({ busNumber });
        if (existingBusNum) {
            return res.status(400).json({ 
                error: `Bus with number ${busNumber} already exists.`,
                existingBus: existingBusNum 
            });
        }

        // Check for duplicate Plate Number
        const existingPlate = await Bus.findOne({ plateNumber });
        if (existingPlate) {
            return res.status(400).json({ error: 'Bus with this plate number already exists' });
        }

        const bus = new Bus({
            busNumber,
            plateNumber,
            capacity,
            driverId,
            gpsDeviceId,
            status: 'available'
        });
        await bus.save();

        // If driver assigned, update driver record
        if (driverId) {
            await Driver.findByIdAndUpdate(driverId, { assignedBusId: bus._id });
        }

        res.status(201).json({
            message: 'Bus registered successfully',
            bus
        });
    } catch (err) {
        console.error('Bus registration error:', err);
        res.status(500).json({ error: 'Server Error during bus registration' });
    }
};

// @desc    Update a bus
// @route   PUT /api/admin/buses/:id
// @access  Private/Admin
const updateBus = async (req, res) => {
    try {
        const { busNumber, plateNumber, capacity, driverId, gpsDeviceId, status } = req.body;
        const bus = await Bus.findById(req.params.id);

        if (!bus) return res.status(404).json({ error: 'Bus not found' });

        // Conflict validation
        if (busNumber && busNumber !== bus.busNumber) {
            const existing = await Bus.findOne({ busNumber });
            if (existing) return res.status(400).json({ error: 'Bus number already exists' });
        }
        if (plateNumber && plateNumber !== bus.plateNumber) {
            const existing = await Bus.findOne({ plateNumber });
            if (existing) return res.status(400).json({ error: 'Plate number already exists' });
        }

        bus.busNumber = busNumber || bus.busNumber;
        bus.plateNumber = plateNumber || bus.plateNumber;
        bus.capacity = capacity || bus.capacity;
        bus.gpsDeviceId = gpsDeviceId !== undefined ? gpsDeviceId : bus.gpsDeviceId;
        bus.status = status || bus.status;

        // Handle Driver reassignment
        if (driverId !== undefined && driverId !== bus.driverId) {
            // Unlink old driver
            if (bus.driverId) {
                await Driver.findByIdAndUpdate(bus.driverId, { assignedBusId: null });
            }
            // Link new driver
            if (driverId) {
                await Driver.findByIdAndUpdate(driverId, { assignedBusId: bus._id });
            }
            bus.driverId = driverId;
        }

        await bus.save();
        res.json({ message: 'Bus updated successfully', bus });
    } catch (err) {
        console.error('Bus update error:', err);
        res.status(500).json({ error: 'Server Error during bus update' });
    }
};

// @desc    Delete a bus
// @route   DELETE /api/admin/buses/:id
// @access  Private/Admin
const deleteBus = async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id);
        if (!bus) return res.status(404).json({ error: 'Bus not found' });

        // Unlink driver if assigned
        if (bus.driverId) {
            await Driver.findByIdAndUpdate(bus.driverId, { assignedBusId: null });
        }

        await Bus.findByIdAndDelete(req.params.id);
        res.json({ message: 'Bus deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server Error during bus deletion' });
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
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getDrivers,
    createDriver,
    updateDriver,
    deleteDriver,
    getAvailableBuses,
    getAvailableDrivers,
    getBuses,
    createBus,
    updateBus,
    deleteBus,
    getBusRoutes,
    createBusRoute,
    updateRouteSchedule,
};
