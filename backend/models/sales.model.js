// models/Sales.js
import mongoose from 'mongoose';

const salesSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  product: {
    type: String,
    required: true
  },
  customer: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  }
}, { timestamps: true });

const Sales = mongoose.model('Sales', salesSchema);
export default Sales;