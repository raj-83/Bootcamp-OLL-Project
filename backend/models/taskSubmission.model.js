// models/taskSubmission.model.js
import mongoose from 'mongoose';

const taskSubmissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    trim: true
  },
  fileSize: {
    type: Number
  },
  fileType: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'approved', 'rejected', 'resubmit'],
    default: 'submitted'
  },
  feedback: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  points: {
    type: Number,
    default: 0
  },
  submissionDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const TaskSubmission = mongoose.model('TaskSubmission', taskSubmissionSchema);
export default TaskSubmission;