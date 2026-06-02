const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
    try {
        const authHeader = req.header('Authorization') || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!token) {
            return res.status(401).json({ msg: 'Access denied. Missing token.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        return next();
    } catch (err) {
        return res.status(401).json({ msg: 'Invalid or expired token.' });
    }
}

function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ msg: 'Forbidden. Insufficient permissions.' });
        }
        return next();
    };
}

module.exports = {
    authenticate,
    authorizeRoles
};
