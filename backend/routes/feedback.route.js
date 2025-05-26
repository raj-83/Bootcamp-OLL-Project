import express from 'express';
import Feedback from '../models/feedback.model.js';
import BatchReview from '../models/batchReview.model.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { storage } from '../config/cloudinary.js';

const router = express.Router();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ========== FEEDBACK ROUTES ==========

// Create new feedback
router.post('/feedback', upload.single('image'), async (req, res) => {
  try {
    const { student, category, feedback } = req.body;
    
    const newFeedback = new Feedback({
      student,
      category,
      feedback,
      image: req.file ? req.file.path : ''
    });
    
    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all feedbacks for admin dashboard
router.get('/feedback', async (req, res) => {
  try {
    // Populate student field to get student details
    const feedbacks = await Feedback.find()
      .populate('student', 'name email') // Add the fields you need from student
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all feedbacks for a student
router.get('/feedback/student/:studentId', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ student: req.params.studentId })
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get feedback by ID
router.get('/feedback/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('student', 'name email'); // Populate student details
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update feedback status or reply (admin route)
router.patch('/feedback/:id', async (req, res) => {
  try {
    const { status, reply } = req.body;
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    
    if (status) feedback.status = status;
    if (reply) feedback.reply = reply;
    
    await feedback.save();
    
    // Get updated feedback with populated student field for response
    const updatedFeedback = await Feedback.findById(feedback._id)
      .populate('student', 'name email');
      
    res.json(updatedFeedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ========== BATCH REVIEW ROUTES ==========

// Create new batch review
router.post('/review', upload.single('image'), async (req, res) => {
  try {
    const { batch, student, rating, review } = req.body;
    
    const newReview = new BatchReview({
      batch,
      student,
      rating,
      review,
      image: req.file ? req.file.path : ''
    });
    
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all reviews for a batch
router.get('/review/batch/:batchId', async (req, res) => {
  try {
    const reviews = await BatchReview.find({ batch: req.params.batchId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all reviews by a student
router.get('/review/student/:studentId', async (req, res) => {
  try {
    const reviews = await BatchReview.find({ student: req.params.studentId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get review by ID
router.get('/review/:id', async (req, res) => {
  try {
    const review = await BatchReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;