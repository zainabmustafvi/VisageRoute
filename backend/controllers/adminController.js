const Student = require('../models/Student');
const Driver = require('../models/Driver');
const Bus = require('../models/Bus');
const BusRoute = require('../models/BusRoute');
const BusRouteAssignment = require('../models/BusRouteAssignment');
const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const path = require('path');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendRegistrationEmail, sendAnnouncementEmail } = require('../utils/emailService');

const { getIo } = require('../config/socket');

// Helper to generate a random password
const generatePassword = (length = 10) => {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
};

// Helper to generate the next Driver ID (DR + number)
const generateDriverId = async () => {
    // Find any driver that has a userId matching legacy pattern
    const allDrivers = await Driver.find({ userId: { $exists: true, $ne: null } })
        .sort({ createdAt: -1 })
        .limit(20);

    let highest = 1000;
    for (const d of allDrivers) {
        if (d.userId && /^DR\d+$/.test(d.userId)) {
            const num = parseInt(d.userId.replace('DR', ''));
            if (num > highest) highest = num;
        }
    }
    return `DR${highest + 1}`;
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
        const { name, email, phone, address, parentName, parentEmail, department, routeId } = req.body;

        // 1. Validate required fields
        console.log('--- Starting Student Registration ---');
        console.log('Registration details:', { name, email, phone });


        // 4. Check if parent user already exists
        const existingUser = await User.findOne({ email: parentEmail.toLowerCase() });
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
            email: parentEmail.toLowerCase(),
            password: hashedPassword,
            role: 'parent'
        });
        await user.save();
        console.log('User saved successfully. ID:', user._id);

        // 7. Create Student Profile
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
            busId: routeId,
            parentId: user._id
        });

        await student.save();
        console.log('Student profile saved successfully. ID:', student._id);

        // 8. Send credentials email — FIRE AND FORGET (do NOT await, prevents 499 timeout)
        sendRegistrationEmail(parentEmail, parentName, parentEmail, plainPassword)
            .catch(err => console.error('Parent registration email failed:', err.message));

        console.log('--- Student Registration Completed Successfully ---');
        res.status(201).json({
            message: 'Student registered successfully. Credentials sent to email.',
            student: {
                _id: student._id,
                name: student.name,
                email: student.email,
                phone: student.phone,
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
        const mongoose = require('mongoose');
        const studentId = mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null;
        const student = studentId ? await Student.findById(studentId) : null;


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

        // If admin changed parentEmail, ensure the linked User email/legacy field updates.
        // Also keep userId as non-unique legacy display only.
        if (parentEmail && parentEmail !== student.parentEmail) {
            student.parentEmail = parentEmail;
        }








        await student.save();

        // 3. Update Parent Info in User model.
        // Must link via MongoDB _id (student.parentId), not via legacy serial identifiers.
        if (parentEmail || parentName) {
            const user = await User.findById(student.parentId);
            if (user) {
                if (parentEmail) {
                    // userId is legacy display only (non-unique).
                    user.userId = parentEmail;
                    user.email = parentEmail.toLowerCase();
                }
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
        // IMPORTANT: Do NOT use legacy/static userId as a unique identity.
        // Identity is enforced by email + password; user._id is the stable key.
        const user = new User({
            // Keep legacy field for display only, but do not assume uniqueness.
            userId: generatedUserId,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'driver'
        });

        await user.save();

        // 4. Create Driver Profile (with user ObjectId link for modern lookups)
        const driver = new Driver({
            name,
            email: email.toLowerCase(),
            phone,
            employeeId,
            address,
            licenseNumber,
            licenseClass,
            licenseExpiry,
            userId: generatedUserId,
            user: user._id,
            assignedBusId: assignedBusId || null
        });
        await driver.save();

        // 5. Update Bus assignment if provided
        if (assignedBusId) {
            await Bus.findByIdAndUpdate(assignedBusId, { driverId: driver._id });
        }

        // 6. Send Credentials to driver's email — FIRE AND FORGET (no await — prevents 499 timeout)
        sendRegistrationEmail(email, name, email, plainPassword)
            .catch(emailError => console.error('Driver email failed (non-critical):', emailError.message));

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

// --- SCHEDULE UPLOAD CONTROLLERS ---

// @desc    Upload bus schedule via CSV/XLSX
// @route   POST /api/admin/upload-schedule
// @access  Private/Admin
const uploadSchedule = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a file' });
        }

        const filePath = req.file.path;
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        let results = [];

        if (fileExt === '.csv') {
            results = await parseCSV(filePath);
        } else if (fileExt === '.xlsx') {
            results = parseXLSX(filePath);
        } else {
            fs.unlinkSync(filePath);
            return res.status(400).json({ error: 'Please upload a valid CSV/XLSX file' });
        }

        const processedResults = [];
        const errors = [];

        for (const row of results) {
            try {
                // Map columns: Bus Number, Trip Name, Route, Pickup Time, Drop Time, Days of Week
                const busNum = row['Bus Number'];
                const tripName = row['Trip Name'];
                const routeName = row['Route'];
                const pickupTime = row['Pickup Time'];
                const dropTime = row['Drop Time'];
                const daysStr = row['Days of Week'] || '1,2,3,4,5';

                if (!busNum || !routeName) {
                    errors.push(`Row missing bus or route info: ${JSON.stringify(row)}`);
                    continue;
                }

                const bus = await Bus.findOne({ busNumber: busNum });
                let route = await BusRoute.findOne({ routeName });

                if (!bus) {
                    errors.push(`Bus #${busNum} not found`);
                    continue;
                }

                if (!route) {
                    route = new BusRoute({ routeName });
                    await route.save();
                }

                const daysOfWeek = daysStr.split(',').map(d => parseInt(d.trim()));

                const assignment = await BusRouteAssignment.findOneAndUpdate(
                    { busId: bus._id, routeId: route._id, tripName },
                    {
                        scheduleTime: `${pickupTime} - ${dropTime}`,
                        pickupTime,
                        dropTime,
                        daysOfWeek,
                        isActive: true,
                        fileName: req.file.originalname
                    },
                    { upsert: true, new: true }
                );

                processedResults.push(assignment);
            } catch (innerErr) {
                errors.push(`Error processing row: ${innerErr.message}`);
            }
        }

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        res.json({
            message: 'Schedule processed successfully',
            count: processedResults.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (err) {
        console.error('Upload Error:', err);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Server Error during schedule upload' });
    }
};

// @desc    Get CSV Template for schedule
// @route   GET /api/admin/schedule-template
// @access  Private/Admin
const getScheduleTemplate = (req, res) => {
    const csvContent = "Bus Number,Trip Name,Route,Pickup Time,Drop Time,Days of Week\n101,Morning Trip,Route A,07:30 AM,08:30 AM,\"1,2,3,4,5\"\n102,Evening Trip,Route B,03:30 PM,04:30 PM,\"1,2,3,4,5\"";
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=schedule_template.csv');
    res.status(200).send(csvContent);
};

// @desc    Get recently uploaded schedules
// @route   GET /api/admin/recent-uploads
// @access  Private/Admin
const getRecentUploads = async (req, res) => {
    try {
        const uploads = await BusRouteAssignment.find()
            .populate('busId', 'busNumber plateNumber')
            .populate('routeId', 'routeName')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json(uploads);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

// Helper: Parse CSV
const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};

// Helper: Parse XLSX
const parseXLSX = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
};

// @desc    Create and send an announcement
// @route   POST /api/admin/announcements
// @access  Private/Admin
const createAnnouncement = async (req, res) => {
    try {
        const { title, content, recipients, deliveryOptions, priority } = req.body;
        console.log('--- Announcement Send Request ---');
        console.log('Admin ID from req.user:', req.user?.id || req.user?._id);
        console.log('Payload:', JSON.stringify(req.body, null, 2));

        const announcement = await Announcement.create({
            adminId: req.user.id || req.user._id,
            title,
            content,
            recipients,
            deliveryOptions,
            priority,
            isSent: true,
            sentAt: Date.now()
        });
        console.log('Announcement saved to DB. ID:', announcement._id);

        let targetUsers = [];

        if (recipients.type !== 'all' && recipients.targetId) {
            const mongoose = require('mongoose');
            if (!mongoose.Types.ObjectId.isValid(recipients.targetId)) {
                return res.status(400).json({ error: 'Invalid target ID format' });
            }
        }

        if (recipients.type === 'all') {
            targetUsers = await User.find({ role: { $in: ['parent', 'driver'] } }).select('userId email fcmToken notificationPreferences');
        } else if (recipients.type === 'route') {
            // 1. Find all buses assigned to this route
            const BusRouteAssignment = require('../models/BusRouteAssignment');
            const assignments = await BusRouteAssignment.find({ routeId: recipients.targetId }).select('busId');
            const busIds = [...new Set(assignments.map(a => a.busId.toString()))];

            // 2. Find students assigned to any of these buses
            const students = await Student.find({ busId: { $in: busIds } });
            const parentIds = students.map(s => s.parentId).filter(id => id);
            
            // 3. Find drivers assigned to any of these buses
            const drivers = await Driver.find({ assignedBusId: { $in: busIds } });
            const driverEmails = drivers.map(d => d.email).filter(e => e);
            const driverUserIds = drivers.map(d => d.user).filter(id => id);

            targetUsers = await User.find({
                $or: [
                    { _id: { $in: parentIds } },
                    { _id: { $in: driverUserIds } },
                    { email: { $in: driverEmails }, role: 'driver' }
                ]
            }).select('userId email fcmToken notificationPreferences');
        } else if (recipients.type === 'bus') {
            // Find students on this bus
            const students = await Student.find({ busId: recipients.targetId });
            const parentIds = students.map(s => s.parentId).filter(id => id);
            
            // Find drivers assigned to this bus
            const drivers = await Driver.find({ assignedBusId: recipients.targetId });
            const driverEmails = drivers.map(d => d.email).filter(e => e);
            const driverUserIds = drivers.map(d => d.user).filter(id => id);

            targetUsers = await User.find({
                $or: [
                    { _id: { $in: parentIds } },
                    { _id: { $in: driverUserIds } },
                    { email: { $in: driverEmails }, role: 'driver' }
                ]
            }).select('userId email fcmToken notificationPreferences');
        }

        let io;
        try {
            io = getIo();
        } catch (sErr) {
            console.error('Socket not initialized, skipping socket push notification');
        }

        // Send via Socket.io and FCM
        if (deliveryOptions.push) {
            const { sendNotification } = require('../services/fcmService');
            const AnnouncementDelivery = require('../models/AnnouncementDelivery');

            targetUsers.forEach(async (user) => {
                try {
                    // Socket.io real-time update
                    if (io) {
                        try {
                            io.to(user._id.toString()).emit('newAnnouncement', {
                                id: announcement._id,
                                title,
                                content,
                                priority,
                                sentAt: announcement.sentAt
                            });
                        } catch (sockErr) {
                            console.error('Socket newAnnouncement emit failed:', sockErr.message);
                        }
                    }

                    // Firebase Cloud Messaging Push Notification
                    if (user.fcmToken) {
                        try {
                            await sendNotification(
                                user.fcmToken,
                                `📢 ${title}`,
                                content,
                                { 
                                    type: 'announcement', 
                                    announcementId: announcement._id.toString(),
                                    priority 
                                }
                            );

                            // Save to announcementdeliveries
                            await AnnouncementDelivery.create({
                                announcementId: announcement._id,
                                userId: user._id,
                                status: 'sent'
                            });
                        } catch (fcmErr) {
                            console.error(`FCM/Delivery log failed for user ${user._id}:`, fcmErr.message);
                            // Save failed delivery
                            try {
                                await AnnouncementDelivery.create({
                                    announcementId: announcement._id,
                                    userId: user._id,
                                    status: 'failed'
                                });
                            } catch (logErr) {
                                console.error('Saving failed delivery log failed:', logErr.message);
                            }
                        }
                    }
                } catch (pushErr) {
                    console.error(`Error processing push notification loop for user ${user._id}:`, pushErr);
                }
            });
        }

        // Send via Email
        if (deliveryOptions.email) {
            targetUsers.forEach(user => {
                try {
                    sendAnnouncementEmail(user.email || user.userId, title, content, priority);
                } catch (emailErr) {
                    console.error(`Email delivery failed to user ${user.email || user.userId}:`, emailErr);
                }
            });
        }

        res.status(201).json({
            message: 'Announcement sent successfully',
            recipientCount: targetUsers.length
        });

    } catch (err) {
        console.error('Announcement Error:', err);
        res.status(500).json({ error: 'Server Error sending announcement' });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const busCount = await Bus.countDocuments();
        const studentCount = await Student.countDocuments();
        const driverCount = await Driver.countDocuments({ isActive: true });

        // You could also calculate active trips here if needed

        res.json({
            buses: busCount,
            students: studentCount,
            drivers: driverCount
        });
    } catch (err) {
        res.status(500).json({ error: 'Server Error fetching stats' });
    }
};

module.exports = {
    getAdminStats,
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
    uploadSchedule,
    getScheduleTemplate,
    getRecentUploads,
    createAnnouncement,
    getAdminStats
};
