import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  IndianRupee, 
  Users, 
  School, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalRevenue: 0,
    totalBatches: 0,
    revenueData: [],
    enrollmentData: [],
    batchesMockData: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/dashboard/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const calculateTotalRevenueSplit = () => {
    // Calculate revenue split from actual batch data
    const total = dashboardData.batchesMockData.reduce((sum, batch) => sum + batch.revenue, 0);
    const teacherTotal = dashboardData.batchesMockData.reduce((sum, batch) => sum + (batch.teacherEarning || 0), 0);
    const ollTotal = dashboardData.batchesMockData.reduce((sum, batch) => sum + (batch.ollShare || 0), 0);
    const studentTotal = dashboardData.batchesMockData.reduce((sum, batch) => sum + (batch.studentEarning || 0), 0);

    return {
      total,
      teacherTotal,
      ollTotal,
      studentTotal
    };
  };

  const revenueSplit = calculateTotalRevenueSplit();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-success" />
                <div className="text-2xl font-bold">₹{dashboardData.totalRevenue}</div>
              </div>
              <div className="flex items-center text-xs font-medium text-success">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                12.5%
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div className="text-2xl font-bold">{dashboardData.totalStudents}</div>
              </div>
              <div className="flex items-center text-xs font-medium text-success">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                8.3%
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <School className="h-5 w-5 text-secondary" />
                <div className="text-2xl font-bold">{dashboardData.totalTeachers}</div>
              </div>
              <div className="flex items-center text-xs font-medium text-success">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                5.0%
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                <div className="text-2xl font-bold">{dashboardData.totalBatches}</div>
              </div>
              <div className="flex items-center text-xs font-medium text-destructive">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                3.2%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue from all batches</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => `₹${value}`}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.2)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Student Enrollment</CardTitle>
            <CardDescription>Monthly student enrollment numbers</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  // Ensure whole numbers only for student count
                  allowDecimals={false}
                />
                <Tooltip formatter={(value) => [`${value}`, 'Students']} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Distribution */}
      <Card className="animate-fade-in" style={{animationDelay: '0.2s'}}>
        <CardHeader>
          <CardTitle>Revenue Distribution</CardTitle>
          <CardDescription>Breakdown of revenue among students, teachers, and OLL</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground mb-1">Student Earnings (50%)</div>
              <div className="text-2xl font-bold">₹{revenueSplit.studentTotal}</div>
            </div>
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground mb-1">Teacher Earnings (20%)</div>
              <div className="text-2xl font-bold">₹{revenueSplit.teacherTotal}</div>
            </div>
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground mb-1">OLL Share (30%)</div>
              <div className="text-2xl font-bold">₹{revenueSplit.ollTotal}</div>
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="h-12 px-4 text-left align-middle font-medium">Batch Name</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Students</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">Total Revenue</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">Student Earnings</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">Teacher Share</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">OLL Share</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.batchesMockData.map((batch, index) => (
                  <tr key={batch._id || index} className="border-b transition-colors hover:bg-muted/20">
                    <td className="p-4 align-middle font-medium">{batch.batchName || `Batch ${index + 1}`}</td>
                    <td className="p-4 align-middle text-center">{batch.students || 0}</td>
                    <td className="p-4 align-middle text-right">₹{batch.revenue || 0}</td>
                    <td className="p-4 align-middle text-right">₹{batch.studentEarning || batch.revenue * 0.5}</td>
                    <td className="p-4 align-middle text-right">₹{batch.teacherEarning || batch.revenue * 0.2}</td>
                    <td className="p-4 align-middle text-right">₹{batch.ollShare || batch.revenue * 0.3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;