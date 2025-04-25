import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import TaskManager from '@/components/mentor/TaskManager';
import TaskSubmissionViewer from '@/components/mentor/TaskSubmissionViewer';
import { Calendar, Clock, DollarSign, Users, School, Check, Plus, File, Calendar as CalendarIcon, Video } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const mockBatchData = {
  id: 1,
  name: 'School Entrepreneurship - Batch 1',
  description: 'Comprehensive program for aspiring entrepreneurs covering school planning, marketing, and operations.',
  startDate: '2023-09-01',
  endDate: '2023-12-15',
  students: 25,
  progress: 65,
  teacher: 'Jamie Smith',
  daysPerWeek: ['Monday', 'Wednesday', 'Friday'],
  time: '3:00 PM - 5:00 PM',
  totalRevenue: 3400,
  teacherEarnings: 680, // 20% of total
  ollShare: 1020, // 30% of total
  studentEarnings: 1700, // 50% of total
  studentsList: [
    { id: 1, name: 'Alex Johnson', attendance: 90, taskCompletion: 85, earnings: 345 },
    { id: 2, name: 'Morgan Smith', attendance: 75, taskCompletion: 80, earnings: 290 },
    { id: 3, name: 'Jamie Lee', attendance: 95, taskCompletion: 95, earnings: 420 },
    { id: 4, name: 'Taylor Swift', attendance: 85, taskCompletion: 70, earnings: 210 },
    { id: 5, name: 'Miguel Santos', attendance: 80, taskCompletion: 75, earnings: 190 }
  ]
};

const initialTasks = [
  { id: 1, title: 'Create School Plan', dueDate: '2023-10-15', status: 'completed', description: 'Develop a comprehensive school plan outlining your product/service, target market, and competitive advantage.' },
  { id: 2, title: 'Market Research', dueDate: '2023-10-30', status: 'in-progress', description: 'Conduct market research to identify your target audience and understand their needs and preferences.' },
  { id: 3, title: 'Financial Projections', dueDate: '2023-11-15', status: 'not-started', description: 'Create financial projections for your school, including revenue forecasts, expenses, and break-even analysis.' }
];

const mockSessions = [
  { 
    id: 1, 
    title: "Business Idea Brainstorming", 
    date: "2023-09-05",
    time: "3:00 PM - 5:00 PM",
    status: "completed", 
    attendanceRate: 92,
    notes: "Students developed initial business concepts through guided ideation exercises."
  },
  { 
    id: 2, 
    title: "Marketing Fundamentals", 
    date: "2023-09-12",
    time: "3:00 PM - 5:00 PM",
    status: "completed", 
    attendanceRate: 88,
    notes: "Covered target market identification, value proposition, and basic marketing channels."
  },
  { 
    id: 3, 
    title: "Financial Planning", 
    date: "2023-09-19",
    time: "3:00 PM - 5:00 PM",
    status: "completed", 
    attendanceRate: 96,
    notes: "Reviewed pricing strategies, cost structures, and profit margin calculation."
  },
  { 
    id: 4, 
    title: "Product Development", 
    date: "2023-09-26",
    time: "3:00 PM - 5:00 PM",
    status: "upcoming",
    notes: "Will cover prototyping, minimum viable product, and iteration techniques."
  },
  { 
    id: 5, 
    title: "Sales Techniques", 
    date: "2023-10-03",
    time: "3:00 PM - 5:00 PM",
    status: "upcoming",
    notes: "Will focus on persuasion, objection handling, and closing techniques."
  }
];

