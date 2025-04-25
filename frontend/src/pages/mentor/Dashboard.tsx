import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Users, Calendar, ArrowRight, BarChart3, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axios from 'axios';

const MentorDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(localStorage.getItem('id'));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get auth token from local storage
        const token = localStorage.getItem('token');
        
        if (!token) {
          // Redirect to login if no token
          navigate('/login');
          return;
        }
        
        // Configure axios with authorization header
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Fetch teacher dashboard data with auth token
        const response = await axios.get('http://localhost:5000/api/teachers/dashboard', config);
        setDashboardData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
        
        // For development only - fallback to mock data if the API fails
        setMockDataForDevelopment();
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // For development only - mock data function
  const setMockDataForDevelopment = () => {
    const mockData = {
      teacherName: "John Doe",
      totalEarnings: "1200.00",
      totalStudents: 24,
      totalBatches: 3,
      recentBatches: [
        {
          id: "1",
          name: "Advanced JavaScript 2025",
          status: "ongoing",
          students: 8,
          earnings: "320.00"
        },
        {
          id: "2",
          name: "React Fundamentals",
          status: "upcoming",
          students: 10,
          earnings: "400.00"
        },
        {
          id: "3",
          name: "Node.js Backend",
          status: "completed",
          students: 6,
          earnings: "240.00"
        }
      ],
      batches: [],
      students: [],
      nextSession: {
        batchId: "1",
        batch: "Advanced JavaScript 2025",
        date: new Date(new Date().getTime() + 86400000), // tomorrow
        topic: "ES6 Features and Modern JavaScript"
      }
    };
    
    setDashboardData(mockData);
    setLoading(false);
    setError(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading dashboard data...</div>;
  }

  if (error && !dashboardData) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!dashboardData) {
    return <div className="text-center p-4">No dashboard data available.</div>;
  }

  // Format next session date if available
  let formattedDate = '';
  let formattedTime = '';
  
  if (dashboardData.nextSession) {
    const nextSessionDate = new Date(dashboardData.nextSession.date);
    formattedDate = nextSessionDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    formattedTime = nextSessionDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {dashboardData.teacherName ? `${dashboardData.teacherName}'s Dashboard` : 'Mentor Dashboard'}
        </h1>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {error} Using demo data for preview.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Earnings</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <DollarSign className="mr-2 h-6 w-6 text-green-500" />
              ${dashboardData.totalEarnings}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              20% commission from student sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Students</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <Users className="mr-2 h-6 w-6 text-blue-500" />
              {dashboardData.totalStudents || dashboardData.students?.length || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Across {dashboardData.totalBatches || dashboardData.batches?.length || 0} batches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Batches</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <BarChart3 className="mr-2 h-6 w-6 text-purple-500" />
              {dashboardData.totalBatches || dashboardData.batches?.length || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* No button as requested */}
          </CardContent>
        </Card>
      </div>

      {/* Next session card */}
      {dashboardData.nextSession ? (
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Next Session
            </CardTitle>
            <CardDescription>
              {dashboardData.nextSession.batch}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>
                  {formattedDate} at {formattedTime}
                </span>
              </div>
              <div className="text-sm font-medium">
                Topic: {dashboardData.nextSession.topic}
              </div>
            </div>
            <div className="flex gap-2">
              <Button>
                Join Session
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/mentor/sessions/${dashboardData.nextSession.batchId}`)}
              >
                Session Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Recent batches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Batches</CardTitle>
          <CardDescription>Overview of your assigned batches</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData.recentBatches && dashboardData.recentBatches.length > 0 ? (
                dashboardData.recentBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.name}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        batch.status === 'ongoing' 
                          ? 'bg-green-100 text-green-800' 
                          : batch.status === 'upcoming' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {batch.status}
                      </span>
                    </TableCell>
                    <TableCell>{batch.students}</TableCell>
                    <TableCell className="text-right">${batch.earnings}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate(`/mentor/batches/${batch.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No batches found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorDashboard;