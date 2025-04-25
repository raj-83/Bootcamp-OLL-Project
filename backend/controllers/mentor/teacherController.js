// backend/controllers/teacher.controller.js
import Teacher from '../models/teacher.model.js';
import Batch from '../models/batch.model.js';

// Get teacher dashboard data (protected route)
export const getTeacherDashboard = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const teacherId = req.user._id;
    
    // Find teacher with populated batches and students
    const teacher = await Teacher.findById(teacherId)
      .populate({
        path: 'batches',
        populate: {
          path: 'students',
          select: '_id name'
        }
      });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Get recent batches (limit to 5)
    const recentBatches = await Batch.find({ teacher: teacherId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Find the next scheduled session
    const today = new Date();
    const upcomingBatch = await Batch.findOne({
      teacher: teacherId,
      startDate: { $gte: today }
    }).sort({ startDate: 1 });
    
    // Format batches for the table
    const formattedRecentBatches = recentBatches.map(batch => {
      // Determine batch status
      let status = 'upcoming';
      if (batch.startDate <= today && batch.endDate >= today) {
        status = 'ongoing';
      } else if (batch.endDate < today) {
        status = 'completed';
      }
      
      return {
        id: batch._id,
        name: batch.batchName,
        status,
        students: batch.students.length,
        earnings: (batch.revenue * 0.2).toFixed(2) // 20% commission
      };
    });
    
    // Format next session if available
    let nextSession = null;
    if (upcomingBatch) {
      nextSession = {
        batchId: upcomingBatch._id,
        batch: upcomingBatch.batchName,
        date: upcomingBatch.startDate,
        topic: upcomingBatch.sessionTopic || 'Introduction'
      };
    }
    
    // Prepare dashboard data
    const dashboardData = {
      teacherName: teacher.name,
      totalEarnings: teacher.totalEarnings.toFixed(2),
      totalStudents: teacher.totalStudents,
      totalBatches: teacher.totalBatches,
      recentBatches: formattedRecentBatches,
      batches: teacher.batches,
      students: teacher.students,
      nextSession
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Error in getTeacherDashboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};