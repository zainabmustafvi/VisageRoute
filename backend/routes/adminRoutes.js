const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validateSchema, studentSchema, driverSchema, busRouteSchema } = require('../validators/adminValidator');

const {
    getStudents,
    createStudent,
    getDrivers,
    createDriver,
    getBusRoutes,
    createBusRoute
} = require('../controllers/adminController');

// All admin routes must be protected and restricted to the 'admin' role
router.use(protect);
router.use(authorizeRoles('admin'));

// Student Routes
router.route('/students')
    .get(getStudents)
    .post(validateSchema(studentSchema), createStudent);

// Driver Routes
router.route('/drivers')
    .get(getDrivers)
    .post(validateSchema(driverSchema), createDriver);

// Bus Route Routes
router.route('/routes')
    .get(getBusRoutes)
    .post(validateSchema(busRouteSchema), createBusRoute);

module.exports = router;
