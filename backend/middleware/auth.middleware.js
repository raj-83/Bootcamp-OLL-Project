// backend/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';
import Admin from '../models/admin.model.js';

// Enhanced auth.middleware.js
export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check all models for the user
      let user = await Student.findById(decoded.id);
      let userType = 'Student';
      
      if (!user) {
        user = await Teacher.findById(decoded.id);
        userType = 'Teacher';
      }
      
      if (!user) {
        user = await Admin.findById(decoded.id);
        userType = 'Admin';
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      // Add user and explicit userType to the request
      req.user = user;
      req.userType = userType;
      next();
    } else {
      res.status(401).json({ message: 'Not authorized, no token' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Improved authorize middleware with more flexibility
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userType) && !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role ${req.userType || req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};