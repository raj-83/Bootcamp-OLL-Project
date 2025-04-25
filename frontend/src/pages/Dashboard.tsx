import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, DollarSign, Trophy, BarChart3, Users, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui-custom/UserAvatar';
import ProgressCard from '@/components/ui-custom/ProgressCard';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface StudentDashboardData {
  name: string;
  business: string;
  earnings: number;
  sales: number;
  progress: number;
  badges: number;
  rank: number;
  tasks: Array<{
    id: number;
    title: string;
    completed: boolean;
  }>;
}

interface MentorDashboardData {
  name: string;
  students: number;
  pendingApprovals: number;
  totalEarnings: number;
  rank: number;
}

interface AdminDashboardData {
  totalStudents: number;
  totalMentors: number;
  totalRevenue: number;
  pendingApprovals: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/dashboard/${user.role.toLowerCase()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Failed to load dashboard</h2>
          <Button onClick={fetchDashboardData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Render different dashboards based on user role
  switch (user.role) {
    case 'Student':
      return <StudentDashboard data={dashboardData} />;
    case 'Teacher':
      return <MentorDashboard data={dashboardData} />;
    case 'Admin':
      return <AdminDashboard data={dashboardData} />;
    default:
      return <div>Invalid role</div>;
  }
};

const StudentDashboard = ({ data }: { data: StudentDashboardData }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <Button asChild>
          <Link to="/student/business">
            <Rocket className="mr-2" size={16} />
            My Business
          </Link>
        </Button>
      </div>

      {/* Welcome Card */}
      <Card className="animate-fade-in">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <UserAvatar name={data.name} size="lg" />
            <div>
              <h2 className="text-xl font-semibold">Welcome back, {data.name}!</h2>
              <p className="text-muted-foreground">Your business: <span className="font-medium text-primary">{data.business}</span></p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
        <ProgressCard 
          title="Business Progress"
          value={data.progress}
          maxValue={100}
          icon={<Rocket size={16} />}
          color="primary"
        />
        
        <ProgressCard 
          title="Total Sales"
          value={data.sales}
          maxValue={50}
          icon={<ShoppingBag size={16} />}
          color="success"
        />
        
        <ProgressCard 
          title="Badges Earned"
          value={data.badges}
          maxValue={10}
          icon={<Trophy size={16} />}
          color="accent"
        />
      </div>

      {/* Leaderboard & Earnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy size={18} className="text-accent" />
              Leaderboard Status
            </CardTitle>
            <CardDescription>Your current ranking among other students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-accent/10 text-accent flex items-center justify-center text-2xl font-bold">
                #{data.rank}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">You're in the top 10%</p>
                <Link to="/leaderboard" className="text-primary hover:underline flex items-center gap-1 text-sm font-medium">
                  View Full Leaderboard
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={18} className="text-success" />
              Earnings
            </CardTitle>
            <CardDescription>Your business revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">${data.earnings}</div>
            <p className="text-sm text-muted-foreground">
              From {data.sales} total sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks */}
      <Card className="animate-fade-in" style={{animationDelay: '0.3s'}}>
        <CardHeader>
          <CardTitle>Business Tasks</CardTitle>
          <CardDescription>Complete these tasks to grow your business</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.tasks.map(task => (
              <li key={task.id} className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full mt-0.5 flex-shrink-0 flex items-center justify-center ${task.completed ? 'bg-success/20 text-success' : 'bg-muted'}`}>
                  {task.completed && <div className="w-2 h-2 bg-success rounded-full" />}
                </div>
                <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                  {task.title}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

const MentorDashboard = ({ data }: { data: MentorDashboardData }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mentor Dashboard</h1>
        <Button asChild>
          <Link to="/mentor/students">
            <Users className="mr-2" size={16} />
            View Students
          </Link>
        </Button>
      </div>

      {/* Welcome Card */}
      <Card className="animate-fade-in">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <UserAvatar name={data.name} size="lg" />
            <div>
              <h2 className="text-xl font-semibold">Welcome back, {data.name}!</h2>
              <p className="text-muted-foreground">You have {data.pendingApprovals} pending approvals</p>
            </div>
            {data.pendingApprovals > 0 && (
              <Button className="md:ml-auto" variant="outline" asChild>
                <Link to="/mentor/approvals">Review Approvals</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.students}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalEarnings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mentor Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{data.rank}</div>
          </CardContent>
        </Card>
      </div>

      {/* Student List Preview */}
      <Card className="animate-fade-in" style={{animationDelay: '0.2s'}}>
        <CardHeader>
          <CardTitle>Your Students</CardTitle>
          <CardDescription>Recent activity from your assigned students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* This would be a list of students in a real app */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <UserAvatar name="Jamie Lee" size="sm" />
                <div>
                  <p className="font-medium">Jamie Lee</p>
                  <p className="text-xs text-muted-foreground">Updated business plan</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/students/1">View</Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <UserAvatar name="Taylor Swift" size="sm" />
                <div>
                  <p className="font-medium">Taylor Swift</p>
                  <p className="text-xs text-muted-foreground">Made first sale</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/students/2">View</Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <UserAvatar name="Miguel Santos" size="sm" />
                <div>
                  <p className="font-medium">Miguel Santos</p>
                  <p className="text-xs text-muted-foreground">Needs approval on pricing</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/students/3">View</Link>
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/students">View All Students</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminDashboard = ({ data }: { data: AdminDashboardData }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users size={20} className="text-primary" />
              <div className="text-2xl font-bold">{data.totalStudents}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Mentors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users size={20} className="text-secondary" />
              <div className="text-2xl font-bold">{data.totalMentors}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-success" />
              <div className="text-2xl font-bold">${data.totalRevenue}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 size={20} className="text-accent" />
              <div className="text-2xl font-bold">{data.pendingApprovals}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="animate-fade-in" style={{animationDelay: '0.1s'}}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Users size={16} />
              </div>
              <div>
                <p className="font-medium">New Student Registration</p>
                <p className="text-xs text-muted-foreground">Emily Parker joined the platform</p>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">2h ago</div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center">
                <DollarSign size={16} />
              </div>
              <div>
                <p className="font-medium">New Sale Recorded</p>
                <p className="text-xs text-muted-foreground">Alex Johnson made a sale of $45</p>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">5h ago</div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <Trophy size={16} />
              </div>
              <div>
                <p className="font-medium">Leaderboard Update</p>
                <p className="text-xs text-muted-foreground">Weekly leaderboard rankings updated</p>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">1d ago</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild>
              <Link to="/users/add">Add New User</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/approvals">Review Pending Approvals ({data.pendingApprovals})</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/leaderboard/manage">Manage Leaderboards</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Database</span>
                <span className="badge-success">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span>API Services</span>
                <span className="badge-success">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment Processing</span>
                <span className="badge-success">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Email Notifications</span>
                <span className="badge-success">Operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
