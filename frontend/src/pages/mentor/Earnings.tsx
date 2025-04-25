
import React, { useState } from 'react';
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
import { DollarSign, TrendingUp, Calendar, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data
const earningsData = {
  totalEarnings: 2450,
  pendingEarnings: 350,
  lastMonth: 650,
  lastWeek: 180,
  batches: [
    { id: 1, name: "Business Bootcamp - Batch 1", earnings: 1200, studentCount: 15 },
    { id: 2, name: "Business Bootcamp - Batch 2", earnings: 950, studentCount: 18 },
    { id: 3, name: "Entrepreneurship 101", earnings: 0, studentCount: 12 },
    { id: 4, name: "Business Bootcamp - Batch 0", earnings: 300, studentCount: 16 },
  ],
  monthlyData: [
    { name: 'Jan', earnings: 150 },
    { name: 'Feb', earnings: 300 },
    { name: 'Mar', earnings: 200 },
    { name: 'Apr', earnings: 400 },
    { name: 'May', earnings: 580 },
    { name: 'Jun', earnings: 820 },
  ],
  weeklyData: [
    { name: 'Mon', earnings: 45 },
    { name: 'Tue', earnings: 30 },
    { name: 'Wed', earnings: 60 },
    { name: 'Thu', earnings: 75 },
    { name: 'Fri', earnings: 90 },
    { name: 'Sat', earnings: 120 },
    { name: 'Sun', earnings: 40 },
  ],
  dailyTransactions: [
    { date: '2023-06-01', student: 'Alex Johnson', batch: 'Business Bootcamp - Batch 1', amount: 25, commission: 5 },
    { date: '2023-06-02', student: 'Samantha Lee', batch: 'Business Bootcamp - Batch 1', amount: 40, commission: 8 },
    { date: '2023-06-03', student: 'Miguel Santos', batch: 'Business Bootcamp - Batch 2', amount: 35, commission: 7 },
    { date: '2023-06-04', student: 'Emma Wilson', batch: 'Business Bootcamp - Batch 2', amount: 50, commission: 10 },
    { date: '2023-06-05', student: 'Jayden Brown', batch: 'Business Bootcamp - Batch 1', amount: 45, commission: 9 },
    { date: '2023-06-06', student: 'Sophia Chen', batch: 'Business Bootcamp - Batch 2', amount: 30, commission: 6 },
    { date: '2023-06-07', student: 'Ethan Miller', batch: 'Business Bootcamp - Batch 1', amount: 55, commission: 11 },
  ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const MentorEarnings = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [batchFilter, setBatchFilter] = useState('all');

  const filteredTransactions = batchFilter === 'all' 
    ? earningsData.dailyTransactions
    : earningsData.dailyTransactions.filter(t => t.batch.includes(batchFilter));

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
              <SelectItem value="Batch 1">Batch 1</SelectItem>
              <SelectItem value="Batch 2">Batch 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Earnings</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <DollarSign className="mr-2 h-6 w-6 text-success" />
              ${earningsData.totalEarnings}
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
              <DollarSign className="mr-2 h-6 w-6 text-warning" />
              ${earningsData.pendingEarnings}
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
              ${earningsData.lastMonth}
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
              ${earningsData.lastWeek}
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
                        <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
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
                        <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
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
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {earningsData.batches.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
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
                        name === 'earnings' ? `$${value}` : value,
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
                        ${batch.studentCount > 0 
                          ? (batch.earnings / batch.studentCount).toFixed(2) 
                          : '0.00'}
                      </TableCell>
                      <TableCell className="text-right font-medium">${batch.earnings}</TableCell>
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
                  {filteredTransactions.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell className="font-medium">{transaction.student}</TableCell>
                      <TableCell>{transaction.batch}</TableCell>
                      <TableCell>${transaction.amount}</TableCell>
                      <TableCell className="text-right text-success font-medium">
                        ${transaction.commission}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredTransactions.length === 0 && (
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
