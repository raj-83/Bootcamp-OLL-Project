import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, DollarSign, Link, Plus, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ProgressCard from '@/components/ui-custom/ProgressCard';
import TaskCard from '@/components/student/TaskCard';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO } from 'date-fns';
import { Link as RouterLink } from 'react-router-dom';
import SaleForm from '@/components/student/SaleForm';
import axios from 'axios';
const API_URL = 'https://bootcamp-project-oll.onrender.com/api';

const StudentDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [nextSession, setNextSession] = useState(null);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [salesTarget, setSalesTarget] = useState(500); // Default target value
  const [stats, setStats] = useState({
    attendance: 0,
    taskCompletion: 0,
    customerCount: 0
  });

  useEffect(() => {
    const studentId = localStorage.getItem('id');
    if (!studentId) {
      toast({
        title: "Authentication Error",
        description: "Please login again to access your dashboard.",
        variant: "destructive"
      });
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch student profile
        const studentResponse = await axios.get(`${API_URL}/profile/student/${studentId}`);
        setStudentData(studentResponse.data);
        
        // Fetch tasks
        const tasksResponse = await axios.get(`${API_URL}/tasks/student/${studentId}`);
        setTasks(tasksResponse.data);
        
        // Fetch next session
        const sessionResponse = await axios.get(`${API_URL}/sessions/upcoming/student/${studentId}`);
        if (sessionResponse.data && sessionResponse.data.length > 0) {
          setNextSession(sessionResponse.data[0]);
        }
        
        // Fetch earnings
        const earningsResponse = await axios.get(`${API_URL}/earnings/student/${studentId}`);
        setTotalEarnings(earningsResponse.data.totalEarnings || 0);
        
        // Fetch sales data for customer count
        const salesResponse = await axios.get(`${API_URL}/sales/student/${studentId}`);
        const customerCount = new Set(salesResponse.data.map(sale => sale.customer)).size;
        
        // Set stats
        setStats({
          attendance: studentResponse.data.attendance || 0,
          taskCompletion: studentResponse.data.taskCompletion || 0,
          customerCount: customerCount
        });
        
        // If there's a batch, get the sales target
        if (studentResponse.data.batches && studentResponse.data.batches.length > 0) {
          const batchId = studentResponse.data.batches[0]; // Assuming we use the first batch
          const batchResponse = await axios.get(`${API_URL}/batches/${batchId}`);
          setSalesTarget(batchResponse.data.revenue || 500);
        }
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const handleJoinSession = () => {
    if (nextSession && nextSession.meetingLink) {
      window.open(nextSession.meetingLink, "_blank");
      toast({
        title: "Session Link Opened",
        description: "You're joining the session in a new tab."
      });
    } else {
      toast({
        title: "Session Link Unavailable",
        description: "No meeting link available for this session.",
        variant: "destructive"
      });
    }
  };


  // Parse task status to match the format in your TaskCard component
  const formatTaskStatus = (task) => {
    if (task.status === 'completed') return "completed";
    
    const currentDate = new Date();
    const dueDate = new Date(task.dueDate);
    
    if (dueDate < currentDate && task.status === 'pending') {
      return "overdue";
    }
    
    return task.status;
  };

  // Sort and format tasks
  const formattedTasks = tasks.map(task => ({
    id: task._id,
    title: task.title,
    description: task.description,
    status: formatTaskStatus(task),
    deadline: task.dueDate,
    submittedAt: task.updatedAt
  }));
  
  // Filter pending tasks
  const pendingTasks = formattedTasks.filter(task => 
    ["pending", "overdue"].includes(task.status)
  );

  // Format next session date and time if available
  const sessionDate = nextSession ? new Date(nextSession.date) : null;
  const sessionTime = nextSession ? nextSession.time : null;

  // Get student's current batch
  const currentBatch = studentData?.batches?.[0]?.batchName || "Current Batch";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <Badge variant="outline" className="font-normal">{currentBatch}</Badge>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="pb-3">
          <CardTitle>My Earnings</CardTitle>
          <CardDescription>Total sales revenue generated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-primary">${totalEarnings.toFixed(2)}</h2>
              <p className="text-sm text-muted-foreground">Target: ${salesTarget.toFixed(2)}</p>
              <div className="w-full max-w-[200px] mt-2">
                <Progress value={(totalEarnings / salesTarget) * 100} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {nextSession && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Next Session</CardTitle>
              <Badge>
                {sessionDate ? format(sessionDate, "MMM d") : "TBD"}
              </Badge>
            </div>
            <CardDescription>{nextSession.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-muted-foreground" />
                <span>{sessionTime || "Time not set"}</span>
              </div>
              <Button onClick={handleJoinSession} className="gap-1" disabled={!nextSession.meetingLink}>
                <Link size={16} />
                Join Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ProgressCard
          title="Attendance"
          value={stats.attendance}
          maxValue={100}
          icon={<Calendar size={18} />}
          color="primary"
        />
        <ProgressCard
          title="Task Completion"
          value={stats.taskCompletion}
          maxValue={100}
          icon={<CheckCircle size={18} />}
          color="success"
        />
        <ProgressCard
          title="Customer Count"
          value={stats.customerCount}
          maxValue={20}
          icon={<Star size={18} />}
          color="accent"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending Tasks</CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </div>
          <Button size="sm" variant="outline" asChild>
            <RouterLink to="/student/tasks">View All Tasks</RouterLink>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingTasks.slice(0, 3).map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            
            {pendingTasks.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <p>No pending tasks! Great job!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;