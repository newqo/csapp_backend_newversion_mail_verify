const { verifyToken } = require('../utils/jwt');

const authenticate = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = decoded;
    next();
};

module.exports = authenticate;