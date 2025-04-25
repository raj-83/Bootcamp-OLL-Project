import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  getStudentDashboard,
  getMentorDashboard,
  getAdminDashboard
} from '../controllers/dashboard.controller.js';

const router = express.Router();

// Protected routes with role-based authorization
router.get('/student', protect, authorize(['Student']), getStudentDashboard);
router.get('/teacher', protect, authorize(['Teacher']), getMentorDashboard);
router.get('/admin', protect, authorize(['Admin']), getAdminDashboard);

export default router;