const BatchDetails = () => {
  const { batchId } = useParams();
  const [tasks, setTasks] = useState(initialTasks);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: '',
    description: ''
  });
  const [activeSubmissionTab, setActiveSubmissionTab] = useState<'tasks' | 'submissions'>('tasks');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
  
  const mockSubmissions = [
    { id: 1, studentName: 'Alex Johnson', taskTitle: 'Create School Plan', submittedAt: '2023-10-14T09:30:00', status: 'pending_review' },
    { id: 2, studentName: 'Morgan Smith', taskTitle: 'Market Research', submittedAt: '2023-10-08T14:15:00', status: 'approved' },
    { id: 3, studentName: 'Jamie Lee', taskTitle: 'Create School Plan', submittedAt: '2023-10-13T11:45:00', status: 'needs_revision' },
  ];
  
  const handleAddTask = () => {
    if (!newTask.title || !newTask.dueDate) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and due date for the task.",
        variant: "destructive"
      });
      return;
    }
    
    const task = {
      id: tasks.length + 1,
      title: newTask.title,
      dueDate: newTask.dueDate,
      status: 'not-started',
      description: newTask.description
    };
    
    setTasks([...tasks, task]);
    setNewTask({ title: '', dueDate: '', description: '' });
    setShowAddTaskDialog(false);
    
    toast({
      title: "Task added",
      description: "New task has been successfully added to the batch."
    });
  };
  
  const handleViewSubmission = (submissionId: number) => {
    setSelectedSubmissionId(submissionId);
    setActiveSubmissionTab('submissions');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{mockBatchData.name}</h1>
        <p className="text-muted-foreground">{mockBatchData.description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              <div>
                <div>{mockBatchData.startDate}</div>
                <div className="text-sm text-muted-foreground">to {mockBatchData.endDate}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              <div>
                <div className="text-base">{mockBatchData.daysPerWeek.join(', ')}</div>
                <div className="text-sm text-muted-foreground">{mockBatchData.time}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              {mockBatchData.students}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Batch Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockBatchData.progress}%</div>
            <div className="w-full h-2 bg-muted rounded-full mt-2">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${mockBatchData.progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>Distribution of earnings from this batch</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Student Earnings (50%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 flex items-center">
                  <DollarSign className="h-5 w-5 mr-1" />
                  {mockBatchData.studentEarnings}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Teacher Earnings (20%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 flex items-center">
                  <DollarSign className="h-5 w-5 mr-1" />
                  {mockBatchData.teacherEarnings}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">OLL Share (30%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 flex items-center">
                  <DollarSign className="h-5 w-5 mr-1" />
                  {mockBatchData.ollShare}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <div className="w-full h-4 bg-muted rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-green-500" 
                style={{ width: '50%' }}
              />
              <div 
                className="h-full bg-blue-500" 
                style={{ width: '20%' }}
              />
              <div 
                className="h-full bg-purple-500" 
                style={{ width: '30%' }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Total Revenue: ${mockBatchData.totalRevenue}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Batch Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <School className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teacher</p>
                      <p className="font-medium">{mockBatchData.teacher}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{mockBatchData.startDate} to {mockBatchData.endDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Schedule</p>
                      <p className="font-medium">{mockBatchData.daysPerWeek.join(', ')} at {mockBatchData.time}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Batch Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Overall Progress</span>
                      <span className="text-sm font-medium">{mockBatchData.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${mockBatchData.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Task Completion</span>
                      <span className="text-sm font-medium">70%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: '70%' }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Attendance</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: '85%' }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Sales Achievement</span>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: '60%' }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Students in Batch</CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Task Completion</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBatchData.studentsList.map(student => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full max-w-24">
                            <div className="h-2 w-full bg-muted rounded-full">
                              <div 
                                className={`h-full bg-muted rounded-full ${
                                  student.attendance >= 90 ? 'bg-green-500' : 
                                  student.attendance >= 75 ? 'bg-amber-500' : 
                                  'bg-destructive'
                                }`}
                                style={{ width: `${student.attendance}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs">{student.attendance}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full max-w-24">
                            <div className="h-2 w-full bg-muted rounded-full">
                              <div 
                                className={`h-full bg-muted rounded-full ${
                                  student.taskCompletion >= 90 ? 'bg-green-500' : 
                                  student.taskCompletion >= 75 ? 'bg-amber-500' : 
                                  'bg-destructive'
                                }`}
                                style={{ width: `${student.taskCompletion}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs">{student.taskCompletion}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                          ${student.earnings}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Batch Tasks</h3>
            <Button onClick={() => setShowAddTaskDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          
          <Tabs value={activeSubmissionTab} onValueChange={(value) => setActiveSubmissionTab(value as 'tasks' | 'submissions')}>
            <TabsList className="mb-4">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tasks">
              <div className="space-y-4">
                {tasks.map(task => (
                  <Card key={task.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              task.status === 'completed' ? 'bg-green-100 text-green-700' :
                              task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {task.status === 'completed' ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <File className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-sm text-muted-foreground">Due: {task.dueDate}</p>
                            </div>
                          </div>
                          <p className="text-sm mt-3">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            task.status === 'completed' ? 'default' :
                            task.status === 'in-progress' ? 'outline' :
                            'secondary'
                          } className={
                            task.status === 'completed' ? 'bg-green-500 hover:bg-green-600' : ''
                          }>
                            {task.status === 'completed' ? 'Completed' : 
                             task.status === 'in-progress' ? 'In Progress' : 
                             'Not Started'}
                          </Badge>
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm" onClick={() => setActiveSubmissionTab('submissions')}>
                            View Submissions
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="submissions">
              {selectedSubmissionId ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedSubmissionId(null);
                        setActiveSubmissionTab('tasks');
                      }}
                    >
                      Back to Tasks
                    </Button>
                  </div>
                  <TaskSubmissionViewer submissionId={selectedSubmissionId} />
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Task Submissions</CardTitle>
                    <CardDescription>
                      Review and grade student task submissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Task</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockSubmissions.map(submission => (
                          <TableRow key={submission.id}>
                            <TableCell className="font-medium">{submission.studentName}</TableCell>
                            <TableCell>{submission.taskTitle}</TableCell>
                            <TableCell>
                              {new Date(submission.submittedAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                submission.status === 'approved' ? 'default' :
                                submission.status === 'needs_revision' ? 'outline' :
                                'secondary'
                              } className={
                                submission.status === 'approved' ? 'bg-green-500 hover:bg-green-600' : 
                                submission.status === 'needs_revision' ? 'bg-amber-500 hover:bg-amber-600' : ''
                              }>
                                {submission.status === 'approved' ? 'Approved' : 
                                 submission.status === 'needs_revision' ? 'Needs Revision' : 
                                 'Pending Review'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                onClick={() => handleViewSubmission(submission.id)}
                              >
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
          
          <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a new task for students in this batch.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Enter task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input 
                    id="dueDate" 
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Enter task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddTaskDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask}>
                  Add Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="sessions" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Batch Sessions</CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Session
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSessions.map(session => (
                  <Card key={session.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              session.status === 'completed' ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              <Video className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-medium">{session.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {session.date} • {session.time}
                              </p>
                            </div>
                          </div>
                          
                          {session.notes && (
                            <p className="text-sm mt-3 text-muted-foreground">{session.notes}</p>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Badge variant={
                            session.status === 'completed' ? 'default' : 'outline'
                          } className={
                            session.status === 'completed' ? 'bg-green-500 hover:bg-green-600' : ''
                          }>
                            {session.status === 'completed' ? 'Completed' : 'Upcoming'}
                          </Badge>
                          
                          {session.status === 'completed' && session.attendanceRate && (
                            <div className="text-xs text-muted-foreground">
                              Attendance: {session.attendanceRate}%
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-2">
                            {session.status === 'completed' ? (
                              <Button size="sm" variant="outline">View Details</Button>
                            ) : (
                              <Button size="sm">Start Session</Button>
                            )}
                          </div>
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

export default BatchDetails;
