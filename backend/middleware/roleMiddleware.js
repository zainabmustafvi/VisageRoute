// Middleware to enforce Role-Based Access Control
// This should be run AFTER the protect middleware
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // req.user is set by the protect middleware
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `User role '${req.user ? req.user.role : 'Unknown'}' is not authorized to access this route.`
            });
        }
        next();
    };
};

module.exports = { authorizeRoles };
