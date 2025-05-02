// backend/routes/admin-earning.route.js
import express from 'express';
import mongoose from 'mongoose';
import Sales from '../models/sales.model.js';
import Student from '../models/student.model.js';
import Batch from '../models/batch.model.js';
import Teacher from '../models/teacher.model.js';

const router = express.Router();

/**
 * GET /api/admin/earnings
 * Get overall earnings statistics for admin dashboard
 */
router.get('/', async (req, res) => {
  try {
    const timeFilter = req.query.timeRange || 'alltime';
    let dateFilter = {};
    
    const now = new Date();
    
    // Apply time filter
    if (timeFilter === '7days') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      dateFilter = { date: { $gte: sevenDaysAgo } };
    } else if (timeFilter === '30days') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      dateFilter = { date: { $gte: thirtyDaysAgo } };
    } else if (timeFilter === '90days') {
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(now.getDate() - 90);
      dateFilter = { date: { $gte: ninetyDaysAgo } };
    } else if (timeFilter === 'year') {
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      dateFilter = { date: { $gte: firstDayOfYear } };
    }
    
    // Get completed sales with date filter
    const salesData = await Sales.find({
      status: 'completed',
      ...dateFilter
    }).populate('student');
    
    // Calculate revenue distribution
    const PLATFORM_RATE = 0.2;
    const TEACHER_RATE = 0.2;
    const STUDENT_RATE = 0.6;
    
    // Total sales amount
    const totalStudentSales = salesData.reduce((total, sale) => total + sale.amount, 0);
    
    // Calculate earnings distribution
    const platformEarnings = totalStudentSales * PLATFORM_RATE;
    const teacherEarnings = totalStudentSales * TEACHER_RATE;
    const studentEarnings = totalStudentSales * STUDENT_RATE;
    
    // Get counts
    const studentCount = await Student.countDocuments({ status: 'active' });
    const teacherCount = await Teacher.countDocuments();
    const batchCount = await Batch.countDocuments();
    
    // Get daily earnings data
    const dailyEarningsData = await getDailyEarningsData(timeFilter);
    
    // Get batch earnings data
    const batchEarningsData = await getBatchEarningsData();
    
    // Get teacher earnings data
    const teacherEarningsData = await getTeacherEarningsData();
    
    // Prepare distribution data
    const distributionData = [
      { name: 'Platform', value: Math.round(platformEarnings), color: '#8884d8' },
      { name: 'Teachers', value: Math.round(teacherEarnings), color: '#82ca9d' },
      { name: 'Students', value: Math.round(studentEarnings), color: '#ffc658' },
    ];
    
    res.json({
      totalEarningsData: {
        totalEarnings: Math.round(platformEarnings),
        totalStudentSales: Math.round(totalStudentSales),
        studentCount,
        teacherCount,
        batchCount
      },
      dailyEarningsData,
      batchEarningsData,
      teacherEarningsData,
      distributionData
    });
    
  } catch (error) {
    console.error('Error fetching admin earnings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Helper function to get daily earnings data
 */
const getDailyEarningsData = async (timeFilter) => {
  const now = new Date();
  let daysToFetch;
  
  switch(timeFilter) {
    case '7days':
      daysToFetch = 7;
      break;
    case '90days':
      daysToFetch = 90;
      break;
    case 'year':
      daysToFetch = 365;
      break;
    case '30days':
      daysToFetch = 30;
      break;
    default:
      daysToFetch = 14; // Default to 2 weeks for clean display
  }
  
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - daysToFetch);
  
  // Create array of date strings for the last n days
  const dateArray = [];
  for (let i = 0; i < daysToFetch; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    dateArray.push(dateString);
  }
  
  // Get sales for each day
  const dailyData = await Promise.all(dateArray.map(async (dateString) => {
    const dayStart = new Date(dateString);
    const dayEnd = new Date(dateString);
    dayEnd.setHours(23, 59, 59, 999);
    
    const daySales = await Sales.find({
      status: 'completed',
      date: { $gte: dayStart, $lte: dayEnd }
    });
    
    const dailyTotal = daySales.reduce((total, sale) => total + sale.amount, 0);
    const platformEarnings = dailyTotal * 0.2; // 20% platform fee
    
    return {
      date: dateString,
      earnings: Math.round(platformEarnings),
      studentSales: Math.round(dailyTotal),
    };
  }));
  
  return dailyData;
};

/**
 * Helper function to get batch earnings data
 */
const getBatchEarningsData = async () => {
  // Get all batches
  const batches = await Batch.find()
    .populate('teacher')
    .populate('students');
  
  return await Promise.all(batches.map(async (batch) => {
    // Get all sales from students in this batch
    const studentIds = batch.students.map(student => student._id);
    
    // Get sales associated with students in this batch
    const batchSales = await Sales.find({
      student: { $in: studentIds },
      status: 'completed'
    });
    
    // Calculate total sales amount for this batch
    const totalSales = batchSales.reduce((total, sale) => total + sale.amount, 0);
    
    // Calculate earnings distribution
    const platformEarnings = totalSales * 0.2;
    const teacherEarnings = totalSales * 0.2;
    const studentEarnings = totalSales * 0.6;
    
    // Determine batch status
    let status = 'upcoming';
    const now = new Date();
    
    if (batch.startDate && batch.endDate) {
      if (batch.startDate <= now && batch.endDate >= now) {
        status = 'ongoing';
      } else if (batch.endDate < now) {
        status = 'completed';
      }
    }
    
    return {
      id: batch._id,
      name: batch.batchName,
      status,
      teacher: batch.teacher ? batch.teacher.name : 'Unassigned',
      students: batch.students.length,
      totalSales: Math.round(totalSales),
      platformEarnings: Math.round(platformEarnings),
      teacherEarnings: Math.round(teacherEarnings),
      studentEarnings: Math.round(studentEarnings)
    };
  }));
};

/**
 * Helper function to get teacher earnings data
 */
const getTeacherEarningsData = async () => {
  // Get all teachers
  const teachers = await Teacher.find();
  
  return await Promise.all(teachers.map(async (teacher) => {
    // Get batches taught by this teacher
    const batches = await Batch.find({ teacher: teacher._id });
    const batchIds = batches.map(batch => batch._id);
    
    // Get students in teacher's batches
    const students = await Student.find({ batches: { $in: batchIds } });
    const studentIds = students.map(student => student._id);
    
    // Get sales from those students
    const teacherSales = await Sales.find({
      student: { $in: studentIds },
      status: 'completed'
    });
    
    // Calculate teacher's earnings (20% commission)
    const totalSales = teacherSales.reduce((total, sale) => total + sale.amount, 0);
    const teacherEarnings = totalSales * 0.2;
    
    return {
      id: teacher._id,
      name: teacher.name,
      specialization: teacher.specialization || 'General',
      batches: batches.length,
      students: students.length,
      earnings: Math.round(teacherEarnings)
    };
  }));
};

export default router;