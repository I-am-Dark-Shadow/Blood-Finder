import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const isBloodBank = (req, res, next) => {
    if (req.user && req.user.role === 'Blood Bank') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Blood Bank role required.' });
    }
};

// NEW: Middleware to check for 'Test Lab' role
export const isTestLab = (req, res, next) => {
    if (req.user && req.user.role === 'Test Lab') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Test Lab role required.' });
    }
};