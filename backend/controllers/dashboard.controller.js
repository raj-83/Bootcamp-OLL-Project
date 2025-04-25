import Batch from '../models/batch.model.js';
import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';

// API endpoint to get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalBatches = await Batch.countDocuments();
    
    // Calculate total revenue
    const batches = await Batch.find().populate('students');
    const totalRevenue = batches.reduce((sum, batch) => sum + (batch.revenue || 0), 0);
    
    // Get monthly revenue data (for the calendar year)
    const monthlyRevenue = await getMonthlyRevenue();
    
    // Get monthly enrollment data (for the calendar year)
    const monthlyEnrollment = await getMonthlyEnrollment();
    
    // Get all batches with complete data for the table
    const batchesMockData = await getBatchesData();
    
    res.status(200).json({
      totalStudents,
      totalTeachers,
      totalRevenue,
      totalBatches,
      revenueData: monthlyRevenue,
      enrollmentData: monthlyEnrollment,
      batchesMockData // Changed from batchesData to match frontend expected prop
    });
    
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

// Helper function to get monthly revenue data - Jan to Dec of current year
const getMonthlyRevenue = async () => {
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = [];
  
  // For each month, get the sum of batch revenue
  for (let i = 0; i < 12; i++) {
    const startOfMonth = new Date(currentYear, i, 1);
    const endOfMonth = new Date(currentYear, i + 1, 0);
    
    const monthBatches = await Batch.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    const monthRevenue = monthBatches.reduce((sum, batch) => sum + (batch.revenue || 0), 0);
    
    data.push({
      month: months[i],
      value: monthRevenue
    });
  }
  
  return data;
};

// Helper function to get monthly enrollment data - Jan to Dec of current year
const getMonthlyEnrollment = async () => {
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = [];
  
  // For each month, count students enrolled
  for (let i = 0; i < 12; i++) {
    const startOfMonth = new Date(currentYear, i, 1);
    const endOfMonth = new Date(currentYear, i + 1, 0);
    
    const studentsCount = await Student.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    data.push({
      month: months[i],
      value: studentsCount // Whole number of students
    });
  }
  
  return data;
};

// Helper function to get batches data for the table
const getBatchesData = async () => {
  const batches = await Batch.find()
    .populate('teacher', 'name')
    .populate('students');
  
  return batches.map(batch => {
    const totalRevenue = batch.revenue || 0;
    const studentCount = batch.students.length; // Count actual students in the array
    
    return {
      _id: batch._id, // Fixed the typo in _id
      batchName: batch.batchName || `Batch ${batch._id.toString().slice(-4)}`,
      students: studentCount,
      revenue: totalRevenue,
      teacherEarning: Math.round(totalRevenue * 0.2), // 20% for teacher
      ollShare: Math.round(totalRevenue * 0.3), // 30% for OLL
      // Student earnings calculated as remaining 50%
      studentEarning: Math.round(totalRevenue * 0.5)
    };
  });
};