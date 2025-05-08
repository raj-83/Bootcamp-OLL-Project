// backend/controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';
import Admin from '../models/admin.model.js';

// Generate JWT token with user ID
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token valid for 7 days
  });
};

// Login handler - checks credentials and returns user with token
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check all models for the email
    let user = await Student.findOne({ email }) ||
               await Teacher.findOne({ email }) ||
               await Admin.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    // Set HTTP-only cookie with token (optional additional security)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      sameSite: 'strict'
    });
    
    // Return user data and token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Registration handler - creates new user based on role
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, school } = req.body;
    
    // Check if user exists in any model
    const userExists = await Student.findOne({ email }) ||
                       await Teacher.findOne({ email }) ||
                       await Admin.findOne({ email });
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    let user;
    // Create user based on role
    switch (role.toLowerCase()) {
      case 'student':
        user = await Student.create({
          name,
          email,
          password: hashedPassword,
          phone,
          school,
          role: 'Student'
        });
        break;
      case 'teacher':
      case 'mentor':
        user = await Teacher.create({
          name,
          email,
          password: hashedPassword,
          phone,
          role: 'Teacher'
        });
        break;
      default:
        return res.status(400).json({ message: 'Invalid role specified' });
    }
    
    if (user) {
      const token = generateToken(user._id);
      
      // Set HTTP-only cookie with token (optional additional security)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'strict'
      });
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// NEW: Token verification endpoint to check if token is still valid
export const verifyToken = async (req, res) => {
  try {
    // Token is already verified by the protect middleware
    // If we reach here, the token is valid
    
    // Find the user by ID from all possible models
    let user = await Student.findById(req.user._id) ||
               await Teacher.findById(req.user._id) ||
               await Admin.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return fresh user data
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// NEW: Logout function that clears the token cookie if using cookies
export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  
  res.status(200).json({ message: 'Logged out successfully' });
};