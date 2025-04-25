// backend/routes/admin.route.js
import express from "express";
import mongoose from "mongoose";
import Admin from "../models/admin.model.js"; // Adjust the path based on your project structure

const router = express.Router();

// GET admin by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid admin ID format" });
    }
    
    const admin = await Admin.findById(id);
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    return res.status(200).json(admin);
  } catch (error) {
    console.error("Error fetching admin:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT update admin by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid admin ID format" });
    }
    
    // Remove any fields that shouldn't be updated via this endpoint
    const { password, _id, __v, createdAt, updatedAt, ...safeUpdateData } = updateData;
    
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id, 
      { $set: safeUpdateData }, 
      { new: true, runValidators: true }
    );
    
    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    return res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error("Error updating admin:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET all admins (optional)
router.get("/", async (req, res) => {
  try {
    const admins = await Admin.find({}, { password: 0 }); // Exclude password field
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;