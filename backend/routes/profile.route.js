import express from 'express';
import Profile from '../models/admin.model.js';
import Student from '../models/student.model.js'; // Assuming you have a Student model

const router = express.Router();

// POST or PUT: Save or update profile
router.post("/", async (req, res) => {
  try {
    const data = req.body;

    // Optional: Check if profile already exists and update
    const existing = await Profile.findOne({ email: data.email }); // if email is unique
    if (existing) {
      const updated = await Profile.findOneAndUpdate(
        { email: data.email },
        { $set: data },
        { new: true }
      );
      return res.status(200).json(updated);
    }

    // Else create new
    const newProfile = new Profile(data);
    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ message: "Server error while saving profile" });
  }
});

// Get student profile by ID
router.get('/student/:id', async (req, res) => {
  try {
      const student = await Student.findById(req.params.id)
          .populate('batches', 'name revenue'); // Populate batch info including revenue target
      
      if (!student) {
          return res.status(404).json({ message: 'Student not found' });
      }
      
      res.json(student);
  } catch (error) {
      console.error('Error fetching student profile:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
