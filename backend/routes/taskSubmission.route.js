// routes/taskSubmissionRoutes.js
import express from 'express';
import TaskSubmission from '../models/taskSubmission.model.js';
import Task from '../models/task.model.js';
import Student from '../models/student.model.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow certain file types
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed.'), false);
  }
};

// Configure multer upload
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.get('/:taskId', async(req, res)=> {
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
})

// Submit a task
router.post('/submit', upload.single('file'), async (req, res) => {
  try {
    const { studentId, taskId, batchId, notes } = req.body;
    
    // Validate input data
    if (!studentId || !taskId || !batchId) {
      return res.status(400).json({ message: 'Student ID, Task ID, and Batch ID are required' });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Create submission object
    const submissionData = {
      student: studentId,
      task: taskId,
      batch: batchId,
      notes: notes || ''
    };

    // Add file info if a file was uploaded
    if (req.file) {
      submissionData.fileUrl = `/uploads/${req.file.filename}`;
      submissionData.fileName = req.file.originalname;
      submissionData.fileSize = req.file.size;
      submissionData.fileType = req.file.mimetype;
    }

    // Check if submission already exists
    const existingSubmission = await TaskSubmission.findOne({ 
      student: studentId, 
      task: taskId 
    });

    let submission;
    
    // If submission exists, update it
    if (existingSubmission) {
      // If there's a new file and an old file exists, delete the old file
      if (req.file && existingSubmission.fileUrl) {
        const oldFilePath = path.join(__dirname, '..', existingSubmission.fileUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      // Update the submission
      submission = await TaskSubmission.findByIdAndUpdate(
        existingSubmission._id,
        submissionData,
        { new: true }
      );

      // Update task status to submitted if it was pending or overdue
      if (task.status === 'pending' || task.status === 'overdue') {
        await Task.findByIdAndUpdate(taskId, { status: 'submitted' });
      }
    } else {
      // Create a new submission
      submission = await TaskSubmission.create(submissionData);
      
      // Update task status to submitted
      await Task.findByIdAndUpdate(taskId, { status: 'submitted' });
    }

    res.status(201).json({
      message: 'Task submitted successfully',
      submission
    });
  } catch (error) {
    console.error('Error submitting task:', error);
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

// Get submission for a specific task by a student
router.get('/:taskId/:studentId', async (req, res) => {
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

// Update submission status (for teachers/admin)
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
    
    // If the submission is approved, update the task status to completed
    if (status === 'approved') {
      await Task.findByIdAndUpdate(submission.task, { status: 'completed' });
    }
    
    // If the submission needs to be resubmitted, update the task status
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
    
    // Delete the associated file if it exists
    if (submission.fileUrl) {
      const filePath = path.join(__dirname, '..', submission.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await TaskSubmission.findByIdAndDelete(submissionId);
    
    res.status(200).json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;