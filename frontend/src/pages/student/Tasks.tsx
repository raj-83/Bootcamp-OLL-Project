
import React, { useState } from 'react';
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

// Define the task type to ensure consistency
type TaskStatus = 'pending' | 'submitted' | 'completed' | 'overdue' | 'resubmit';

interface TaskAttachment {
  id: number;
  name: string;
  size: string;
  url: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  deadline: string;
  submittedAt?: string;
  feedback?: string;
  rating?: number;
  points: number;
  attachments?: TaskAttachment[];
}

// Mock data for student tasks
const studentTasks: Task[] = [
  {
    id: 1, 
    title: 'Create a Business Plan', 
    description: 'Draft a comprehensive business plan for your product idea.', 
    status: 'completed', 
    deadline: '2023-09-30',
    submittedAt: '2023-09-28',
    feedback: 'Excellent work! Your business plan is well-structured and shows great potential.', 
    rating: 5,
    points: 100,
    attachments: [
      { id: 1, name: 'business_plan.pdf', size: '2.4 MB', url: '#' },
      { id: 2, name: 'financial_projections.xlsx', size: '1.1 MB', url: '#' }
    ]
  },
  {
    id: 2, 
    title: 'Design Product Packaging', 
    description: 'Create eco-friendly packaging designs for your product.', 
    status: 'resubmit', 
    deadline: '2023-10-10',
    submittedAt: '2023-10-08',
    feedback: 'Good start, but please consider making the design more sustainable. Review materials section.',
    points: 75,
    attachments: [
      { id: 3, name: 'packaging_design_v1.png', size: '3.2 MB', url: '#' }
    ] 
  },
  {
    id: 3, 
    title: 'Marketing Strategy', 
    description: 'Develop a marketing strategy to promote your product.', 
    status: 'submitted', 
    deadline: '2023-10-15',
    submittedAt: '2023-10-14',
    points: 0,
    attachments: [
      { id: 4, name: 'marketing_strategy.pdf', size: '1.8 MB', url: '#' },
      { id: 5, name: 'social_media_plan.docx', size: '834 KB', url: '#' }
    ]
  },
  {
    id: 4, 
    title: 'Financial Projection', 
    description: 'Create a financial projection for your business for the next 6 months.', 
    status: 'pending', 
    deadline: '2023-10-25',
    points: 0
  },
  {
    id: 5, 
    title: 'Sales Pitch', 
    description: 'Prepare a 5-minute sales pitch for your product.', 
    status: 'pending', 
    deadline: '2023-11-05',
    points: 0
  },
  {
    id: 6, 
    title: 'Customer Feedback Analysis', 
    description: 'Collect and analyze feedback from at least 10 potential customers.', 
    status: 'overdue', 
    deadline: '2023-10-05',
    points: 0
  },
];

// Student profile stats
const studentStats = {
  taskCompletion: 65,
  attendance: 90,
  totalPointsEarned: 175,
  totalPointsPossible: 300
};

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>(studentTasks);
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  
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

  const handleViewSubmission = (task: Task) => {
    setSelectedTask(task);
  };

  const handleSubmitTask = (taskId: number) => {
    if (!submissionText && !attachmentName) {
      toast({
        title: "Submission Error",
        description: "Please add a description or an attachment to your submission.",
        variant: "destructive"
      });
      return;
    }

    // Find the task and update its status
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const newTask: Task = {
          ...task,
          status: 'submitted',
          submittedAt: new Date().toISOString().split('T')[0],
        };
        
        // Add attachment if provided
        if (attachmentName) {
          newTask.attachments = [
            ...(task.attachments || []),
            { 
              id: Math.floor(Math.random() * 10000), 
              name: attachmentName, 
              size: '1.2 MB', 
              url: '#' 
            }
          ];
        }
        
        return newTask;
      }
      return task;
    });

    setTasks(updatedTasks);
    setSubmissionText('');
    setAttachmentName('');
    
    toast({
      title: "Task Submitted",
      description: "Your work has been submitted successfully!"
    });
  };
  
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
                    key={task.id} 
                    task={task} 
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
                                  <Label htmlFor="attachment">Upload Attachment</Label>
                                  <div className="flex gap-2">
                                    <Input 
                                      id="attachment" 
                                      placeholder="filename.pdf"
                                      value={attachmentName}
                                      onChange={(e) => setAttachmentName(e.target.value)}
                                    />
                                    <Button variant="outline" type="button">Browse</Button>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Supported formats: PDF, DOC, DOCX, JPG, PNG (max 10MB)
                                  </p>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={() => handleSubmitTask(task.id)}>Submit Task</Button>
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
                    key={task.id} 
                    task={task} 
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
                              <Label htmlFor={`submission-${task.id}`}>Submission Notes</Label>
                              <Textarea 
                                id={`submission-${task.id}`} 
                                placeholder="Describe your work or add any notes for your mentor..."
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e.target.value)}
                                rows={5}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`attachment-${task.id}`}>Upload Attachment</Label>
                              <div className="flex gap-2">
                                <Input 
                                  id={`attachment-${task.id}`} 
                                  placeholder="filename.pdf"
                                  value={attachmentName}
                                  onChange={(e) => setAttachmentName(e.target.value)}
                                />
                                <Button variant="outline" type="button">Browse</Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Supported formats: PDF, DOC, DOCX, JPG, PNG (max 10MB)
                              </p>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={() => handleSubmitTask(task.id)}>Submit Task</Button>
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
                    key={task.id} 
                    task={task} 
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
                    key={task.id} 
                    task={task} 
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
                                <Label htmlFor={`resubmission-${task.id}`}>Submission Notes</Label>
                                <Textarea 
                                  id={`resubmission-${task.id}`} 
                                  placeholder="Describe the changes you've made based on the feedback..."
                                  value={submissionText}
                                  onChange={(e) => setSubmissionText(e.target.value)}
                                  rows={5}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`reattachment-${task.id}`}>Upload Attachment</Label>
                                <div className="flex gap-2">
                                  <Input 
                                    id={`reattachment-${task.id}`} 
                                    placeholder="filename.pdf"
                                    value={attachmentName}
                                    onChange={(e) => setAttachmentName(e.target.value)}
                                  />
                                  <Button variant="outline" type="button">Browse</Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Supported formats: PDF, DOC, DOCX, JPG, PNG (max 10MB)
                                </p>
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button onClick={() => handleSubmitTask(task.id)}>Resubmit Task</Button>
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
                    key={task.id} 
                    task={task} 
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
                              <Button variant="ghost" size="sm" asChild>
                                <a href={attachment.url} download>Download</a>
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
