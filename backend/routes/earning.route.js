// backend/routes/earnings.route.js
import express from 'express';
import mongoose from 'mongoose';
import Sales from '../models/sales.model.js';
import Student from '../models/student.model.js';
import Batch from '../models/batch.model.js';
import Teacher from '../models/teacher.model.js';

const router = express.Router();

/**
 * GET /api/earnings/teacher/:teacherId
 * Get earnings data for a specific teacher
 */
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    
    // Validate teacherId
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: 'Invalid teacher ID' });
    }

    // Get teacher data
    const teacher = await Teacher.findById(teacherId)
      .populate('batches')
      .populate('students');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Get batches taught by the teacher
    const batchIds = teacher.batches.map(batch => batch._id);
    
    // Get all students in teacher's batches
    const students = await Student.find({ batches: { $in: batchIds } });
    const studentIds = students.map(student => student._id);
    
    // Get all sales data for students in teacher's batches
    const salesData = await Sales.find({ 
      student: { $in: studentIds },
      status: 'completed'
    })
    .populate('student', 'name email batches')
    .sort({ date: -1 });
    
    // Calculate total earnings (20% commission from student sales)
    const COMMISSION_RATE = 0.2;
    
    // Process sales data
    const totalEarnings = salesData.reduce((total, sale) => total + (sale.amount * COMMISSION_RATE), 0);
    
    // Calculate pending earnings (completed sales in the current month that haven't been processed)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const pendingEarnings = salesData
      .filter(sale => new Date(sale.date) >= startOfMonth)
      .reduce((total, sale) => total + (sale.amount * COMMISSION_RATE), 0);
    
    // Calculate last month's earnings
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthEarnings = salesData
      .filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= startOfLastMonth && saleDate <= endOfLastMonth;
      })
      .reduce((total, sale) => total + (sale.amount * COMMISSION_RATE), 0);
    
    // Calculate last week's earnings
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const lastWeekEarnings = salesData
      .filter(sale => new Date(sale.date) >= oneWeekAgo)
      .reduce((total, sale) => total + (sale.amount * COMMISSION_RATE), 0);
    
    // Get earnings per batch
    const batchesWithEarnings = await Promise.all(teacher.batches.map(async (batch) => {
      // Get students in this batch
      const batchStudents = await Student.find({ batches: batch._id });
      const batchStudentIds = batchStudents.map(student => student._id);
      
      // Get sales from students in this batch
      const batchSales = await Sales.find({
        student: { $in: batchStudentIds },
        status: 'completed'
      });
      
      // Calculate earnings from this batch
      const batchEarnings = batchSales.reduce(
        (total, sale) => total + (sale.amount * COMMISSION_RATE), 
        0
      );
      
      return {
        id: batch._id,
        name: batch.batchName,
        earnings: batchEarnings,
        studentCount: batchStudents.length
      };
    }));
    
    // Format transactions data
    const transactions = salesData.map(sale => ({
      date: sale.date.toISOString().split('T')[0],
      student: sale.student.name,
      batch: teacher.batches.find(batch => 
        sale.student.batches.some(sb => sb.toString() === batch._id.toString())
      )?.batchName || 'Unknown Batch',
      amount: sale.amount,
      commission: sale.amount * COMMISSION_RATE
    }));
    
    // Get monthly and weekly data for charts
    const monthlyData = await getMonthlyData(salesData, COMMISSION_RATE);
    const weeklyData = await getWeeklyData(salesData, COMMISSION_RATE);
    
    res.json({
      totalEarnings,
      pendingEarnings,
      lastMonth: lastMonthEarnings,
      lastWeek: lastWeekEarnings,
      batches: batchesWithEarnings,
      monthlyData,
      weeklyData,
      dailyTransactions: transactions
    });
    
  } catch (error) {
    console.error('Error fetching teacher earnings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to get monthly data for the current year
const getMonthlyData = async (salesData, commissionRate) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  
  const monthlyEarnings = new Array(12).fill(0);
  
  salesData.forEach(sale => {
    const saleDate = new Date(sale.date);
    if (saleDate.getFullYear() === currentYear) {
      const month = saleDate.getMonth();
      monthlyEarnings[month] += sale.amount * commissionRate;
    }
  });
  
  return months.map((month, index) => ({
    name: month,
    earnings: Math.round(monthlyEarnings[index])
  }));
};

// Helper function to get weekly data for the current week
const getWeeklyData = async (salesData, commissionRate) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const weeklyEarnings = new Array(7).fill(0);
  
  salesData.forEach(sale => {
    const saleDate = new Date(sale.date);
    const diffTime = Math.abs(saleDate - startOfWeek);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      const dayOfWeek = saleDate.getDay();
      weeklyEarnings[dayOfWeek] += sale.amount * commissionRate;
    }
  });
  
  return days.map((day, index) => ({
    name: day,
    earnings: Math.round(weeklyEarnings[index])
  }));
};


// Get earnings for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    
    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Calculate total earnings from sales
    const salesData = await Sales.find({ 
      student: studentId,
      status: 'completed'
    });
    
    const totalEarnings = salesData.reduce((sum, sale) => sum + sale.amount, 0);
    
    // Update student's earning field
    await Student.findByIdAndUpdate(studentId, { earning: totalEarnings });
    
    // Calculate earnings by month
    const earningsByMonth = {};
    salesData.forEach(sale => {
      const date = new Date(sale.date);
      const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
      
      if (!earningsByMonth[monthYear]) {
        earningsByMonth[monthYear] = 0;
      }
      
      earningsByMonth[monthYear] += sale.amount;
    });
    
    // Return earnings data
    res.json({
      totalEarnings,
      earningsByMonth,
      recentSales: salesData.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get earnings for all students
router.get('/', async (req, res) => {
  try {
    // Get all students
    const students = await Student.find();
    
    // Calculate earnings for each student
    const earningsData = await Promise.all(students.map(async (student) => {
      const salesData = await Sales.find({ 
        student: student._id,
        status: 'completed'
      });
      
      const totalEarnings = salesData.reduce((sum, sale) => sum + sale.amount, 0);
      
      return {
        studentId: student._id,
        name: student.name,
        totalEarnings
      };
    }));
    
    res.json(earningsData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update student's task completion and attendance stats
router.put('/stats/:studentId', async (req, res) => {
  try {
    const { taskCompletion, attendance } = req.body;
    const studentId = req.params.studentId;
    
    const updateData = {};
    if (taskCompletion !== undefined) updateData.taskCompletion = taskCompletion;
    if (attendance !== undefined) updateData.attendance = attendance;
    
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      updateData,
      { new: true }
    );
    
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;