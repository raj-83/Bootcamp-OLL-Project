// models/feedback.model.js
import mongoose from "mongoose";

// Schema for general feedback
const feedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    feedbackType: {
      type: String,
      enum: ["general", "batch"],
      required: true,
    },
    // Fields for general feedback
    title: {
      type: String,
      required: function() {
        return this.feedbackType === "general";
      },
    },
    message: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["suggestion", "bug", "appreciation", "other"],
      required: function() {
        return this.feedbackType === "general";
      },
    },
    // Fields for batch review
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: function() {
        return this.feedbackType === "batch";
      },
    },
    batchName: {
      type: String,
      required: function() {
        return this.feedbackType === "batch";
      },
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: function() {
        return this.feedbackType === "batch";
      },
    },
    teachingQuality: {
      type: Number,
      min: 1,
      max: 5,
      required: function() {
        return this.feedbackType === "batch";
      },
    },
    contentQuality: {
      type: Number,
      min: 1,
      max: 5,
      required: function() {
        return this.feedbackType === "batch";
      },
    },
    supportQuality: {
      type: Number,
      min: 1,
      max: 5,
      required: function() {
        return this.feedbackType === "batch";
      },
    },
    recommendationLikelihood: {
      type: Number,
      min: 1,
      max: 10,
      required: function() {
        return this.feedbackType === "batch";
      },
    },
    // Common fields
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
    adminResponse: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;