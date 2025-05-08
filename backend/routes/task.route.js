// // routes/taskRoutes.js
// import express from 'express';
// import Task from '../models/task.model.js';
// import Batch from '../models/batch.model.js';

// const router = express.Router();


// // Get all tasks
// router.get('/tasks', async (req, res) => {
//     try {
//       const tasks = await Task.find().sort({ dueDate: 1 });
//       res.json(tasks);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   });
  
//   // Get tasks for a specific student
//   router.get('/tasks/student/:studentId', async (req, res) => {
//     try {
//       const studentId = req.params.studentId;
      
//       // Find student to get their batches
//       const student = await Student.findById(studentId);
//       if (!student) {
//         return res.status(404).json({ message: 'Student not found' });
//       }
      
//       // Find all tasks for the student's batches
//       const tasks = await Task.find({
//         batch: { $in: student.batches }
//       }).sort({ dueDate: 1 });
      
//       res.json(tasks);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   });

// // Create a new task
// router.post('/tasks', async (req, res) => {
//     try {
//         const { title, description, dueDate, batch } = req.body;
        
//         // Create new task
//         const task = new Task({
//             title,
//             description,
//             dueDate,
//             batch: batch
//         });
        
//         // Save the task
//         const savedTask = await task.save();
        
//         // Update the batch with the task reference
//         await Batch.findByIdAndUpdate(
//             batch,
//             { $push: { tasks: savedTask._id } }
//         );
        
//         res.status(201).json(savedTask);
//     } catch (error) {
//         console.error('Error creating task:', error);
//         res.status(500).json({ message: error.message });
//     }
// });

// // Get all tasks for a batch
// router.get('/tasks/batch/:batchId', async (req, res) => {
//     try {
//         const { batchId } = req.params;
//         const tasks = await Task.find({ batch: batchId });
//         res.status(200).json(tasks);
//     } catch (error) {
//         console.error('Error fetching tasks:', error);
//         res.status(500).json({ message: error.message });
//     }
// });

// // Update a task
// router.put('/tasks/:taskId', async (req, res) => {
//     try {
//         const { taskId } = req.params;
//         const { title, description, dueDate, status } = req.body;
        
//         const updatedTask = await Task.findByIdAndUpdate(
//             taskId,
//             { title, description, dueDate, status },
//             { new: true }
//         );
        
//         if (!updatedTask) {
//             return res.status(404).json({ message: 'Task not found' });
//         }
        
//         res.status(200).json(updatedTask);
//     } catch (error) {
//         console.error('Error updating task:', error);
//         res.status(500).json({ message: error.message });
//     }
// });

// // Delete a task
// router.delete('/tasks/:taskId', async (req, res) => {
//     try {
//         const { taskId } = req.params;
        
//         // Find the task to get the batch ID
//         const task = await Task.findById(taskId);
//         if (!task) {
//             return res.status(404).json({ message: 'Task not found' });
//         }
        
//         // Remove task reference from the batch
//         await Batch.findByIdAndUpdate(
//             task.batch,
//             { $pull: { tasks: taskId } }
//         );
        
//         // Delete the task
//         await Task.findByIdAndDelete(taskId);
        
//         res.status(200).json({ message: 'Task deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting task:', error);
//         res.status(500).json({ message: error.message });
//     }
// });

// export default router;

import express from 'express';
import Task from '../models/task.model.js';
import Batch from '../models/batch.model.js';
import Student from '../models/student.model.js';
import TaskSubmission from '../models/taskSubmission.model.js';
const router = express.Router();

// Helper function to update task status based on due date
const updateTaskStatus = (task) => {
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  
  // If task is already completed, don't change the status
  if (task.status === 'completed') {
    return task;
  }
  
  // If task is overdue, update status
  if (dueDate < now && task.status === 'pending') {
    task.status = 'overdue';
  }
  
  return task;
};

