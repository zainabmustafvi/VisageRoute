const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token = req.cookies.token;

    // Support both HttpOnly cookies and mobile Authorization Headers
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // FIX: Assign the decoded payload directly since there's no nested "user" object
        req.user = {
            id: decoded.userId,
            role: decoded.role,
            email: decoded.email
        };
        
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = { protect };