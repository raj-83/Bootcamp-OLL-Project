import Student from "../models/student.model.js";
import Batch from "../models/batch.model.js";
import Teacher from "../models/teacher.model.js";

export const createStudent = async (req, res) => {
  try {
    const { batches = [], ...rest } = req.body;

    // Step 1: Initialize a Set for unique teacher IDs
    const teacherSet = new Set();

    // Step 2: Create a new student document (not saved yet)
    const newStudent = new Student({
      ...rest,
      batches,
    });

    // Step 3: For each batch, add student to batch and collect teacher
    for (const batchId of batches) {
      const batch = await Batch.findById(batchId);

      if (batch) {
        // Add student to batch if not already added
        if (!batch.students.includes(newStudent._id)) {
          batch.students.push(newStudent._id);
          await batch.save();
        }

        // Collect teacher ID from this batch (if any)
        if (batch.teacher) {
          teacherSet.add(batch.teacher.toString());
        }
      }
    }

    // Step 4: Assign collected teacher IDs to student's teachers field
    newStudent.teachers = Array.from(teacherSet);

    // Step 5: Save the student
    await newStudent.save();

    // Step 6: Add student to each teacher's student list
    for (const teacherId of teacherSet) {
      await Teacher.findByIdAndUpdate(teacherId, {
        $addToSet: { students: newStudent._id },
      });
    }

    res.status(201).json({
      message: "Student created successfully",
      student: newStudent,
    });
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).json({ message: "Failed to add student" });
  }
};
