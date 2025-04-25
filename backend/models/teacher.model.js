import mongoose from 'mongoose';
const { Schema } = mongoose;

const teacherSchema = new mongoose.Schema({
  name: String,
  email: String,
  password:String,
  phone: String,
  location: String,
  jobTitle: String,
  yearOfExp: String,
  specialization: {
    type: String,
    default: "None"
  },
  status: {
    type: String,
    default: "Unknown"
  },
  bio: String,
  earning: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    default: 'Mentor',
  },
  rating: {
    type: Number,
    default: 0
  },
  totalBatches: {
    type: Number,
    default: 0
  },
  currentBatches: {
    type: Number,
    default: 0
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  joiningDate: Date,
  batches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  earnings: [{
    month: String,
    amount: Number
  }]
}, {
  timestamps: true
});


const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;