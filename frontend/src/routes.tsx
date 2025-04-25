import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from "./components/Layout/MainLayout";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentTasks from "./pages/student/Tasks";
import StudentSessions from "./pages/student/Sessions";
import StudentSales from "./pages/student/Sales";
import StudentLeaderboard from "./pages/student/Leaderboard";
import StudentProfile from "./pages/student/Profile";
import StudentFeedback from "./pages/student/Feedback";
import StudentReviews from "./pages/student/Reviews";
import StudentHelp from "./pages/student/Help";

// Mentor Pages
import MentorDashboard from "./pages/mentor/Dashboard";
import MentorBatches from "./pages/mentor/Batches";
import MentorBatchDetails from "./pages/mentor/BatchDetails";
import MentorEarnings from "./pages/mentor/Earnings";
import MentorLeaderboard from "./pages/mentor/Leaderboard";
import MentorStudentDetails from "./pages/mentor/StudentDetails";
import MentorSessions from "./pages/mentor/Sessions";
import MentorProfile from "./pages/mentor/Profile";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminBatches from "./pages/admin/Batches";
import AdminBatchDetails from "./pages/admin/BatchDetails";
import AdminEarnings from "./pages/admin/Earnings";
import AdminStudents from "./pages/admin/Students";
import AdminStudentDetails from "./pages/admin/StudentDetails";
import AdminTeachers from "./pages/admin/Teachers";
import AdminTeacherDetails from "./pages/admin/TeacherDetails";
import AdminProfile from "./pages/admin/Profile";
import AdminFeedback from "./pages/admin/Feedback";

const AppRoutes = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        element={
          <PrivateRoute allowedRoles={['Student', 'Teacher', 'Admin']}>
            <MainLayout />
          </PrivateRoute>
        }
      >
        {/* Default redirect */}
        <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />

        {/* Student Routes */}
        <Route
          path="/student/*"
          element={
            <PrivateRoute allowedRoles={['Student']}>
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="tasks" element={<StudentTasks />} />
                <Route path="sessions" element={<StudentSessions />} />
                <Route path="sales" element={<StudentSales />} />
                <Route path="leaderboard" element={<StudentLeaderboard />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="feedback" element={<StudentFeedback />} />
                <Route path="reviews" element={<StudentReviews />} />
                <Route path="help" element={<StudentHelp />} />
              </Routes>
            </PrivateRoute>
          }
        />

        {/* Mentor Routes */}
        <Route
          path="/mentor/*"
          element={
            <PrivateRoute allowedRoles={['Teacher']}>
              <Routes>
                <Route path="dashboard" element={<MentorDashboard />} />
                <Route path="batches" element={<MentorBatches />} />
                <Route path="batches/:batchId" element={<MentorBatchDetails />} />
                <Route path="students/:studentId" element={<MentorStudentDetails />} />
                <Route path="earnings" element={<MentorEarnings />} />
                <Route path="leaderboard" element={<MentorLeaderboard />} />
                <Route path="sessions" element={<MentorSessions />} />
                <Route path="profile" element={<MentorProfile />} />
              </Routes>
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="batches" element={<AdminBatches />} />
                <Route path="batches/:batchId" element={<AdminBatchDetails />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="students/:studentId" element={<AdminStudentDetails />} />
                <Route path="teachers" element={<AdminTeachers />} />
                <Route path="teachers/:teacherId" element={<AdminTeacherDetails />} />
                <Route path="earnings" element={<AdminEarnings />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="feedback" element={<AdminFeedback />} />
              </Routes>
            </PrivateRoute>
          }
        />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
