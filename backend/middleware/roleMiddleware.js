// Middleware to enforce Role-Based Access Control
// This should be run AFTER the protect middleware
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // req.user is set by the protect middleware
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                error: 'User role is missing or not authorized to access this route.'
            });
        }

        const userRole = req.user.role.toLowerCase();
        const allowedRoles = roles.map(r => r.toLowerCase());

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: `User role '${req.user.role}' is not authorized to access this route.`
            });
        }
        next();
    };
};

module.exports = { authorizeRoles };
