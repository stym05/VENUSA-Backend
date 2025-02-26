const jwt = require('jsonwebtoken');
// require("dotenv").config();

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

module.exports = authMiddleware;