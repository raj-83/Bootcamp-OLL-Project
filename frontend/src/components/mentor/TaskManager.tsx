
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Plus, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const mockTasks = [
  {
    id: 1,
    title: 'Create a Business Plan',
    description: 'Develop a comprehensive business plan including market analysis, financial projections, and operational strategy.',
    dueDate: '2023-11-15',
    status: 'completed',
    submissionCount: 25,
    totalStudents: 25,
  },
  {
    id: 2,
    title: 'Market Research Report',
    description: 'Conduct market research and prepare a detailed report on target audience, competitors, and market trends.',
    dueDate: '2023-11-22',
    status: 'active',
    submissionCount: 18,
    totalStudents: 25,
  },
  {
    id: 3,
    title: 'Financial Projections',
    description: 'Create financial projections for your business including startup costs, operational expenses, and revenue forecasts.',
    dueDate: '2023-11-30',
    status: 'upcoming',
    submissionCount: 0,
    totalStudents: 25,
  }
];

const TaskManager = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'upcoming'
  });
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setNewTask(prev => ({ ...prev, status: value }));
  };

  const handleAddTask = () => {
    // Validate form
    if (!newTask.title || !newTask.description || !newTask.dueDate) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    // Add new task
    const newTaskObj = {
      id: tasks.length + 1,
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      status: newTask.status as 'upcoming' | 'active' | 'completed',
      submissionCount: 0,
      totalStudents: 25
    };

    setTasks([...tasks, newTaskObj]);
    
    // Reset form and close dialog
    setNewTask({
      title: '',
      description: '',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'upcoming'
    });
    
    setIsAddTaskOpen(false);
    
    toast({
      title: "Task added",
      description: "New task has been created successfully"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-success" />;
      case 'active':
        return <Clock size={16} className="text-primary" />;
      case 'upcoming':
        return <AlertCircle size={16} className="text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task for students in this batch
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input
                  id="title"
                  name="title"
                  className="col-span-3"
                  value={newTask.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  className="col-span-3"
                  rows={4}
                  value={newTask.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="dueDate" className="text-right">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  className="col-span-3"
                  value={newTask.dueDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select 
                  value={newTask.status} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTask}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <CardTitle className="text-base">{task.title}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileText size={14} className="mr-1" />
                    View Submissions
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-1">
                  <CalendarIcon size={14} className="text-muted-foreground" />
                  <span>Due: {format(new Date(task.dueDate), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle size={14} className="text-muted-foreground" />
                  <span>Submissions: {task.submissionCount}/{task.totalStudents}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;
