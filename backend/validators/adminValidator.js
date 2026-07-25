const { z } = require('zod');

const idOrEmptyString = z.union([z.string().regex(/^[0-9a-fA-F]{24}$/), z.literal('')]).optional().nullable();

// Schema for creating a student (strict — all required fields must be present)
const studentCreateSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(7).max(15).trim(),
    address: z.string().min(2, "Address is required").trim(),
    parentName: z.string().min(2, "Parent name is required").trim(),
    parentEmail: z.string().email("Invalid parent email format"),
    department: z.string().optional(),
    routeId: idOrEmptyString,
    parentId: idOrEmptyString,
    imageBase64: z.string().min(10).optional(),
    faceEmbedding: z.array(z.number()).optional(),
    busId: idOrEmptyString,
    rollNo: z.string().optional(),
    year: z.string().optional(),
    semester: z.string().optional(),
    pickupPoint: z.string().optional(),
});

// Schema for updating a student — all fields optional
const studentSchema = studentCreateSchema.partial();

// Schema for creating a driver (strict)
const driverCreateSchema = z.object({
    name: z.string().min(2).max(100).trim(),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(7).max(15).trim(),
    employeeId: z.string().min(3).trim(),
    address: z.string().optional(),
    licenseNumber: z.string().min(5).max(20).trim(),
    licenseClass: z.enum(['Class A', 'Class B', 'Class C']),
    licenseExpiry: z.string().min(1, "License expiry is required"),
    assignedBusId: idOrEmptyString,
});

// Schema for updating a driver — all fields optional
const driverSchema = driverCreateSchema.partial();

const busSchema = z.object({
    busNumber: z.string().min(1, "Bus number is required").trim(),
    plateNumber: z.string().min(3).max(20).trim(),
    capacity: z.number().int().positive().max(100),
    gpsDeviceId: z.string().optional().nullable(),
    status: z.enum(['available', 'in-use', 'maintenance']).optional(),
    driverId: idOrEmptyString,
    assignedStudents: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
});

// Schema for creating/updating a bus route (path/schedule)
const busRouteSchema = z.object({
    routeName: z.string().min(3).max(50).trim(),
    driverId: idOrEmptyString,
    capacity: z.number().int().positive().max(100, "Capacity cannot exceed 100").optional(),
    schedule: z.object({
        departureTime: z.string().optional(),
        estimatedArrivalTime: z.string().optional(),
    }).optional(),
    status: z.enum(['Scheduled', 'In Transit', 'Completed', 'Delayed']).optional(),
});

const assignBusStudentSchema = z.object({
    studentId: z.string().optional(),
    id: z.string().optional(),
    busId: idOrEmptyString,
    routeId: idOrEmptyString,
});

const assignBusDriverSchema = z.object({
    driverId: z.string().optional(),
    id: z.string().optional(),
    busId: idOrEmptyString,
    assignedBusId: idOrEmptyString,
});

// Generic Validation Middleware
const validateSchema = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError || error.name === 'ZodError' || (error.constructor && error.constructor.name === 'ZodError')) {
                const issues = error.issues || error.errors || [];
                const errorMessages = issues.map((err) => ({
                    field: err.path ? err.path.join('.') : '',
                    message: err.message,
                }));
                return res.status(400).json({ errors: errorMessages });
            }
            console.error("Validation Error:", error);
            return res.status(500).json({ error: "Internal Server Error during validation" });
        }
    };
};

// Schema for login validation
const loginSchema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(['admin', 'driver', 'parent'], { errorMap: () => ({ message: "Role must be admin, driver, or parent" }) }),
});

module.exports = {
    studentSchema,
    studentCreateSchema,
    driverSchema,
    driverCreateSchema,
    busSchema,
    busRouteSchema,
    assignBusStudentSchema,
    assignBusDriverSchema,
    loginSchema,
    validateSchema,
};
