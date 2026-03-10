const { z } = require('zod');

// Schema for creating/updating a student
const studentSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters").trim(),
    parentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Parent ID format (must be a valid MongoDB ObjectId)"),
    routeId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Route ID format").optional().nullable(),
});

// Schema for creating/updating a driver
const driverSchema = z.object({
    name: z.string().min(2).max(100).trim(),
    phone: z.string().min(10).max(15).trim(),
    licenseNumber: z.string().min(5).max(20).trim(),
    routeId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
});

// Schema for creating/updating a bus route
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
            if (error instanceof z.ZodError || error.name === 'ZodError') {
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
    busRouteSchema,
    validateSchema,
};
