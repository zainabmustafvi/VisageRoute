const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /csv|xlsx|xls|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|text\/plain|application\/octet-stream/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype || extname) {
            return cb(null, true);
        }
        cb(new Error("Only CSV and XLSX/XLS files are allowed!"));
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { 
    validateSchema, 
    studentSchema,
    studentCreateSchema,
    driverSchema, 
    driverCreateSchema,
    busSchema,
    busRouteSchema 
} = require('../validators/adminValidator');

const {
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
} = require('../controllers/adminController');

// All admin routes must be protected and restricted to the 'admin' role
router.use(protect);
router.use(authorizeRoles('admin'));

// Student Routes
router.route('/students')
    .get(getStudents)
    .post(validateSchema(studentCreateSchema), createStudent);

router.route('/students/:id')
    .get(getStudentById)
    .put(validateSchema(studentSchema), updateStudent) // studentSchema is already .partial()
    .delete(deleteStudent);

// Driver Routes
router.route('/drivers')
    .get(getDrivers)
    .post(validateSchema(driverCreateSchema), createDriver);

router.route('/drivers/:id')
    .put(validateSchema(driverSchema), updateDriver) // driverSchema is already .partial()
    .delete(deleteDriver);

// Bus (Vehicle) Routes
router.route('/buses')
    .get(getBuses)
    .post(validateSchema(busSchema), createBus);

router.route('/buses/:id')
    .put(validateSchema(busSchema.partial()), updateBus)
    .delete(deleteBus);

router.get('/available-buses', getAvailableBuses);
router.get('/available-drivers', getAvailableDrivers);

// Bus Route (Path/Legacy) Routes
router.route('/routes')
    .get(getBusRoutes)
    .post(validateSchema(busRouteSchema), createBusRoute);

// Update Schedule
router.put('/routes/:id/schedule', updateRouteSchedule);

// --- Schedule Upload Routes ---
router.get('/stats', getAdminStats);
router.post('/upload-schedule', upload.single('schedule'), uploadSchedule);
router.post('/announcements', createAnnouncement);
router.get('/schedule-template', getScheduleTemplate);
router.get('/recent-uploads', getRecentUploads);

module.exports = router;
