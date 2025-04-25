// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import batchRoutes from "./routes/batches.route.js";
import studentRoutes from "./routes/students.route.js";
import teacherRoutes from "./routes/teachers.route.js";
import profileRoutes from "./routes/profile.route.js";
import authRoutes from './routes/auth.route.js';
import dashboardRoutes from "./routes/dashboard-stats.route.js";
import sessionRoutes from "./routes/session.route.js";
import adminRoutes from "./routes/admin.route.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit if unable to connect
  }
};

connectDB();

app.use("/api/sessions", sessionRoutes); // Assuming you have a session route
app.use("/api/batches", batchRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/profile", profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
