// routes/taskRoutes.js
import express from 'express';
import Task from '../models/task.model.js';
import Batch from '../models/batch.model.js';

const router = express.Router();


// Get all tasks
router.get('/tasks', async (req, res) => {
    try {
      const tasks = await Task.find().sort({ dueDate: 1 });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get tasks for a specific student
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
      
      res.json(tasks);
    } catch (error) {
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

// Get all tasks for a batch
router.get('/tasks/batch/:batchId', async (req, res) => {
    try {
        const { batchId } = req.params;
        const tasks = await Task.find({ batch: batchId });
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
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
        
        // Delete the task
        await Task.findByIdAndDelete(taskId);
        
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;