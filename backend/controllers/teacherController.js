// /api/controllers/teacherController.js
import Teacher from '../models/teacher.model.js';

export const getTeacherDashboardData = async (req, res) => {
  try {
    // Get teacher ID from authenticated user (assuming authentication middleware sets req.userId)
    const teacherId = req.userId;
    
    // Find teacher with populated batches and students
    const teacher = await Teacher.findById(teacherId)
      .populate({
        path: 'batches',
        select: 'name status students earnings startDate nextSessionDate nextSessionTopic',
        populate: {
          path: 'students',
          select: 'name'
        }
      });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Format recent batches
    const recentBatches = teacher.batches.map(batch => ({
      id: batch._id,
      name: batch.name,
      status: batch.status,
      students: batch.students.length,
      earnings: batch.earnings || 0
    }));

    // Get next session info
    let nextSession = null;
    for (const batch of teacher.batches) {
      if (batch.nextSessionDate && new Date(batch.nextSessionDate) > new Date()) {
        if (!nextSession || new Date(batch.nextSessionDate) < new Date(nextSession.date)) {
          nextSession = {
            date: batch.nextSessionDate,
            batch: batch.name,
            topic: batch.nextSessionTopic || 'General Discussion',
            batchId: batch._id
          };
        }
      }
    }

    // Format data for frontend
    const dashboardData = {
      totalEarnings: teacher.totalEarnings || 0,
      totalStudents: teacher.totalStudents || 0,
      totalBatches: teacher.totalBatches || 0,
      nextSession: nextSession,
      recentBatches: recentBatches.slice(0, 3), // Just get the 3 most recent batches
      teacherName: teacher.name
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Error fetching teacher dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};