const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const token =
        req.cookies?.token ||
        (req.headers.authorization && req.headers.authorization.startsWith('Bearer')
            ? req.headers.authorization.split(' ')[1]
            : null);

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userId = decoded._id || decoded.id || decoded.userId;

        // Support _id, id, role, and email in req.user (normalized for all endpoints)
        req.user = {
            _id: userId,
            id: userId,
            role: decoded.role,
            email: decoded.email
        };

        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = { protect };