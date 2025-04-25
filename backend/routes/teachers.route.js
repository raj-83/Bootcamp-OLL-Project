import express from "express";
import Teacher from "../models/teacher.model.js";
import Batch from "../models/batch.model.js";
import Student from "../models/student.model.js";
import mongoose from "mongoose";
import  {getTeacherDashboardData}  from "../controllers/mentor/dashboard.controller.js";
import { protect, authorize } from '../middleware/auth.middleware.js';


const router = express.Router();

router.get('/dashboard', protect, authorize('Teacher','Mentor'), getTeacherDashboardData);

// GET /api/teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json(teachers);
  } catch (error) {
    console.error("Failed to fetch teachers:", error);
    res.status(500).json({ message: "Failed to fetch teachers" });
  }
});

// GET /api/teachers/:id
router.get('/:teacherId', async (req, res) => {
  const { teacherId } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    return res.status(400).json({ error: 'Invalid Teacher ID' });
  }

  try {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// PUT /api/teachers/:id - Update a teacher
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, specialization, status } = req.body;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid Teacher ID' });
  }

  try {
    // Check if email exists for a different teacher
    if (email) {
      const existingTeacher = await Teacher.findOne({ email, _id: { $ne: id } });
      if (existingTeacher) {
        return res.status(400).json({ message: 'Another teacher with this email already exists' });
      }
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      id,
      { name, email, phone, specialization, status },
      { new: true, runValidators: true }
    );

    if (!updatedTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json(updatedTeacher);
  } catch (err) {
    console.error('Error updating teacher:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// POST /api/teachers
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, specialization, status } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ message: "Name, email, and phone are required." });
    }

    // Check if email already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: "Teacher with this email already exists" });
    }

    const newTeacher = new Teacher({ 
      name, 
      email, 
      phone, 
      specialization, 
      status: status || 'active' 
    });
    
    await newTeacher.save();
    res.status(201).json(newTeacher);
  } catch (error) {
    console.error("Error adding teacher:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /api/teachers/:id - Delete a teacher
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid Teacher ID' });
  }

  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(id);

    if (!deletedTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Fix: Clear teacher field (since it's a single ObjectId not an array)
    await Batch.updateMany(
      { teacher: id },
      { $unset: { teacher: "" } } // or use { $set: { teacher: null } }
    );

    await Student.updateMany(
      { teachers: id },
      { $pull: { teachers: id } }
    );

    res.json({ message: 'Teacher deleted and references cleaned' });
  } catch (err) {
    console.error('Error deleting teacher:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});


export default router;
