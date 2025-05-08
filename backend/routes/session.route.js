// backend/routes/sessionRoutes.js
import express from "express";
import Session from "../models/session.model.js";
import Batch from "../models/batch.model.js";
import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js";
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get sessions for a specific student - MUST BE BEFORE THE /:id ROUTE
router.get("/student", protect, async (req, res) => {
  try {
    // Get student ID from authenticated user 
    const studentId = req.user._id;
    
    // Find student to get their batches
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get all batches for this student
    const studentBatches = student.batches || [];
    
    // Find all sessions that belong to these batches
    const sessions = await Session.find({ batch: { $in: studentBatches } })
      .populate('batch', 'batchName')
      .sort({ date: 1 });

    // Format response with additional info
    const formattedSessions = sessions.map(session => {
      const sessionObject = session.toObject();
      
      // Add derived status (upcoming or completed)
      // const sessionDate = new Date(session.date);
      // const today = new Date();
      // sessionObject.status = sessionDate >= today ? 'upcoming' : 'completed';
      sessionObject.status = session.status
      
      // Add batch name
      sessionObject.batchName = session.batch?.batchName || 'Unknown Batch';
      
      return {
        id: sessionObject._id,
        title: sessionObject.title,
        date: sessionObject.date,
        time: sessionObject.time,
        status: sessionObject.status,
        batchName: sessionObject.batchName,
        notes: sessionObject.notes,
        meetingLink: sessionObject.meetingLink
      };
    });

    res.status(200).json(formattedSessions);
  } catch (error) {
    console.error("Failed to fetch student sessions:", error);
    res.status(500).json({ error: "Failed to fetch student sessions" });
  }
});

// Create a new session
router.post("/", async (req, res) => {
  try {
    const { title, batch, date, time, notes, meetingLink } = req.body;

    if (!title || !batch || !date || !time || !notes) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Step 1: Create the session
    const newSession = new Session({
      title,
      batch, // This should be the batch ObjectId
      date,
      time,
      notes,
      meetingLink // Add this field
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
      // const sessionDate = new Date(session.date);
      // const today = new Date();
      // sessionObject.status = sessionDate >= today ? 'upcoming' : 'completed';
      sessionObject.status = session.status;
      
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


// Get upcoming sessions for a specific student
// Get upcoming sessions for a specific student
router.get('/upcoming/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId, 'batches');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const now = new Date();
    // Grab only the next upcoming session
    const sessions = await Session.find({
      batch: { $in: student.batches },
      date: { $gte: now }
    })
    .sort({ date: 1 })
    .limit(1)
    // if you still want batch details, populate only what you need:
    .populate('batch', 'batchName');

    // sessions is already plain JSON–ready; it includes session.meetingLink
    return res.json(sessions);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
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
      // const sessionDate = new Date(session.date);
      // const today = new Date();
      sessionObject.status = session.status;
      
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
    const { title, batch, date, time, notes, meetingLink } = req.body;
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
        notes,
        meetingLink // Add this field
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

// Get students for attendance
router.get('/:sessionId/attendance', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await Session.findById(sessionId)
      .populate('batch')
      .populate('attendance.student');
      
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // If the session already has attendance records, return them
    if (session.attendance && session.attendance.length > 0) {
      return res.status(200).json({ attendance: session.attendance });
    }
    
    // Otherwise, get students from the batch
    const batch = await Batch.findById(session.batch._id)
      .populate('students', 'name email');
      
    if (!batch || !batch.students || batch.students.length === 0) {
      return res.status(200).json({ attendance: [] });
    }
    
    // Create attendance template for all students in the batch
    const attendanceTemplate = batch.students.map(student => ({
      student: {
        _id: student._id,
        name: student.name,
        email: student.email
      },
      present: false
    }));
    
    res.status(200).json({ attendance: attendanceTemplate });
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update attendance for a session
router.post('/:sessionId/attendance', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { attendance } = req.body;
    
    if (!attendance || !Array.isArray(attendance)) {
      return res.status(400).json({ message: 'Invalid attendance data' });
    }
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Update session with attendance data
    session.attendance = attendance;
    session.status = 'completed'; // Mark the session as completed
    await session.save();
    
    // Update attendance percentage for each student
    for (const record of attendance) {
      await updateStudentAttendance(record.student, record.present);
    }
    
    res.status(200).json({ 
      message: 'Attendance recorded successfully',
      session
    });
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to update student attendance percentage
async function updateStudentAttendance(studentId, isPresent) {
  try {
    // Find all sessions where this student is enrolled (via their batches)
    const student = await Student.findById(studentId);
    if (!student) return;
    
    // Get student's batches
    const studentBatches = student.batches;
    
    // Find all completed sessions for these batches
    const sessions = await Session.find({
      batch: { $in: studentBatches },
      status: 'completed',
      'attendance.student': { $exists: true }
    });
    
    if (!sessions || sessions.length === 0) return;
    
    // Calculate attendance percentage
    let totalSessions = 0;
    let attendedSessions = 0;
    
    for (const session of sessions) {
      const studentAttendance = session.attendance.find(
        record => record.student.toString() === studentId.toString()
      );
      
      if (studentAttendance) {
        totalSessions++;
        if (studentAttendance.present) {
          attendedSessions++;
        }
      }
    }
    
    // Calculate percentage (0-100)
    const attendancePercentage = totalSessions > 0 
      ? Math.round((attendedSessions / totalSessions) * 100)
      : 0;
    
    // Update student's attendance percentage
    await Student.findByIdAndUpdate(studentId, {
      attendance: attendancePercentage
    });
    
  } catch (error) {
    console.error('Error updating student attendance:', error);
  }
}

export default router;