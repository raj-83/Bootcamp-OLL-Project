// backend/routes/batchRoutes.js
import express from "express";
import Batch from "../models/batch.model.js";
import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js";
// import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create a new batch
router.post("/", async (req, res) => {
  try {
    const {
      batchName,
      teacher,
      startDate,
      endDate,
      scheduleDays,
      sessionTime,
      sessionTopic,
    } = req.body;

    if (!batchName || !teacher) {
      return res
        .status(400)
        .json({ error: "Batch name and teacher are required" });
    }

    const formattedSessionTopic = Array.isArray(sessionTopic)
      ? sessionTopic.join(", ")
      : sessionTopic;

    // Step 1: Create batch
    const newBatch = new Batch({
      batchName,
      teacher, // This should be teacher's ObjectId
      startDate,
      endDate,
      scheduleDays,
      sessionTime,
      sessionTopic: formattedSessionTopic,
    });

    const savedBatch = await newBatch.save();

    // Step 2: Push the batch ID to the teacher document
    await Teacher.findByIdAndUpdate(
      teacher,
      { $push: { batches: savedBatch._id } }, // ⬅️ Add batch to teacher
      { new: true }
    );

    res.status(201).json({
      message: "Batch created successfully and assigned to teacher",
      batch: savedBatch,
    });
  } catch (err) {
    console.error("Failed to create batch:", err);
    res.status(500).json({ error: "Failed to create batch" });
  }
});

// In your backend API route for fetching batches

// Get all batches
router.get("/", async (req, res) => {
  try {
    const batches = await Batch.find();
    res.status(200).json(batches);
  } catch (error) {
    console.error("Failed to fetch batches:", error);
    res.status(500).json({ error: "Failed to fetch batches" });
  }
});

// Get a single batch by ID
router.get("/:id", async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    res.status(200).json(batch);
  } catch (error) {
    console.error("Failed to fetch batch:", error);
    res.status(500).json({ error: "Failed to fetch batch" });
  }
});

// Update a batch
router.put("/:id", async (req, res) => {
  try {
    const {
      batchName,
      teacher,
      startDate,
      endDate,
      scheduleDays,
      sessionTime,
      sessionTopic,
    } = req.body;

    const formattedSessionTopic = Array.isArray(sessionTopic)
      ? sessionTopic.join(", ")
      : sessionTopic;

    // Step 1: Get the existing batch
    const existingBatch = await Batch.findById(req.params.id);
    if (!existingBatch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    const oldTeacherId = existingBatch.teacher?.toString();
    const newTeacherId = teacher;
    const batchId = req.params.id;
    const studentIds = existingBatch.students;

    // Step 2: Update batch data
    const updatedBatch = await Batch.findByIdAndUpdate(
      batchId,
      {
        batchName,
        teacher,
        startDate,
        endDate,
        scheduleDays,
        sessionTime,
        sessionTopic: formattedSessionTopic,
      },
      { new: true, runValidators: true }
    );

    // Step 3: If teacher changed
    if (oldTeacherId && oldTeacherId !== newTeacherId) {
      // Remove batch and students from old teacher
      await Teacher.findByIdAndUpdate(oldTeacherId, {
        $pull: {
          batches: batchId,
          students: { $in: studentIds },
        },
      });

      // Add batch and students to new teacher
      await Teacher.findByIdAndUpdate(newTeacherId, {
        $addToSet: {
          batches: batchId,
          students: { $each: studentIds },
        },
      });

      // Update each student:
      // First pull oldTeacherId
      await Student.updateMany(
        { _id: { $in: studentIds } },
        { $pull: { teachers: oldTeacherId } }
      );

      // Then add newTeacherId
      await Student.updateMany(
        { _id: { $in: studentIds } },
        { $addToSet: { teachers: newTeacherId } }
      );
    } else {
      // If teacher didn't change, ensure students still have the teacher
      await Teacher.findByIdAndUpdate(oldTeacherId, {
        $addToSet: {
          students: { $each: studentIds },
        },
      });

      await Student.updateMany(
        { _id: { $in: studentIds } },
        {
          $addToSet: { teachers: oldTeacherId },
        }
      );
    }

    res.status(200).json({
      message: "Batch updated successfully",
      batch: updatedBatch,
    });
  } catch (error) {
    console.error("Failed to update batch:", error);
    res.status(500).json({ error: "Failed to update batch" });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const batchId = req.params.id;

    // 1. Find and delete the batch
    const deletedBatch = await Batch.findByIdAndDelete(batchId);
    if (!deletedBatch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    const studentsInBatch = deletedBatch.students || [];
    const teacherOfBatch = deletedBatch.teacher;

    // 2. Remove batch and teacher reference from students
    const studentPullQuery = {
      batches: batchId,
    };

    if (teacherOfBatch) {
      studentPullQuery.teachers = teacherOfBatch;
    }

    await Student.updateMany({ batches: batchId }, { $pull: studentPullQuery });

    // 3. Remove batch reference from teacher
    await Teacher.updateOne(
      { _id: teacherOfBatch },
      {
        $pull: {
          batches: batchId,
          students: { $in: studentsInBatch }, // <-- removing students of the deleted batch
        },
      }
    );

    res.status(200).json({
      message: "Batch deleted successfully and all references cleaned",
      batch: deletedBatch,
    });
  } catch (error) {
    console.error("Failed to delete batch:", error);
    res.status(500).json({ error: "Failed to delete batch" });
  }
});

// Get batches by teacher ID
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } =  req.params; // Assuming you get this from the request params

    // Check if the authenticated user is allowed to access this teacher's batches
    // if (req.user._id !== teacherId && req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    // Find all batches where the teacher field matches teacherId
    // Populate the students field to get student details
    const batches = await Batch.find({ teacher: teacherId })
      .populate('students', 'firstName lastName email')
      .sort({ startDate: -1 });

    res.status(200).json(batches);
  } catch (error) {
    console.error('Error fetching teacher batches:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
