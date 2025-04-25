
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
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
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Mail, 
  Phone, 
  DollarSign, 
  Award, 
  Check, 
  Clock, 
  Calendar, 
  Star, 
  ArrowLeft
} from 'lucide-react';
import UserAvatar from '@/components/ui-custom/UserAvatar';

// Mock student data
const studentData = {
  id: 1,
  name: 'Alex Johnson',
  email: 'alex@example.com',
  phone: '+1 234-567-8901',
  batch: 'Business Bootcamp - Batch 1',
  business: 'Eco Crafts',
  attendanceRate: 90, // Renamed from attendance to attendanceRate to avoid duplicate property
  tasksCompleted: 8,
  totalTasks: 10,
  points: 1250,
  earnings: 345,
  revenueHistory: [
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 45 },
    { month: 'Apr', revenue: 65 },
    { month: 'May', revenue: 95 },
    { month: 'Jun', revenue: 140 },
  ],
  tasks: [
    {
      id: 1,
      title: 'Business Plan Draft',
      description: 'Create a first draft of your business plan',
      deadline: '2023-05-15',
      status: 'completed',
      submittedAt: '2023-05-14',
      feedback: 'Great work! Your business plan is well-structured and shows a good understanding of your target market.',
      rating: 4
    },
    {
      id: 2,
      title: 'Market Analysis',
      description: 'Analyze your target market and competitors',
      deadline: '2023-05-30',
      status: 'completed',
      submittedAt: '2023-05-28',
      feedback: 'Thorough analysis with good insights. You could add more about competitive positioning.',
      rating: 5
    },
    {
      id: 3,
      title: 'Financial Projections',
      description: 'Create financial projections for your business',
      deadline: '2023-06-20',
      status: 'pending',
    },
  ],
  attendance: [
    { sessionId: 1, date: '2023-05-01', topic: 'Introduction to Business Planning', attended: true },
    { sessionId: 2, date: '2023-05-08', topic: 'Market Research Fundamentals', attended: true },
    { sessionId: 3, date: '2023-05-15', topic: 'Financial Planning Basics', attended: true },
    { sessionId: 4, date: '2023-05-22', topic: 'Marketing Strategies', attended: false },
    { sessionId: 5, date: '2023-05-29', topic: 'Sales Techniques', attended: true },
    { sessionId: 6, date: '2023-06-05', topic: 'Digital Presence', attended: true },
  ],
  sales: [
    { id: 1, date: '2023-03-15', amount: 45, customer: 'Family', recurring: false },
    { id: 2, date: '2023-04-02', amount: 65, customer: 'Friend', recurring: false },
    { id: 3, date: '2023-05-10', amount: 50, customer: 'Society', recurring: false },
    { id: 4, date: '2023-05-20', amount: 45, customer: 'Family', recurring: true },
    { id: 5, date: '2023-06-05', amount: 90, customer: 'Referral', recurring: false },
    { id: 6, date: '2023-06-12', amount: 50, customer: 'Friend', recurring: true },
  ]
};

const MentorStudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);

  const feedbackForm = useForm({
    defaultValues: {
      feedback: '',
      rating: 0,
    }
  });

  const handleFeedbackSubmit = (data: any) => {
    console.log('Submitting feedback for task', selectedTask, ':', data);
    setShowFeedbackDialog(false);
    feedbackForm.reset();
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={`text-sm ${index < rating ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Calculate attendance percentage
  const attendancePercentage = studentData.attendance.filter(session => session.attended).length / 
                               studentData.attendance.length * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Student Details</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex items-center gap-4">
              <UserAvatar name={studentData.name} size="lg" />
              <div>
                <h2 className="text-xl font-bold">{studentData.name}</h2>
                <p className="text-muted-foreground">{studentData.business}</p>
                <p className="text-sm text-muted-foreground mt-1">{studentData.batch}</p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:ml-auto">
              <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">Email</span>
                </div>
                <span className="font-medium">{studentData.email}</span>
              </div>
              
              <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="text-sm">Phone</span>
                </div>
                <span className="font-medium">{studentData.phone}</span>
              </div>
              
              <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center text-muted-foreground">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span className="text-sm">Total Earnings</span>
                </div>
                <span className="font-medium text-success">${studentData.earnings}</span>
              </div>
              
              <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center text-muted-foreground">
                  <Award className="h-4 w-4 mr-2" />
                  <span className="text-sm">Points</span>
                </div>
                <span className="font-medium">{studentData.points}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Task Completion</span>
                      <span className="text-sm text-muted-foreground">
                        {studentData.tasksCompleted}/{studentData.totalTasks}
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${(studentData.tasksCompleted / studentData.totalTasks) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Attendance</span>
                      <span className="text-sm text-muted-foreground">
                        {attendancePercentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className={`h-full ${attendancePercentage >= 90 ? 'bg-success' : attendancePercentage >= 75 ? 'bg-warning' : 'bg-destructive'}`}
                        style={{ width: `${attendancePercentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">Recent Activity</h3>
                    <div className="space-y-3">
                      {studentData.tasks.slice(0, 2).map(task => (
                        <div key={task.id} className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-full ${
                            task.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {task.status === 'completed' ? (
                              <Check className={`h-3.5 w-3.5 text-green-600`} />
                            ) : (
                              <Clock className={`h-3.5 w-3.5 text-blue-600`} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {task.status === 'completed' 
                                ? `Completed on ${task.submittedAt}` 
                                : `Due ${task.deadline}`}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {studentData.attendance.slice(0, 2).map(session => (
                        <div key={session.sessionId} className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-full ${
                            session.attended ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {session.attended ? (
                              <Check className={`h-3.5 w-3.5 text-green-600`} />
                            ) : (
                              <Clock className={`h-3.5 w-3.5 text-red-600`} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{session.topic}</p>
                            <p className="text-xs text-muted-foreground">
                              {session.attended 
                                ? `Attended on ${session.date}` 
                                : `Missed on ${session.date}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={studentData.revenueHistory}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Task History</CardTitle>
              <CardDescription>Overview of all assigned tasks and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentData.tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground">{task.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{task.deadline}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : task.status === 'pending' 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {task.status}
                        </span>
                      </TableCell>
                      <TableCell>{task.submittedAt || '-'}</TableCell>
                      <TableCell>
                        {task.rating ? renderRatingStars(task.rating) : '-'}
                      </TableCell>
                      <TableCell>
                        {task.status === 'pending' ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled
                          >
                            Pending
                          </Button>
                        ) : task.status === 'completed' && task.feedback ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTask(task.id);
                              feedbackForm.setValue('feedback', task.feedback || '');
                              feedbackForm.setValue('rating', task.rating || 0);
                              setShowFeedbackDialog(true);
                            }}
                          >
                            View Feedback
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedTask(task.id);
                              setShowFeedbackDialog(true);
                            }}
                          >
                            Give Feedback
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Record</CardTitle>
              <CardDescription>
                Overall attendance: {attendancePercentage.toFixed(0)}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={studentData.attendance.map((session, index) => ({
                        session: session.topic,
                        attended: session.attended ? 1 : 0,
                        index: index + 1
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="index" 
                        label={{ 
                          value: 'Session Number', 
                          position: 'insideBottom', 
                          offset: -10 
                        }}
                      />
                      <YAxis 
                        domain={[0, 1]} 
                        ticks={[0, 1]} 
                        tickFormatter={(value) => value === 1 ? 'Present' : 'Absent'}
                      />
                      <Tooltip 
                        formatter={(value, name) => [
                          value === 1 ? 'Present' : 'Absent', 
                          'Attendance'
                        ]}
                        labelFormatter={(label) => `Session ${label}`}
                      />
                      <Bar 
                        dataKey="attended" 
                        fill="#8884d8" 
                        name="Attendance" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Session Topic</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentData.attendance.map((session) => (
                      <TableRow key={session.sessionId}>
                        <TableCell>{session.date}</TableCell>
                        <TableCell>{session.topic}</TableCell>
                        <TableCell className="text-right">
                          {session.attended ? (
                            <span className="inline-flex items-center gap-1 text-success">
                              <Check className="h-4 w-4" />
                              Attended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-destructive">
                              <Clock className="h-4 w-4" />
                              Absent
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales History</CardTitle>
              <CardDescription>Total revenue: ${studentData.earnings}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={studentData.sales.map(sale => ({
                        id: sale.id,
                        date: sale.date,
                        amount: sale.amount
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45} 
                        textAnchor="end" 
                        height={60}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      <Bar 
                        dataKey="amount" 
                        fill="#8884d8" 
                        name="Sales Amount" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Customer Source</TableHead>
                      <TableHead className="text-right">Customer Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentData.sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.date}</TableCell>
                        <TableCell className="font-medium">${sale.amount}</TableCell>
                        <TableCell>{sale.customer}</TableCell>
                        <TableCell className="text-right">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            sale.recurring 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {sale.recurring ? 'Recurring' : 'New'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {feedbackForm.getValues().feedback 
                ? 'View Feedback' 
                : 'Provide Feedback'}
            </DialogTitle>
            <DialogDescription>
              {feedbackForm.getValues().feedback 
                ? 'Review the feedback provided for this submission.'
                : 'Rate and provide feedback for this student\'s task submission.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...feedbackForm}>
            <form onSubmit={feedbackForm.handleSubmit(handleFeedbackSubmit)} className="space-y-4">
              <FormField
                control={feedbackForm.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              star <= field.value 
                                ? 'text-yellow-500' 
                                : 'text-gray-300'
                            } hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50`}
                            onClick={() => field.onChange(star)}
                            disabled={!!feedbackForm.getValues().feedback}
                          >
                            <Star className="h-6 w-6 fill-current" />
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={feedbackForm.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide detailed feedback on this submission..."
                        className="min-h-[120px] resize-none"
                        {...field}
                        disabled={!!feedbackForm.getValues().feedback}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowFeedbackDialog(false)}
                >
                  Close
                </Button>
                {!feedbackForm.getValues().feedback && (
                  <Button type="submit">Submit Feedback</Button>
                )}
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentorStudentDetails;