// Get all tasks with updated status based on due date
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ dueDate: 1 });
    
    // Update status based on due date
    const updatedTasks = tasks.map(task => {
      const taskObj = task.toObject();
      return updateTaskStatus(taskObj);
    });
    
    res.json(updatedTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tasks for a specific student with submission status
router.get('/tasks/student/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Find student to get their batches
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find all tasks for the student's batches
    const tasks = await Task.find({
      batch: { $in: student.batches }
    }).sort({ dueDate: 1 });

    // Find all submissions by this student
    const submissions = await TaskSubmission.find({ student: studentId });
    
    // Create a map of task ID to submission
    const submissionMap = {};
    submissions.forEach(submission => {
      submissionMap[submission.task.toString()] = submission;
    });

    // Enhance task data with submission information
    const enhancedTasks = tasks.map(task => {
      const taskObj = task.toObject();
      const submission = submissionMap[task._id.toString()];
      
      // First update the status based on due date
      const updatedTask = updateTaskStatus(taskObj);
      
      // Then override status with submission status if available
      if (submission) {
        // If task has been submitted, use the submission status to determine task status
        if (submission.status === 'submitted') {
          updatedTask.status = 'submitted';
        } else if (submission.status === 'approved') {
          updatedTask.status = 'completed';
        } else if (submission.status === 'resubmit') {
          updatedTask.status = 'resubmit';
        } else if (submission.status === 'rejected') {
          updatedTask.status = 'overdue';
        }
        
        // Add submission data to task
        updatedTask.submission = {
          id: submission._id,
          notes: submission.notes,
          fileName: submission.fileName,
          fileUrl: submission.fileUrl,
          submittedAt: submission.createdAt,
          feedback: submission.feedback,
          rating: submission.rating,
          points: submission.points,
          status: submission.status
        };
      }
      
      return updatedTask;
    });

    res.json(enhancedTasks);
  } catch (error) {
    console.error('Error fetching student tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new task
router.post('/tasks', async (req, res) => {
  try {
    const { title, description, dueDate, batch } = req.body;

    // Create new task
    const task = new Task({
      title,
      description,
      dueDate,
      batch: batch
    });

    // Save the task
    const savedTask = await task.save();

    // Update the batch with the task reference
    await Batch.findByIdAndUpdate(
      batch,
      { $push: { tasks: savedTask._id } }
    );

    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all tasks for a batch with submission status for a specific student
router.get('/tasks/batch/:batchId/student/:studentId', async (req, res) => {
  try {
    const { batchId, studentId } = req.params;
    
    // Get all tasks for this batch
    const tasks = await Task.find({ batch: batchId });
    
    // Get all submissions by this student for this batch
    const submissions = await TaskSubmission.find({ 
      student: studentId,
      batch: batchId
    });
    
    // Create a map of task ID to submission
    const submissionMap = {};
    submissions.forEach(submission => {
      submissionMap[submission.task.toString()] = submission;
    });
    
    // Enhance task data with submission information
    const enhancedTasks = tasks.map(task => {
      const taskObj = task.toObject();
      const submission = submissionMap[task._id.toString()];
      
      // First update the status based on due date
      const updatedTask = updateTaskStatus(taskObj);
      
      // Then override status with submission status if available
      if (submission) {
        if (submission.status === 'submitted') {
          updatedTask.status = 'submitted';
        } else if (submission.status === 'approved') {
          updatedTask.status = 'completed';
        } else if (submission.status === 'resubmit') {
          updatedTask.status = 'resubmit';
        } else if (submission.status === 'rejected') {
          updatedTask.status = 'overdue';
        }
        
        // Add submission data to task
        updatedTask.submission = {
          id: submission._id,
          notes: submission.notes,
          fileName: submission.fileName,
          fileUrl: submission.fileUrl,
          submittedAt: submission.createdAt,
          feedback: submission.feedback,
          rating: submission.rating,
          points: submission.points,
          status: submission.status
        };
      }
      
      return updatedTask;
    });
    
    res.status(200).json(enhancedTasks);
  } catch (error) {
    console.error('Error fetching batch tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all tasks for a batch
router.get('/tasks/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const tasks = await Task.find({ batch: batchId });
    
    // Update status based on due date
    const updatedTasks = tasks.map(task => {
      const taskObj = task.toObject();
      return updateTaskStatus(taskObj);
    });
    
    res.status(200).json(updatedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single task
router.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a task
router.put('/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, dueDate, status } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { title, description, dueDate, status },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a task
router.delete('/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    // Find the task to get the batch ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Remove task reference from the batch
    await Batch.findByIdAndUpdate(
      task.batch,
      { $pull: { tasks: taskId } }
    );
    
    // Delete associated submissions
    await TaskSubmission.deleteMany({ task: taskId });

    // Delete the task
    await Task.findByIdAndDelete(taskId);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get tasks for a specific student
router.get('/tasks/student/:id', async (req, res) => {
  try {
      const student = await Student.findById(req.params.id);
      if (!student) {
          return res.status(404).json({ message: 'Student not found' });
      }
      
      // Get all batches the student is enrolled in
      const batchIds = student.batches;
      
      // Find all tasks for those batches
      const tasks = await Task.find({ 
          batch: { $in: batchIds }
      }).sort({ dueDate: 1 });
      
      res.json(tasks);
  } catch (error) {
      console.error('Error fetching student tasks:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get submissions for a task
router.get('/tasks/:taskId/submissions', async (req, res) => {
  try {
    const submissions = await TaskSubmission.find({ task: req.params.taskId })
      .populate('student', 'name email')
      .sort({ submissionDate: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get submissions for a batch
router.get('/tasks/batch/:batchId/submissions', async (req, res) => {
  try {
    const submissions = await TaskSubmission.find({ batch: req.params.batchId })
      .populate('student', 'name email')
      .populate('task', 'title dueDate')
      .sort({ submissionDate: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single submission
router.get('/submissions/:id', async (req, res) => {
  try {
    const submission = await TaskSubmission.findById(req.params.id)
      .populate('student', 'name email')
      .populate('task', 'title description dueDate');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a submission (for feedback, rating, etc.)
router.put('/submissions/:id', async (req, res) => {
  try {
    const submission = await TaskSubmission.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.json(submission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;