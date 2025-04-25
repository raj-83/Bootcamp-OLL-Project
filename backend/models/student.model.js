import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: String,
  role: {
    type: String,
    default: 'Student'
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  phone: String,
  password: String,
  age: Number,
  location: String,
  school: String,
  grade: String,
  joined: String,
  batches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  }],
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }],
  status: {
    type: String,
    default: 'active'
  },
  earning: {
    type: Number,
    default: 0
  },
  attendance: {
    type: Number,
    default: 0
  },
  taskCompletion: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});


const Student = mongoose.model('Student', studentSchema);
export default Student;