const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { 
    validateSchema, 
    studentSchema, 
    driverSchema, 
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
    updateRouteSchedule
} = require('../controllers/adminController');

// All admin routes must be protected and restricted to the 'admin' role
router.use(protect);
router.use(authorizeRoles('admin'));

// Student Routes
router.route('/students')
    .get(getStudents)
    .post(validateSchema(studentSchema), createStudent);

router.route('/students/:id')
    .get(getStudentById)
    .put(validateSchema(studentSchema.partial()), updateStudent) // Use partial schema for updates
    .delete(deleteStudent);

// Driver Routes
router.route('/drivers')
    .get(getDrivers)
    .post(validateSchema(driverSchema), createDriver);

router.route('/drivers/:id')
    .put(validateSchema(driverSchema.partial()), updateDriver)
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

module.exports = router;
