import express from "express";
import Batch from "../models/batch.model.js";
import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js";
import Sales from "../models/sales.model.js"; // Import Sales model
// import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper function to calculate real revenue for a batch
const calculateBatchRevenue = async (batchId) => {
  try {
    // Get all students in the batch
    const batch = await Batch.findById(batchId);
    if (!batch || !batch.students || batch.students.length === 0) {
      return 0;
    }

    // Find all sales made by students in this batch
    const salesByBatchStudents = await Sales.find({
      student: { $in: batch.students },
      status: 'completed' // Only count completed sales
    });

    // Sum up the total sales amount
    const totalRevenue = salesByBatchStudents.reduce((sum, sale) => sum + sale.amount, 0);

    return totalRevenue;
  } catch (error) {
    console.error("Error calculating batch revenue:", error);
    return 0;
  }
};

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

// Get all batches with real revenue calculation
router.get("/", async (req, res) => {
  try {
    // Fetch all batches and populate the students field
    const batches = await Batch.find().populate('students', '_id');
    
    // Calculate real revenue for each batch
const batchesWithRealRevenue = await Promise.all(
  batches.map(async (batchDoc) => {
    const realRevenue = await calculateBatchRevenue(batchDoc._id);

    // Option A: document.save()
    batchDoc.revenue = realRevenue;
    await batchDoc.save();

    // Option B: update query
    // await Batch.findByIdAndUpdate(batchDoc._id, { revenue: realRevenue });

    return batchDoc.toObject();
  })
);

    res.status(200).json(batchesWithRealRevenue);
  } catch (error) {
    console.error("Failed to fetch batches:", error);
    res.status(500).json({ error: "Failed to fetch batches" });
  }
});

// Get a single batch by ID with real revenue
router.get("/:id", async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    // Calculate real revenue for this batch
    const realRevenue = await calculateBatchRevenue(batch._id);
    
    const batchObj = batch.toObject();
    batchObj.defaultRevenue = batchObj.revenue; // Store original revenue
    batchObj.revenue = realRevenue; // Update with real revenue

    res.status(200).json(batchObj);
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

    // Calculate real revenue for the updated batch
    const realRevenue = await calculateBatchRevenue(batchId);
    
    const batchWithRealRevenue = updatedBatch.toObject();
    batchWithRealRevenue.defaultRevenue = batchWithRealRevenue.revenue;
    batchWithRealRevenue.revenue = realRevenue;

    res.status(200).json({
      message: "Batch updated successfully",
      batch: batchWithRealRevenue,
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
      .populate('students', 'firstName lastName email');

    // Calculate real revenue for each batch
    const batchesWithRealRevenue = await Promise.all(
      batches.map(async (batch) => {
        const batchObj = batch.toObject();
        const realRevenue = await calculateBatchRevenue(batch._id);
        
        return {
          ...batchObj,
          defaultRevenue: batchObj.revenue,
          revenue: realRevenue
        };
      })
    );

    res.status(200).json(batchesWithRealRevenue);
  } catch (error) {
    console.error('Error fetching teacher batches:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
