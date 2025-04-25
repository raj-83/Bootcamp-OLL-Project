import express from "express";
import { createStudent } from "../controllers/student.controller.js";
import Student from "../models/student.model.js"; // Assuming you have a Student model
import Batch from "../models/batch.model.js"; // Assuming you have a Batch model
import Teacher from "../models/teacher.model.js"; // Assuming you have a Teacher model
import { updateStudent } from "../controllers/studentUpdate.controller.js";

const router = express.Router();

router.post("/", createStudent); // notice just "/", because prefix is used in app.js

router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    console.error("Failed to fetch teachers:", error);
    res.status(500).json({ message: "Failed to fetch teachers" });
  }
});

// Get single student
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update student
router.patch("/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    const { name, email, batches } = req.body;

    // Step 1: Get existing student
    const existingStudent = await Student.findById(studentId).populate(
      "batches"
    );
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    const oldBatchId = existingStudent.batches[0]?._id?.toString(); // assuming single batch
    const newBatchId = batches[0]; // From frontend: [batchId]

    // Step 2: Update student info
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        name,
        email,
        batches: [newBatchId],
      },
      { new: true, runValidators: true }
    );

    // Step 3: Update batch records
    if (oldBatchId && oldBatchId !== newBatchId) {
      // Remove student from old batch
      await Batch.findByIdAndUpdate(oldBatchId, {
        $pull: { students: studentId },
      });

      // Add student to new batch
      await Batch.findByIdAndUpdate(newBatchId, {
        $addToSet: { students: studentId },
      });

      // Step 4: Update teacher records
      const oldBatch = await Batch.findById(oldBatchId);
      const newBatch = await Batch.findById(newBatchId);

      const oldTeacherId = oldBatch?.teacher?.toString();
      const newTeacherId = newBatch?.teacher?.toString();

      if (oldTeacherId && oldTeacherId !== newTeacherId) {
        await Teacher.findByIdAndUpdate(oldTeacherId, {
          $pull: { students: studentId },
        });

        await Teacher.findByIdAndUpdate(newTeacherId, {
          $addToSet: { students: studentId },
        });

        // Remove the old teacher
        await Student.findByIdAndUpdate(studentId, {
          $pull: { teachers: oldTeacherId },
        });

        // Add the new teacher
        await Student.findByIdAndUpdate(studentId, {
          $addToSet: { teachers: newTeacherId },
        });
      } else if (oldTeacherId === newTeacherId) {
        // Same teacher? Just make sure the student has them
        await Teacher.findByIdAndUpdate(oldTeacherId, {
          $addToSet: { students: studentId },
        });

        await Student.findByIdAndUpdate(studentId, {
          $addToSet: { teachers: oldTeacherId },
        });
      }
    }

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Failed to update student" });
  }
});

// Delete student
router.delete("/:id", async (req, res) => {
  try {
    const studentId = req.params.id;

    // 1. Delete the student
    const deletedStudent = await Student.findByIdAndDelete(studentId);
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2. Remove student reference from all batches
    await Batch.updateMany(
      { students: studentId },
      { $pull: { students: studentId } }
    );

    // 3. Remove student reference from all teachers
    await Teacher.updateMany(
      { students: studentId },
      { $pull: { students: studentId } }
    );

    res.json({
      message: "Student deleted successfully and references cleaned up",
    });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
