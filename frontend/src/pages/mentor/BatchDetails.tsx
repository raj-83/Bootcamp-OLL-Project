import React, { useState, useEffect } from 'react';
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
import { getTasksByBatchId, createTask, updateTask, deleteTask } from '@/services/taskService.js'; // Adjust the import path as necessary
import axios from 'axios';

// Initial task data - later we'll replace with API
const initialTasks = [
  { id: 1, title: 'Create School Plan', dueDate: '2023-10-15', status: 'completed', description: 'Develop a comprehensive school plan outlining your product/service, target market, and competitive advantage.' },
  { id: 2, title: 'Market Research', dueDate: '2023-10-30', status: 'in-progress', description: 'Conduct market research to identify your target audience and understand their needs and preferences.' },
  { id: 3, title: 'Financial Projections', dueDate: '2023-11-15', status: 'not-started', description: 'Create financial projections for your school, including revenue forecasts, expenses, and break-even analysis.' }
];

const BatchDetails = () => {
  const { batchId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batchData, setBatchData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [teacherName, setTeacherName] = useState('');
  const [studentNames, setStudentNames] = useState({}); 
  const [tasks, setTasks] = useState([]);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: '',
    description: '',
    batch: batchId,
  });
  const [activeSubmissionTab, setActiveSubmissionTab] = useState('tasks');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  
  // Mock data for submissions - replace with API later
  const mockSubmissions = [
    { id: 1, studentName: 'Alex Johnson', taskTitle: 'Create School Plan', submittedAt: '2023-10-14T09:30:00', status: 'pending_review' },
    { id: 2, studentName: 'Morgan Smith', taskTitle: 'Market Research', submittedAt: '2023-10-08T14:15:00', status: 'approved' },
    { id: 3, studentName: 'Jamie Lee', taskTitle: 'Create School Plan', submittedAt: '2023-10-13T11:45:00', status: 'needs_revision' },
  ];

  // Calculate revenue breakdown based on batch data
  const calculateRevenueBreakdown = (batchRevenue) => {
    const total = batchRevenue || 0;
    const studentEarnings = total * 0.5; // 50% to students
    const teacherEarnings = total * 0.2; // 20% to teacher
    const ollShare = total * 0.3; // 30% to OLL
    
    return {
      total,
      studentEarnings,
      teacherEarnings,
      ollShare
    };
  };
  
  // Format date string from DB to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd');
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.dueDate) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and due date for the task.",
        variant: "destructive"
      });
      return;
    }
    setShowAddTaskDialog(false);
    createTask(newTask)
    toast({
      title: "Task added",
      description: "New task has been successfully added to the batch."
    });
  };

  // Format time from DB format
  const formatSessionTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  // Get session status based on date
  const getSessionStatus = (sessionDate) => {
    const today = new Date();
    const sessionDay = new Date(sessionDate);
    return today > sessionDay ? 'completed' : 'upcoming';
  };

  // Fetch batch data
  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/batches/${batchId}`);
        const batch = response.data;
  
        // 1️⃣ teacher as before
        if (batch.teacher) {
          const { data: t } = await axios.get(`http://localhost:5000/api/teachers/${batch.teacher}`);
          setTeacherName(t.name);
        }
  
        // 2️⃣ now pull student names
        if (batch.students && batch.students.length > 0) {
          // build up a map { id: name }
          const namesMap = {};
          await Promise.all(
            batch.students.map(async (studId) => {
              try {
                const { data: s } = await axios.get(`http://localhost:5000/api/students/${studId}`);
                namesMap[studId] = s.name;
              } catch {
                namesMap[studId] = 'Unknown';
              }
            })
          );
          setStudentNames(namesMap);
        }
  
        setBatchData(batch);
      } catch (err) {
        console.error('Error fetching batch data:', err);
        setError('Failed to load batch data');
        toast({
          title: 'Error',
          description: 'Failed to load batch data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
  
    const fetchSessions = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/sessions/batch/${batchId}`);
        setSessions(response.data);
      } catch (err) {
        console.error('Error fetching sessions:', err);
      }
    };
  
    if (batchId) {
      fetchBatchData();
      fetchSessions();
    }
  }, [batchId]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const taskData = await getTasksByBatchId(batchId);
      setTasks(taskData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      fetchTasks();
    }
  }, [batchId]);

  const openEditDialog = (task) => {
    setCurrentTask(task);
    setShowEditTaskDialog(true);
  };

  // Format date to display
  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'yyyy-MM-dd');
  };

  // Format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Get appropriate status badge styling
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed':
        return { variant: 'default', className: 'bg-green-500 hover:bg-green-600' };
      case 'in-progress':
        return { variant: 'outline', className: '' };
      default:
        return { variant: 'secondary', className: '' };
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }
  
  const handleViewSubmission = (submissionId) => {
    setSelectedSubmissionId(submissionId);
    setActiveSubmissionTab('submissions');
  };

  // For loading state
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading batch details...</div>;
  }

  // For error state
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // If no batch data is found
  if (!batchData) {
    return <div>No batch data found</div>;
  }

  const revenueData = calculateRevenueBreakdown(batchData.revenue);
  
  // Calculate batch progress (kept as is for now)
  const batchProgress = 65; // Mock progress value

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{batchData.batchName}</h1>
        <p className="text-muted-foreground">{batchData.sessionTopic || 'No description available'}</p>
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
                <div>{formatDate(batchData.startDate)}</div>
                <div className="text-sm text-muted-foreground">to {formatDate(batchData.endDate)}</div>
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
                <div className="text-base">{batchData.scheduleDays ? batchData.scheduleDays.join(', ') : 'N/A'}</div>
                <div className="text-sm text-muted-foreground">{batchData.sessionTime || 'N/A'}</div>
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
              {batchData.students ? batchData.students.length : 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Batch Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batchProgress}%</div>
            <div className="w-full h-2 bg-muted rounded-full mt-2">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${batchProgress}%` }}
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
                  {revenueData.studentEarnings}
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
                  {revenueData.teacherEarnings}
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
                  {revenueData.ollShare}
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
              <span>Total Revenue: ${revenueData.total}</span>
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
                      <p className="font-medium">{teacherName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">
                        {formatDate(batchData.startDate)} to {formatDate(batchData.endDate)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Schedule</p>
                      <p className="font-medium">
                        {batchData.scheduleDays ? batchData.scheduleDays.join(', ') : 'Not set'} at {batchData.sessionTime || 'Not set'}
                      </p>
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
                      <span className="text-sm font-medium">{batchProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${batchProgress}%` }}
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
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle>Students in Batch</CardTitle>
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
              {batchData?.students?.length ? (
                batchData.students.map(student => (
                  <TableRow key={student}>
                    {/* lookup via studentNames map */}
                    <TableCell className="font-medium">
                      {studentNames[student] || 'Loading...'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-24">
                          <div className="h-2 w-full bg-muted rounded-full">
                            <div
                              className={`h-full rounded-full ${
                                (student.attendance || 0) >= 90
                                  ? 'bg-green-500'
                                  : (student.attendance || 0) >= 75
                                  ? 'bg-amber-500'
                                  : 'bg-destructive'
                              }`}
                              style={{ width: `${student.attendance || 0}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs">{student.attendance || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-24">
                          <div className="h-2 w-full bg-muted rounded-full">
                            <div
                              className={`h-full rounded-full ${
                                (student.taskCompletion || 0) >= 90
                                  ? 'bg-green-500'
                                  : (student.taskCompletion || 0) >= 75
                                  ? 'bg-amber-500'
                                  : 'bg-destructive'
                              }`}
                              style={{ width: `${student.taskCompletion || 0}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs">{student.taskCompletion || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                        ${student.earning || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          student.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {student.status || 'Active'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No students in this batch
                  </TableCell>
                </TableRow>
              )}
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
          
          <Tabs value={activeSubmissionTab} onValueChange={(value) => setActiveSubmissionTab(value)}>
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
                              <p className="text-sm text-muted-foreground">Due: {formatDate(task.dueDate)}</p>
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
                          <Button onClick={openEditDialog} variant="outline" size="sm">Edit</Button>
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

          <Dialog open={showEditTaskDialog} onOpenChange={setShowEditTaskDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>
                  Edit task for students in this batch.
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
                  Edit Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
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
        
        {/* <TabsContent value="sessions" className="mt-6">
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
        </TabsContent> */}
      </Tabs>
    </div>
  );
};

export default BatchDetails;
