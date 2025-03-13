const jwt = require('jsonwebtoken');

const secretKey = 'your_secret_key';

const generateToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '7d' });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, secretKey);
    } catch (err) {
        return null;
    }
};

const generateMailToken = (user) => {
    return jwt.sign({ username: user.username, email: user.email }, secretKey, { expiresIn: '3d' });
};

module.exports = { generateToken, verifyToken , generateMailToken, jwt, secretKey};