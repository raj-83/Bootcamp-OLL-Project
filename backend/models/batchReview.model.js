// models/batchReview.model.js
import mongoose from 'mongoose';
const batchReviewSchema = new mongoose.Schema({
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      required: true
    },
    image: {
      type: String,  // URL or path to the uploaded image
      default: ''
    }
  }, {
    timestamps: true
  });
  
  const BatchReview = mongoose.model('BatchReview', batchReviewSchema);

export default BatchReview;