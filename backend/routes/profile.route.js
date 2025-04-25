import express from 'express';
import Profile from '../models/admin.model.js';

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

export default router;
