// backend/routes/sessionRoutes.js
import express from "express";
import Session from "../models/session.model.js";
import Batch from "../models/batch.model.js";
import Teacher from "../models/teacher.model.js";
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new session
router.post("/", async (req, res) => {
  try {
    const { title, batch, date, time, notes } = req.body;

    if (!title || !batch || !date || !time || !notes) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Step 1: Create the session
    const newSession = new Session({
      title,
      batch, // This should be the batch ObjectId
      date,
      time,
      notes
    });

    const savedSession = await newSession.save();

    // Step 2: Update the batch document to include this session ID
    await Batch.findByIdAndUpdate(
      batch,
      { $push: { session: savedSession._id } },
      { new: true }
    );

    res.status(201).json({
      message: "Session created successfully and linked to batch",
      session: savedSession
    });
  } catch (err) {
    console.error("Failed to create session:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// Get all sessions
router.get("/", async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('batch', 'batchName teacher totalStudents')
      .sort({ date: 1 });

    res.status(200).json(sessions);
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// Get sessions for a specific teacher
router.get("/teacher", protect, async (req, res) => {
  try {
    // Get teacher ID from authenticated user 
    const teacherId = req.user._id;

    // Find teacher to get their batches
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Get all batches for this teacher
    const teacherBatches = teacher.batches || [];
    
    // Find all sessions that belong to these batches
    const sessions = await Session.find({ batch: { $in: teacherBatches } })
      .populate('batch', 'batchName totalStudents')
      .sort({ date: 1 });

    // Format response with additional info
    const formattedSessions = sessions.map(session => {
      const sessionObject = session.toObject();
      
      // Add derived status (upcoming or completed)
      const sessionDate = new Date(session.date);
      const today = new Date();
      sessionObject.status = sessionDate >= today ? 'upcoming' : 'completed';
      
      // Add students count from the batch
      sessionObject.students = session.batch?.totalStudents || 0;
      
      return sessionObject;
    });

    res.status(200).json(formattedSessions);
  } catch (error) {
    console.error("Failed to fetch teacher sessions:", error);
    res.status(500).json({ error: "Failed to fetch teacher sessions" });
  }
});

// Get sessions for non-authenticated requests
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Find teacher to get their batches
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Get all batches for this teacher
    const teacherBatches = teacher.batches || [];
    
    // Find all sessions that belong to these batches
    const sessions = await Session.find({ batch: { $in: teacherBatches } })
      .populate('batch', 'batchName totalStudents')
      .sort({ date: 1 });

    // Format response with additional info
    const formattedSessions = sessions.map(session => {
      const sessionObject = session.toObject();
      
      // Add derived status (upcoming or completed)
      const sessionDate = new Date(session.date);
      const today = new Date();
      sessionObject.status = sessionDate >= today ? 'upcoming' : 'completed';
      
      // Add students count from the batch
      sessionObject.students = session.batch?.totalStudents || 0;
      
      return sessionObject;
    });

    res.status(200).json(formattedSessions);
  } catch (error) {
    console.error("Failed to fetch teacher sessions:", error);
    res.status(500).json({ error: "Failed to fetch teacher sessions" });
  }
});

// Get a single session by ID
router.get("/:id", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('batch', 'batchName teacher totalStudents');

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.status(200).json(session);
  } catch (error) {
    console.error("Failed to fetch session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// Update a session
router.put("/:id", async (req, res) => {
  try {
    const { title, batch, date, time, notes } = req.body;
    const sessionId = req.params.id;

    // Find the existing session to get its current batch
    const existingSession = await Session.findById(sessionId);
    if (!existingSession) {
      return res.status(404).json({ error: "Session not found" });
    }

    const oldBatchId = existingSession.batch.toString();
    const newBatchId = batch;

    // Update session data
    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      {
        title,
        batch,
        date,
        time,
        notes
      },
      { new: true, runValidators: true }
    );

    // If batch changed, update the references
    if (oldBatchId !== newBatchId) {
      // Remove session from old batch
      await Batch.findByIdAndUpdate(
        oldBatchId,
        { $pull: { session: sessionId } }
      );

      // Add session to new batch
      await Batch.findByIdAndUpdate(
        newBatchId,
        { $push: { session: sessionId } }
      );
    }

    res.status(200).json({
      message: "Session updated successfully",
      session: updatedSession
    });
  } catch (error) {
    console.error("Failed to update session:", error);
    res.status(500).json({ error: "Failed to update session" });
  }
});

// Delete a session
router.delete("/:id", async (req, res) => {
  try {
    const sessionId = req.params.id;

    // Find the session to get its batch before deletion
    const sessionToDelete = await Session.findById(sessionId);
    if (!sessionToDelete) {
      return res.status(404).json({ error: "Session not found" });
    }

    const batchId = sessionToDelete.batch;

    // Delete the session
    const deletedSession = await Session.findByIdAndDelete(sessionId);

    // Remove session reference from the batch
    await Batch.findByIdAndUpdate(
      batchId,
      { $pull: { session: sessionId } }
    );

    res.status(200).json({
      message: "Session deleted successfully and references cleaned",
      session: deletedSession
    });
  } catch (error) {
    console.error("Failed to delete session:", error);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

// Get sessions for a specific batch
router.get("/batch/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;

    const sessions = await Session.find({ batch: batchId })
      .sort({ date: 1 });

    res.status(200).json(sessions);
  } catch (error) {
    console.error("Failed to fetch batch sessions:", error);
    res.status(500).json({ error: "Failed to fetch batch sessions" });
  }
});

export default router;