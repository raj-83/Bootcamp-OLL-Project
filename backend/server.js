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
import taskRoutes from "./routes/task.route.js";
import earningsRoutes from "./routes/earning.route.js"; 
import adminEarningsRoutes from "./routes/admin-earning.route.js";
import salesRoutes from "./routes/sales.route.js"; // Import sales routes
import feedbackRoutes from "./routes/feedback.route.js"
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

connectDB();

app.get("/healthcheck", (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});

app.use("/api/sessions", sessionRoutes); // Assuming you have a session route
app.use("/api/batches", batchRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/profile", profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/earnings', adminEarningsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', taskRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/feedback', feedbackRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
