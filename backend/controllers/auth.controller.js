// backend/controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';
import Admin from '../models/admin.model.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token valid for 7 days
  });
};

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

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

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
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};