const jwt = require('jsonwebtoken');
const User = require('../models/users');

const SECRET_KEY = process.env.JWT_SECRET || 'my_super_secret_123!';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
    }

    const decodedToken = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decodedToken.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'TokenExpiredError',
        message: 'JWT Expired! Please login again.',
      });
    }
    return res.status(401).json({
      error: 'JsonWebTokenError',
      message: 'Invalid or malformed authentication token.',
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(String(req.user.userType))) {
      return res.status(403).json({
        message: 'Forbidden: You do not have permission to perform this action',
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
  SECRET_KEY,
};
