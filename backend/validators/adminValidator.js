const { z } = require('zod');

// Schema for creating/updating a student
const studentSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters").trim(),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(10).max(15).trim(),
    address: z.string().min(5, "Address must be at least 5 characters").trim(),
    parentName: z.string().min(2, "Parent name is required").trim(),
    parentEmail: z.string().email("Invalid parent email format"),
    department: z.string().optional(),
    routeId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
    parentId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(), // Optional now because we create it automatically
    imageBase64: z.string().min(10, "A valid image is required"), // Added for biometric registration
    faceEmbedding: z.array(z.number()).length(128).optional(),
    busId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
});

// Schema for creating/updating a driver
const driverSchema = z.object({
    name: z.string().min(2).max(100).trim(),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(10).max(15).trim(),
    address: z.string().min(5).trim(),
    licenseNumber: z.string().min(5).max(20).trim(),
    busId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
});

// Schema for creating a Bus (Vehicle)
const busSchema = z.object({
    plateNumber: z.string().min(3).max(20).trim(),
    model: z.string().min(2).max(50).trim(),
    capacity: z.number().int().positive().max(100),
    driverId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
    assignedStudents: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
});

// Schema for creating/updating a bus route (path/schedule)
const busRouteSchema = z.object({
    routeName: z.string().min(3).max(50).trim(),
    driverId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
    capacity: z.number().int().positive().max(100, "Capacity cannot exceed 100"),
    schedule: z.object({
        departureTime: z.string().optional(),
        estimatedArrivalTime: z.string().optional(),
    }).optional(),
    status: z.enum(['Scheduled', 'In Transit', 'Completed', 'Delayed']).optional(),
});

// Generic Validation Middleware
const validateSchema = (schema) => {
    return (req, res, next) => {
        try {
            // Parse and strictly validate the request body
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError || error.name === 'ZodError' || (error.constructor && error.constructor.name === 'ZodError')) {
                const issues = error.issues || error.errors || [];
                // Return 400 Bad Request with formatted error details
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

module.exports = {
    studentSchema,
    driverSchema,
    busSchema,
    busRouteSchema,
    validateSchema,
};
