import Student from "../models/student.model.js";
import Batch from "../models/batch.model.js";
import Teacher from "../models/teacher.model.js";

export const updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { batches = [], ...updatedData } = req.body;

    // 1. Find student
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 2. Store old batch IDs before update
    const oldBatchIds = student.batches || [];

    // 3. Remove student from old batches
    await Promise.all(
      oldBatchIds.map(batchId =>
        Batch.findByIdAndUpdate(batchId, { $pull: { students: student._id } })
      )
    );

    // 4. Remove student from old teachers' student list
    const oldBatches = await Batch.find({ _id: { $in: oldBatchIds } });
    const oldTeacherIds = oldBatches
      .map(batch => batch.teacher?.toString())
      .filter(Boolean);
    await Promise.all(
      oldTeacherIds.map(teacherId =>
        Teacher.findByIdAndUpdate(teacherId, { $pull: { students: studentId } })
      )
    );

    // 5. Fetch new batches and get teachers
    const newBatchDocs = await Batch.find({ _id: { $in: batches } }).populate("teacher");
    const newTeacherIds = newBatchDocs
      .map(batch => batch.teacher?._id?.toString())
      .filter(Boolean);

    // 6. Add student to new batches
    await Promise.all(
      batches.map(batchId =>
        Batch.findByIdAndUpdate(batchId, {
          $addToSet: { students: studentId },
        })
      )
    );

    // 7. Add student to new teachers' student list
    await Promise.all(
      newTeacherIds.map(teacherId =>
        Teacher.findByIdAndUpdate(teacherId, {
          $addToSet: { students: studentId },
        })
      )
    );

    // 8. Update student document
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        ...updatedData,
        batches,
        teachers: newTeacherIds,
      },
      { new: true }
    );

    res.status(200).json({ message: "Student updated successfully", student: updatedStudent });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Failed to update student" });
  }
};
