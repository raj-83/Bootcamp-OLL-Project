
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  DollarSign, 
  CalendarDays, 
  Download, 
  Briefcase, 
  Users, 
  School
} from 'lucide-react';

// Mock data for total earnings
const totalEarningsData = {
  totalEarnings: 24650,
  totalStudentSales: 123250,
  studentCount: 156,
  teacherCount: 12,
  batchCount: 9
};

// Mock data for daily earnings
const dailyEarningsData = [
  { date: '2023-06-01', earnings: 150, studentSales: 0},
  { date: '2023-06-02', earnings: 200, studentSales: 0 },
  { date: '2023-06-03', earnings: 100, studentSales: 0},
  { date: '2023-06-04', earnings: 300, studentSales: 0 },
  { date: '2023-06-05', earnings: 250, studentSales: 0 },
  { date: '2023-06-06', earnings: 320, studentSales: 0 },
  { date: '2023-06-07', earnings: 280, studentSales: 0 },
  { date: '2023-06-08', earnings: 220, studentSales: 0 },
  { date: '2023-06-09', earnings: 190, studentSales: 0},
  { date: '2023-06-10', earnings: 350, studentSales: 0 },
  { date: '2023-06-11', earnings: 400, studentSales: 0 },
  { date: '2023-06-12', earnings: 280, studentSales: 0 },
  { date: '2023-06-13', earnings: 250, studentSales: 0 },
  { date: '2023-06-14', earnings: 310, studentSales: 0 },
];

// Mock data for batch earnings
const batchEarningsData = [
  { 
    id: 1, 
    name: "Business Bootcamp - Batch 1", 
    status: "ongoing", 
    students: 15,
    teacher: "Jamie Smith",
    totalSales: 6000,
    platformEarnings: 1200,
    teacherEarnings: 1200,
    studentEarnings: 3600
  },
  { 
    id: 2, 
    name: "Business Bootcamp - Batch 2", 
    status: "ongoing", 
    students: 18,
    teacher: "Alex Rodriguez",
    totalSales: 4750,
    platformEarnings: 950,
    teacherEarnings: 950,
    studentEarnings: 2850
  },
  { 
    id: 3, 
    name: "Entrepreneurship 101", 
    status: "upcoming", 
    students: 12,
    teacher: "Sarah Johnson",
    totalSales: 0,
    platformEarnings: 0,
    teacherEarnings: 0,
    studentEarnings: 0
  },
  { 
    id: 4, 
    name: "Business Bootcamp - Batch 0", 
    status: "completed", 
    students: 16,
    teacher: "Jamie Smith",
    totalSales: 7250,
    platformEarnings: 1450,
    teacherEarnings: 1450,
    studentEarnings: 4350
  }
];

// Mock data for teacher earnings
const teacherEarningsData = [
  {
    id: 1,
    name: 'Jamie Smith',
    specialization: 'Business Strategy',
    batches: 2,
    students: 31,
    earnings: 2650
  },
  {
    id: 2,
    name: 'Alex Rodriguez',
    specialization: 'Marketing',
    batches: 1,
    students: 18,
    earnings: 950
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    specialization: 'Entrepreneurship',
    batches: 1,
    students: 12,
    earnings: 0
  }
];

// Pie chart data for earning distribution
const distributionData = [
  { name: 'Platform', value: 24650, color: '#8884d8' },
  { name: 'Teachers', value: 24650, color: '#82ca9d' },
  { name: 'Students', value: 73950, color: '#ffc658' },
];

// Colors for the pie chart
const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

const AdminEarnings = () => {
  const [timeRange, setTimeRange] = useState('30days');
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Earnings Dashboard</h1>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="alltime">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Platform Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <DollarSign className="h-5 w-5 text-success mr-1" />
              ${totalEarningsData.totalEarnings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              20% commission from ${totalEarningsData.totalStudentSales} total sales
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Briefcase className="h-5 w-5 text-primary mr-1" />
              {totalEarningsData.batchCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {totalEarningsData.teacherCount} teachers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Users className="h-5 w-5 text-secondary mr-1" />
              {totalEarningsData.studentCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              With recorded sales and activities
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="daily">Daily Earnings</TabsTrigger>
          <TabsTrigger value="batches">Batch Earnings</TabsTrigger>
          <TabsTrigger value="teachers">Teacher Earnings</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Earnings</CardTitle>
              <CardDescription>
                Platform earnings over time (20% commission)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyEarningsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Earnings']}
                      labelFormatter={(label) => `Date: ${formatDate(label)}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="earnings" 
                      name="Platform Earnings"
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="studentSales" 
                      name="Student Sales" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Earnings</CardTitle>
              <CardDescription>
                Earnings breakdown by batch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={batchEarningsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, '']} />
                    <Legend />
                    <Bar 
                      dataKey="platformEarnings" 
                      fill="#8884d8" 
                      name="Platform Earnings"
                    />
                    <Bar 
                      dataKey="teacherEarnings" 
                      fill="#82ca9d" 
                      name="Teacher Earnings"
                    />
                    <Bar 
                      dataKey="studentEarnings" 
                      fill="#ffc658" 
                      name="Student Earnings"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Platform Earnings</TableHead>
                    <TableHead>Teacher Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchEarningsData.map(batch => (
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
                      <TableCell>{batch.teacher}</TableCell>
                      <TableCell>{batch.students}</TableCell>
                      <TableCell>${batch.totalSales}</TableCell>
                      <TableCell>${batch.platformEarnings}</TableCell>
                      <TableCell>${batch.teacherEarnings}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Earnings</CardTitle>
              <CardDescription>
                Earnings breakdown by teacher
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={teacherEarningsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                    <Legend />
                    <Bar 
                      dataKey="earnings" 
                      name="Earnings" 
                      fill="#8884d8" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Total Batches</TableHead>
                    <TableHead>Total Students</TableHead>
                    <TableHead>Total Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherEarningsData.map(teacher => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4 text-muted-foreground" />
                          {teacher.name}
                        </div>
                      </TableCell>
                      <TableCell>{teacher.specialization}</TableCell>
                      <TableCell>{teacher.batches}</TableCell>
                      <TableCell>{teacher.students}</TableCell>
                      <TableCell>${teacher.earnings}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Distribution</CardTitle>
              <CardDescription>
                How revenue is distributed between platform, teachers, and students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {distributionData.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-2xl font-bold">${item.value}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.name === 'Platform' && '20% platform fee'}
                            {item.name === 'Teachers' && '20% commission to teachers'}
                            {item.name === 'Students' && '60% retained by students'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminEarnings;
