import express from 'express';
import TaskSubmission from '../models/taskSubmission.model.js';
import Task from '../models/task.model.js';
import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';
import multer from 'multer';
import { storage, cloudinary } from '../config/cloudinary.js';

const router = express.Router();

// File filter to only allow certain file types
const fileFilter = (req, file, cb) => {
  console.log('Received file MIME type:', file.mimetype);
  console.log('Received file original name:', file.originalname);
  
  const allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log('File type not allowed. Allowed types:', allowedFileTypes);
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed.'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    console.error('Other error:', err);
    return res.status(500).json({ message: err.message });
  }
  next();
};

// Get all task submissions
router.get('/', async (req, res) => {
  try {
    const submissions = await TaskSubmission.find()
      .populate('student', 'name')
      .populate('task', 'title description dueDate')
      .populate('batch', 'batchName')
      .sort({ createdAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching all task submissions:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all submissions for students assigned to a teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // First, get all students assigned to this teacher
    const teacher = await Teacher.findById(teacherId).populate('students');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const studentIds = teacher.students.map(student => student._id);

    // Then get all submissions for these students
    const submissions = await TaskSubmission.find({
      student: { $in: studentIds }
    })
      .populate('student', 'name')
      .populate('task', 'title description dueDate')
      .populate('batch', 'batchName')
      .sort({ createdAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching teacher submissions:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all submissions for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const submissions = await TaskSubmission.find({ student: studentId })
      .populate('task')
      .populate('batch')
      .sort({ createdAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all submissions for a task
router.get('/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const submissions = await TaskSubmission.find({ task: taskId })
      .populate('student')
      .populate('batch')
      .sort({ createdAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching task submissions:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific task submission by a student
router.get('/submission/:taskId/:studentId', async (req, res) => {
  try {
    const { taskId, studentId } = req.params;

    const submission = await TaskSubmission.findOne({
      task: taskId,
      student: studentId
    }).populate('task');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.status(200).json(submission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ message: error.message });
  }
});

// Submit a task
router.post('/submit', upload.single('file'), handleMulterError, async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const { studentId, taskId, batchId, notes, googleDocsLink } = req.body;

    if (!studentId || !taskId || !batchId) {
      return res.status(400).json({ 
        message: 'Student ID, Task ID, and Batch ID are required',
        received: { studentId, taskId, batchId }
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const submissionData = {
      student: studentId,
      task: taskId,
      batch: batchId,
      notes: notes || '',
      googleDocsLink: googleDocsLink || '',
      status: 'submitted'
    };

    if (req.file) {
      submissionData.fileUrl = req.file.path; // Cloudinary URL
      submissionData.fileName = req.file.originalname;
      submissionData.fileSize = req.file.size;
      submissionData.fileType = req.file.mimetype;
      submissionData.filePublicId = req.file.filename; // Needed for deletion
    }

    let submission;
    const existingSubmission = await TaskSubmission.findOne({ student: studentId, task: taskId });

    if (existingSubmission) {
      // Delete old file from Cloudinary if a new one is uploaded
      if (req.file && existingSubmission.filePublicId) {
        try {
          await cloudinary.uploader.destroy(existingSubmission.filePublicId);
        } catch (error) {
          console.error('Error deleting old file from Cloudinary:', error);
        }
      }

      // Update existing submission
      submission = await TaskSubmission.findByIdAndUpdate(
        existingSubmission._id,
        submissionData,
        { new: true }
      );

      if (task.status === 'pending' || task.status === 'overdue') {
        await Task.findByIdAndUpdate(taskId, { status: 'submitted' });
      }
    } else {
      // Create new submission
      submission = await TaskSubmission.create(submissionData);
      await Task.findByIdAndUpdate(taskId, { status: 'submitted' });
    }

    res.status(201).json({
      message: 'Task submitted successfully',
      submission
    });
  } catch (error) {
    console.error('Error submitting task:', error);
    res.status(500).json({ 
      message: 'Error submitting task',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update submission status
router.put('/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, feedback, rating, points } = req.body;

    const submission = await TaskSubmission.findByIdAndUpdate(
      submissionId,
      { status, feedback, rating, points },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Update student points
    if (status === 'approved' && points > 0) {
      const student = await Student.findById(submission.student);
      if (student) {
        // Add new points to existing points
        const updatedPoints = student.points + points;
        await Student.findByIdAndUpdate(submission.student, { points: updatedPoints });
      }
    }

    if (status === 'approved') {
      await Task.findByIdAndUpdate(submission.task, { status: 'completed' });
    }

    if (status === 'resubmit') {
      await Task.findByIdAndUpdate(submission.task, { status: 'resubmit' });
    }

    res.status(200).json(submission);
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a submission
router.delete('/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await TaskSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Delete file from Cloudinary
    if (submission.filePublicId) {
      await cloudinary.uploader.destroy(submission.filePublicId);
    }

    await TaskSubmission.findByIdAndDelete(submissionId);

    res.status(200).json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
