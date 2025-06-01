import React, { useState, useEffect } from 'react';
import TaskCardUpdated from '@/components/student/TaskCardUpdated';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckSquare, Clock, AlertTriangle, Eye, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import axios from 'axios';

// Define the task type to ensure consistency
export type TaskStatus = 'pending' | 'submitted' | 'completed' | 'overdue' | 'resubmit';

interface TaskAttachment {
  id?: number;
  name: string;
  size: string | number;
  url: string;
  fileType?: string;
}

interface Task {
  id: string;
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  deadline: string;
  dueDate: string;
  submittedAt?: string;
  feedback?: string;
  rating?: number;
  points: number;
  batch: string;
  attachments?: TaskAttachment[];
  submission?: {
    _id: string;
    notes: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    status: string;
    feedback?: string;
    rating?: number;
    points?: number;
    submissionDate: string;
  };
}

// API URL from environment variable or default
const API_URL = import.meta.env.VITE_REACT_API_URL || 'http://localhost:5000';

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [googleDocsLink, setGoogleDocsLink] = useState('');
  const [studentStats, setStudentStats] = useState({
    taskCompletion: 0,
    attendance: 0,
    totalPointsEarned: 0,
    totalPointsPossible: 0
  });
  
  // Get student ID from local storage
  const studentId = typeof window !== 'undefined' ? localStorage.getItem('id') : null;
  
  // Fetch tasks and student data
  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch student's tasks
        const [studentResponse, tasksResponse, submissionsResponse] = await Promise.all([
          axios.get(`${API_URL}/api/students/${studentId}`),
          axios.get(`${API_URL}/api/tasks/student/${studentId}`),
          axios.get(`${API_URL}/api/taskSubmission/student/${studentId}`)
        ]);
        
        const student = studentResponse.data;
        let fetchedTasks = tasksResponse.data;
        const submissions = submissionsResponse.data;
        
        // Combine tasks with their submissions
        fetchedTasks = fetchedTasks.map(task => {
          const taskSubmission = submissions.find(sub => sub.task._id === task._id);
          
          // Format the task with the submission data if it exists
          return {
            id: parseInt(task._id, 10),
            _id: task._id,
            title: task.title,
            description: task.description,
            status: determineTaskStatus(task, taskSubmission),
            deadline: task.dueDate,
            dueDate: task.dueDate,
            batch: task.batch,
            points: taskSubmission?.points || 0,
            feedback: taskSubmission?.feedback,
            rating: taskSubmission?.rating,
            submittedAt: taskSubmission?.submissionDate,
            submission: taskSubmission ? {
              _id: taskSubmission._id,
              notes: taskSubmission.notes || '',
              fileUrl: taskSubmission.fileUrl,
              fileName: taskSubmission.fileName,
              fileSize: taskSubmission.fileSize,
              fileType: taskSubmission.fileType,
              status: taskSubmission.status,
              feedback: taskSubmission.feedback,
              rating: taskSubmission.rating,
              points: taskSubmission.points,
              submissionDate: taskSubmission.submissionDate
            } : undefined,
            attachments: taskSubmission?.fileUrl ? [
              {
                id: 1,
                name: taskSubmission.fileName || 'Unnamed file',
                size: formatFileSize(taskSubmission.fileSize),
                url: taskSubmission.fileUrl,
                fileType: taskSubmission.fileType
              }
            ] : undefined
          };
        });
        
        setTasks(fetchedTasks);

        // Set student stats
        setStudentStats({
          taskCompletion: student.taskCompletion || 0,
          attendance: student.attendance || 0,
          totalPointsEarned: submissions.reduce((total, sub) => total + (sub.points || 0), 0),
          totalPointsPossible: fetchedTasks.length * 100 // Assuming each task is worth 100 points max
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load tasks. Please try again.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [studentId]);
  
  // Determine task status based on task and submission data
  const determineTaskStatus = (task, submission) => {
    if (!submission) {
      // Check if task is overdue
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      if (today > dueDate) {
        return 'overdue';
      }
      return 'pending';
    }
    
    // If there's a submission, check its status
    switch (submission.status) {
      case 'approved':
        return 'completed';
      case 'resubmit':
        return 'resubmit';
      case 'submitted':
      case 'reviewed':
        return 'submitted';
      default:
        return task.status;
    }
  };
  
  // Format file size to human-readable format
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionFile(e.target.files[0]);
    }
  };
  
  const handleViewSubmission = (task: Task) => {
    setSelectedTask(task);
  };

  const handleSubmitTask = async (taskId: string, batchId: string) => {
    if (!submissionText && !submissionFile && !googleDocsLink) {
      toast({
        title: "Submission Error",
        description: "Please add a description, an attachment, or a Google Docs link to your submission.",
        variant: "destructive"
      });
      return;
    }

    if (!studentId) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit a task.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('studentId', studentId);
      formData.append('taskId', taskId);
      formData.append('batchId', batchId);
      formData.append('notes', submissionText);
      formData.append('googleDocsLink', googleDocsLink);
      
      if (submissionFile) {
        formData.append('file', submissionFile);
      }
      
      // Submit the task
      const response = await axios.post(`${API_URL}/api/taskSubmission/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 201) {
        // Update the local state to reflect the submission
        const updatedTasks = tasks.map(task => {
          if (task._id === taskId) {
            return {
              ...task,
              status: 'submitted' as TaskStatus,
              submittedAt: new Date().toISOString(),
              submission: {
                _id: response.data.submission._id,
                notes: submissionText,
                googleDocsLink: googleDocsLink,
                status: 'submitted',
                submissionDate: new Date().toISOString(),
                fileUrl: response.data.submission.fileUrl,
                fileName: response.data.submission.fileName,
                fileSize: response.data.submission.fileSize,
                fileType: response.data.submission.fileType
              },
              attachments: submissionFile ? [
                {
                  id: Date.now(),
                  name: submissionFile.name,
                  size: formatFileSize(submissionFile.size),
                  url: response.data.submission.fileUrl
                }
              ] : undefined
            };
          }
          return task;
        });
        
        setTasks(updatedTasks as Task[]);
        setSubmissionText('');
        setSubmissionFile(null);
        setGoogleDocsLink('');
        
        toast({
          title: "Task Submitted",
          description: "Your work has been submitted successfully!"
        });
        
        // Refetch tasks to get updated data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error submitting task:", error);
      const errorMessage = error.response?.data?.message || "An error occurred while submitting your task. Please try again.";
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  // Filter tasks by status
  const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'overdue');
  const submittedTasks = tasks.filter(task => task.status === 'submitted');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const resubmitTasks = tasks.filter(task => task.status === 'resubmit');
  
  const allTasks = [...pendingTasks, ...resubmitTasks, ...submittedTasks, ...completedTasks];
  
  const getStatusCounts = () => {
    return {
      pending: tasks.filter(task => task.status === 'pending').length,
      submitted: submittedTasks.length,
      completed: completedTasks.length,
      resubmit: resubmitTasks.length,
      overdue: tasks.filter(task => task.status === 'overdue').length
    };
  };
  
  const statusCounts = getStatusCounts();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading tasks...</div>;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex flex-wrap gap-2">
          {statusCounts.pending > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock size={12} /> {statusCounts.pending} pending
            </Badge>
          )}
          {statusCounts.overdue > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle size={12} /> {statusCounts.overdue} overdue
            </Badge>
          )}
          {statusCounts.resubmit > 0 && (
            <Badge variant="warning" className="flex items-center gap-1">
              <ArrowRight size={12} /> {statusCounts.resubmit} to resubmit
            </Badge>
          )}
        </div>
      </div>
      
      {/* Student Stats Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="pb-3">
          <CardTitle>My Progress</CardTitle>
          <CardDescription>Track your task completion and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Task Completion</span>
                <span className="font-medium">{studentStats.taskCompletion}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${studentStats.taskCompletion}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Attendance</span>
                <span className="font-medium">{studentStats.attendance}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500" 
                  style={{ width: `${studentStats.attendance}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Points Earned</span>
                <span className="font-medium">{studentStats.totalPointsEarned} / {studentStats.totalPointsPossible}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500" 
                  style={{ width: `${(studentStats.totalPointsEarned / studentStats.totalPointsPossible) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{completedTasks.length}</div>
                <div className="text-sm text-muted-foreground">Completed Tasks</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Task Management</CardTitle>
          <CardDescription>View and manage your assigned tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
              <TabsTrigger value="all">All ({allTasks.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({statusCounts.pending + statusCounts.overdue})</TabsTrigger>
              <TabsTrigger value="submitted" className="hidden md:block">Submitted ({statusCounts.submitted})</TabsTrigger>
              <TabsTrigger value="resubmit" className="hidden md:block">To Resubmit ({statusCounts.resubmit})</TabsTrigger>
              <TabsTrigger value="completed" className="hidden md:block">Completed ({statusCounts.completed})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {allTasks.length > 0 ? (
                allTasks.map(task => (
                  <TaskCardUpdated 
                    key={task._id} 
                    task={{
                      id: parseInt(task._id, 10),
                      title: task.title,
                      description: task.description,
                      status: task.status,
                      deadline: task.deadline || task.dueDate,
                      submittedAt: task.submittedAt,
                      feedback: task.feedback,
                      rating: task.rating,
                      points: task.points || 0,
                      attachments: task.attachments?.map((attachment, index) => ({
                        id: attachment.id ?? index + 1,
                        name: attachment.name,
                        size: attachment.size.toString(),
                        url: attachment.url
                      }))
                    }}
                    actions={
                      <div className="flex space-x-2 mt-2">
                        {['submitted', 'completed', 'resubmit'].includes(task.status) && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleViewSubmission(task)}
                          >
                            <Eye size={14} />
                            View Submission
                          </Button>
                        )}
                        
                        {['pending', 'overdue', 'resubmit'].includes(task.status) && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="gap-1">
                                <Upload size={14} />
                                {task.status === 'resubmit' ? 'Resubmit' : 'Submit'}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{task.status === 'resubmit' ? 'Resubmit' : 'Submit'} Task: {task.title}</DialogTitle>
                                <DialogDescription>{task.description}</DialogDescription>
                              </DialogHeader>
                              
                              {task.status === 'resubmit' && task.feedback && (
                                <div className="mb-4 p-3 bg-muted rounded-md text-sm">
                                  <p className="font-medium mb-1">Feedback from mentor:</p>
                                  {task.feedback}
                                </div>
                              )}
                              
                              <div className="space-y-4 my-4">
                                <div className="space-y-2">
                                  <Label htmlFor="submission">Submission Notes</Label>
                                  <Textarea 
                                    id="submission" 
                                    placeholder="Describe your work or add any notes for your mentor..."
                                    value={submissionText}
                                    onChange={(e) => setSubmissionText(e.target.value)}
                                    rows={5}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="googleDocsLink">Google Docs Link (Optional)</Label>
                                  <Input 
                                    id="googleDocsLink" 
                                    type="url"
                                    placeholder="https://docs.google.com/document/d/..."
                                    value={googleDocsLink}
                                    onChange={(e) => setGoogleDocsLink(e.target.value)}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    If you're having trouble uploading files, you can share your work via Google Docs
                                  </p>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="attachment">Upload Attachment</Label>
                                  <Input 
                                    id="attachment" 
                                    type="file"
                                    onChange={handleFileChange}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Supported formats: PDF, DOC, DOCX, JPG, PNG (max 10MB)
                                  </p>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={() => handleSubmitTask(task._id, task.batch)}>
                                  {task.status === 'resubmit' ? 'Resubmit' : 'Submit'} Task
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    }
                  />
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No tasks found.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              {pendingTasks.length > 0 ? (
                pendingTasks.map(task => (
                  <TaskCardUpdated 
                    key={task._id} 
                    task={{
                      id: parseInt(task._id, 10),
                      title: task.title,
                      description: task.description,
                      status: task.status,
                      deadline: task.deadline || task.dueDate,
                      points: task.points || 0
                    }}
                    actions={
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="gap-1 mt-2">
                            <Upload size={14} />
                            Submit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Submit Task: {task.title}</DialogTitle>
                            <DialogDescription>{task.description}</DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 my-4">
                            <div className="space-y-2">
                              <Label htmlFor={`submission-${task._id}`}>Submission Notes</Label>
                              <Textarea 
                                id={`submission-${task._id}`} 
                                placeholder="Describe your work or add any notes for your mentor..."
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e.target.value)}
                                rows={5}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`googleDocsLink-${task._id}`}>Google Docs Link (Optional)</Label>
                              <Input 
                                id={`googleDocsLink-${task._id}`} 
                                type="url"
                                placeholder="https://docs.google.com/document/d/..."
                                value={googleDocsLink}
                                onChange={(e) => setGoogleDocsLink(e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground">
                                If you're having trouble uploading files, you can share your work via Google Docs
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`attachment-${task._id}`}>Upload Attachment</Label>
                              <Input 
                                id={`attachment-${task._id}`} 
                                type="file"
                                onChange={handleFileChange}
                              />
                              <p className="text-xs text-muted-foreground">
                                Supported formats: PDF, DOC, DOCX, JPG, PNG (max 10MB)
                              </p>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={() => handleSubmitTask(task._id, task.batch)}>Submit Task</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    }
                  />
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No pending tasks.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="submitted" className="space-y-4">
              {submittedTasks.length > 0 ? (
                submittedTasks.map(task => (
                  <TaskCardUpdated 
                    key={task._id} 
                    task={{
                      id: parseInt(task._id, 10),
                      title: task.title,
                      description: task.description,
                      status: task.status,
                      deadline: task.deadline || task.dueDate,
                      submittedAt: task.submittedAt,
                      points: task.points || 0,
                      attachments: task.attachments?.map((attachment, index) => ({
                        id: attachment.id ?? index + 1,
                        name: attachment.name,
                        size: attachment.size.toString(),
                        url: attachment.url
                      }))
                    }}
                    actions={
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1 mt-2"
                        onClick={() => handleViewSubmission(task)}
                      >
                        <Eye size={14} />
                        View Submission
                      </Button>
                    }
                  />
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No submitted tasks.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="resubmit" className="space-y-4">
              {resubmitTasks.length > 0 ? (
                resubmitTasks.map(task => (
                  <TaskCardUpdated 
                    key={task._id} 
                    task={{
                      id: parseInt(task._id, 10),
                      title: task.title,
                      description: task.description,
                      status: task.status,
                      deadline: task.deadline || task.dueDate,
                      submittedAt: task.submittedAt,
                      feedback: task.feedback,
                      points: task.points || 0,
                      attachments: task.attachments?.map((attachment, index) => ({
                        id: attachment.id ?? index + 1,
                        name: attachment.name,
                        size: attachment.size.toString(),
                        url: attachment.url
                      }))
                    }}
                    actions={
                      <div className="flex space-x-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleViewSubmission(task)}
                        >
                          <Eye size={14} />
                          View Feedback
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="gap-1">
                              <Upload size={14} />
                              Resubmit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Resubmit Task: {task.title}</DialogTitle>
                              <DialogDescription>
                                Please address the feedback before resubmitting:
                                <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                                  {task.feedback}
                                </div>
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 my-4">
                              <div className="space-y-2">
                                <Label htmlFor={`resubmission-${task._id}`}>Submission Notes</Label>
                                <Textarea 
                                  id={`resubmission-${task._id}`} 
                                  placeholder="Describe the changes you've made based on the feedback..."
                                  value={submissionText}
                                  onChange={(e) => setSubmissionText(e.target.value)}
                                  rows={5}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`googleDocsLink-${task._id}`}>Google Docs Link (Optional)</Label>
                                <Input 
                                  id={`googleDocsLink-${task._id}`} 
                                  type="url"
                                  placeholder="https://docs.google.com/document/d/..."
                                  value={googleDocsLink}
                                  onChange={(e) => setGoogleDocsLink(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                  If you're having trouble uploading files, you can share your work via Google Docs
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`reattachment-${task._id}`}>Upload Attachment</Label>
                                <Input 
                                  id={`reattachment-${task._id}`} 
                                  type="file"
                                  onChange={handleFileChange}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Supported formats: PDF, DOC, DOCX, JPG, PNG (max 10MB)
                                </p>
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button onClick={() => handleSubmitTask(task._id, task.batch)}>Resubmit Task</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    }
                  />
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No tasks to resubmit.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {completedTasks.length > 0 ? (
                completedTasks.map(task => (
                  <TaskCardUpdated 
                    key={task._id} 
                    task={{
                      id: parseInt(task._id, 10),
                      title: task.title,
                      description: task.description,
                      status: task.status,
                      deadline: task.deadline || task.dueDate,
                      submittedAt: task.submittedAt,
                      feedback: task.feedback,
                      rating: task.rating,
                      points: task.points || 0,
                      attachments: task.attachments?.map((attachment, index) => ({
                        id: attachment.id ?? index + 1,
                        name: attachment.name,
                        size: attachment.size.toString(),
                        url: attachment.url
                      }))
                    }}
                    actions={
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1 mt-2"
                        onClick={() => handleViewSubmission(task)}
                      >
                        <Eye size={14} />
                        View Submission
                      </Button>
                    }
                  />
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No completed tasks.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Task Submission Dialog */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Task Submission: {selectedTask.title}</DialogTitle>
              <DialogDescription>
                Submitted on {selectedTask.submittedAt ? new Date(selectedTask.submittedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Not submitted yet'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-2">
              {selectedTask.feedback && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Mentor Feedback</h3>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {selectedTask.feedback}
                  </div>
                  
                  {selectedTask.rating && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>
                          {i < selectedTask.rating! ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Attachments</h3>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>File Name</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTask.attachments.map((attachment) => (
                          <TableRow key={attachment.id}>
                            <TableCell className="flex items-center gap-2">
                              <FileText size={16} className="text-muted-foreground" />
                              {attachment.name}
                            </TableCell>
                            <TableCell>{attachment.size}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => window.open(attachment.url, '_blank')}
                              >
                                Download
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              
              {selectedTask.points > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-primary/5 rounded-md">
                  <span className="text-sm font-medium">Points Earned</span>
                  <span className="text-lg font-bold">{selectedTask.points} pts</span>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTask(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Tasks;