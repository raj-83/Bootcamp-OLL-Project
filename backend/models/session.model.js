import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;