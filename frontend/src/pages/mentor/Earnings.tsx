import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { IndianRupee, TrendingUp, Calendar, BarChart3, PieChart as PieChartIcon, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

const apiUrl = import.meta.env.VITE_REACT_API_URL || "https://localhost:5000";

// Colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const MentorEarnings = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [batchFilter, setBatchFilter] = useState('all');
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        setLoading(true);
        const teacherId = localStorage.getItem('id');
        
        if (!teacherId) {
          throw new Error('Teacher ID not found in localStorage');
        }

        const response = await axios.get(`${apiUrl}/api/earnings/teacher/${teacherId}`);
        setEarningsData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching earnings data:', err);
        setError('Failed to load earnings data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, []);

  // Filter transactions based on selected batch
  const filteredTransactions = earningsData && (batchFilter === 'all' 
    ? earningsData.dailyTransactions
    : earningsData.dailyTransactions.filter(t => t.batch.includes(batchFilter)));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!earningsData) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold">No earnings data available</h2>
        <p className="text-muted-foreground mt-2">
          Start mentoring students to see your earnings here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Earnings</h1>
        
        <div className="w-full sm:w-48">
          <Select value={batchFilter} onValueChange={setBatchFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {earningsData.batches.map(batch => (
                <SelectItem key={batch.id} value={batch.name}>
                  {batch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Earnings</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <IndianRupee className="mr-2 h-6 w-6 text-success" />
              ₹{earningsData.totalEarnings.toFixed(2)}
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
            <CardDescription>Pending Earnings</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <IndianRupee className="mr-2 h-6 w-6 text-warning" />
              ₹{earningsData.pendingEarnings.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Will be processed by end of month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Last Month</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <Calendar className="mr-2 h-6 w-6 text-blue-500" />
              ₹{earningsData.lastMonth.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              30-day earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Last Week</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <TrendingUp className="mr-2 h-6 w-6 text-primary" />
              ₹{earningsData.lastWeek.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              7-day earnings
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto">
          <TabsTrigger value="chart">Charts</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5 text-muted-foreground" />
                      Earnings Trend
                    </CardTitle>
                    <CardDescription>View your earnings over time</CardDescription>
                  </div>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {timeframe === 'monthly' ? (
                      <LineChart
                        data={earningsData.monthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${value}`, 'Earnings']} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="earnings" 
                          name="Monthly Earnings" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                      </LineChart>
                    ) : (
                      <BarChart
                        data={earningsData.weeklyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${value}`, 'Earnings']} />
                        <Legend />
                        <Bar 
                          dataKey="earnings" 
                          name="Daily Earnings" 
                          fill="#8884d8" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                  Earnings by Batch
                </CardTitle>
                <CardDescription>Distribution of earnings across batches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={earningsData.batches.filter(b => b.earnings > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="earnings"
                        nameKey="name"
                        label={({ name, percent }) => `${name.split(' - ')[1] || name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {earningsData.batches.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => (typeof value === 'number' ? [`₹${value.toFixed(2)}`, 'Earnings'] : [value, 'Earnings'])} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-muted-foreground" />
                  Batch Comparison
                </CardTitle>
                <CardDescription>Earnings vs. Student Count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={earningsData.batches}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={false} />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip formatter={(value, name) => [
                        name === 'earnings' && typeof value === 'number' ? `₹${value.toFixed(2)}` : value,
                        name === 'earnings' ? 'Earnings' : 'Student Count'
                      ]} />
                      <Legend />
                      <Bar 
                        yAxisId="left" 
                        dataKey="earnings" 
                        name="Earnings" 
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]} 
                      />
                      <Bar 
                        yAxisId="right" 
                        dataKey="studentCount" 
                        name="Students" 
                        fill="#82ca9d"
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="batches">
          <Card>
            <CardHeader>
              <CardTitle>Batch Earnings</CardTitle>
              <CardDescription>Earnings from each of your batches</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Name</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Avg. per Student</TableHead>
                    <TableHead className="text-right">Total Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earningsData.batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.name}</TableCell>
                      <TableCell>{batch.studentCount}</TableCell>
                      <TableCell>
                        ₹{batch.studentCount > 0 
                          ? (batch.earnings / batch.studentCount).toFixed(2) 
                          : '0.00'}
                      </TableCell>
                      <TableCell className="text-right font-medium">₹{batch.earnings.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your commission from student sales (20%)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Sale Amount</TableHead>
                    <TableHead className="text-right">Your Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions && filteredTransactions.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell className="font-medium">{transaction.student}</TableCell>
                      <TableCell>{transaction.batch}</TableCell>
                      <TableCell>₹{transaction.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-success font-medium">
                        ₹{transaction.commission.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {(!filteredTransactions || filteredTransactions.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found for the selected batch.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MentorEarnings;