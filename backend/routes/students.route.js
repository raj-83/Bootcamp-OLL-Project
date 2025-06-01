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
    const { name, email, phone, age, school, batches } = req.body;

    // Step 1: Get existing student
    const existingStudent = await Student.findById(studentId).populate("batches");
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    const oldBatchId = existingStudent.batches[0]?._id?.toString(); // assuming single batch
    const newBatchId = batches?.[0]; // From frontend: [batchId]

    // Step 2: Update student info with all fields
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        name,
        email,
        phone,
        age: parseInt(age), // Convert age to number
        school,
        batches: newBatchId ? [newBatchId] : existingStudent.batches,
      },
      { new: true, runValidators: true }
    );

    // Step 3: Update batch records if batch changed
    if (oldBatchId && newBatchId && oldBatchId !== newBatchId) {
      // Remove student from old batch
      await Batch.findByIdAndUpdate(oldBatchId, {
        $pull: { students: studentId },
      });

      // Add student to new batch
      await Batch.findByIdAndUpdate(newBatchId, {
        $addToSet: { students: studentId },
      });

      // Step 4: Update teacher records
      const [oldBatch, newBatch] = await Promise.all([
        Batch.findById(oldBatchId),
        Batch.findById(newBatchId),
      ]);

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

router.patch("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fields allowed to be updated
    const allowedUpdates = ['name', 'email', 'phone', 'location', 'school', 'grade'];
    const updates = {};

    // Filter for allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // If trying to update email, check if it's already in use
    if (updates.email) {
      const existingStudent = await Student.findOne({ 
        email: updates.email,
        _id: { $ne: id } // Exclude current student from check
      });
      
      if (existingStudent) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email is already in use' 
        });
      }
    }

    // Update the student with validated data
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true } // Return updated document and run schema validators
    ).select('-password'); // Don't return password in response

    if (!updatedStudent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully',
      student: updatedStudent 
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
})


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

// Calculate and update leaderboard ranks
router.get('/leaderboard/calculate', async (req, res) => {
  try {
    // Get all students and sort by points for national rank
    const allStudents = await Student.find().sort({ points: -1 });
    
    // Update national ranks
    for (let i = 0; i < allStudents.length; i++) {
      await Student.findByIdAndUpdate(allStudents[i]._id, {
        nationalRank: i + 1
      });
    }

    // Get all batches
    const batches = await Batch.find().populate('students');
    
    // Calculate batch ranks for each batch
    for (const batch of batches) {
      const batchStudents = await Student.find({
        _id: { $in: batch.students }
      }).sort({ points: -1 });
      
      // Update batch ranks
      for (let i = 0; i < batchStudents.length; i++) {
        await Student.findByIdAndUpdate(batchStudents[i]._id, {
          batchRank: i + 1
        });
      }
    }

    res.status(200).json({ message: 'Leaderboard ranks updated successfully' });
  } catch (error) {
    console.error('Error calculating leaderboard:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get national leaderboard
router.get('/leaderboard/national', async (req, res) => {
  try {
    const students = await Student.find()
      .sort({ points: -1 })
      .select('name points nationalRank school taskCompletion attendance earning batches')
      .limit(100); // Limit to top 100 students
    
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching national leaderboard:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get batch leaderboard
router.get('/leaderboard/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const students = await Student.find({
      batches: batchId
    })
      .sort({ points: -1 })
      .select('name points batchRank school taskCompletion attendance earning batches');
    
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching batch leaderboard:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
