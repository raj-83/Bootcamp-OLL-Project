// routes/feedback.route.js
import express from "express";
import Feedback from "../models/feedback.model.js";

const router = express.Router();

// Submit feedback (general or batch review)
router.post("/",async (req, res) => {
  try {
    const feedback = new Feedback({
      ...req.body,
      student: req.user.student,
    });
    const savedFeedback = await feedback.save();
    res.status(201).json(savedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all feedback for a student
router.get("/student",async (req, res) => {
  try {
    const feedback = await Feedback.find({ student: req.user.student })
      .sort({ createdAt: -1 });
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get batch reviews for a specific batch
router.get("/batch/:batchId", async (req, res) => {
  try {
    const reviews = await Feedback.find({
      feedbackType: "batch",
      batchId: req.params.batchId,
    }).populate("student", "name email");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes (you may want to add admin middleware here)
// Get all feedback
router.get("/admin/all",async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("student", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update feedback status or add admin response
router.patch("/admin/:id",async (req, res) => {
  try {
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.status(200).json(updatedFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;