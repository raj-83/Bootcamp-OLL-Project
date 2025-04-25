
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertTriangle, FileText, RotateCcw } from 'lucide-react';
import TaskSubmission from './TaskSubmission';
import TaskView from './TaskView';
import { toast } from '@/hooks/use-toast';

export type TaskStatus = 'pending' | 'submitted' | 'completed' | 'overdue' | 'resubmit';

export interface TaskProps {
  task: {
    id: number;
    title: string;
    description: string;
    status: TaskStatus;
    deadline: string;
    submittedAt?: string;
    feedback?: string;
    rating?: number;
    points?: number;
    attachments?: { id: number; name: string; size: string; url: string; }[];
  };
  actions?: React.ReactNode;
}

const TaskCardUpdated: React.FC<TaskProps> = ({ task, actions }) => {
  const [taskStatus, setTaskStatus] = useState<TaskStatus>(task.status);
  const [submittedAt, setSubmittedAt] = useState<string | undefined>(task.submittedAt);
  const [feedback, setFeedback] = useState<string | undefined>(task.feedback);
  const [rating, setRating] = useState<number | undefined>(task.rating);
  
  const handleSubmissionComplete = () => {
    setTaskStatus('submitted');
    const submissionDate = new Date().toISOString();
    setSubmittedAt(submissionDate);
    
    toast({
      title: "Task Submitted",
      description: "Your task has been submitted successfully!",
    });
  };
  
  const handleResubmit = () => {
    setTaskStatus('pending');
    
    toast({
      title: "Task Ready for Resubmission",
      description: "You can now resubmit your task.",
    });
  };
  
  const getStatusIcon = () => {
    switch (taskStatus) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'submitted':
        return <FileText className="h-5 w-5 text-primary" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'resubmit':
        return <RotateCcw className="h-5 w-5 text-warning" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  const getStatusBadge = () => {
    switch (taskStatus) {
      case 'completed':
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Completed</Badge>;
      case 'submitted':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Submitted</Badge>;
      case 'overdue':
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">Overdue</Badge>;
      case 'resubmit':
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Needs Revision</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };
  
  const isDeadlinePassed = () => {
    const deadline = new Date(task.deadline);
    const today = new Date();
    return today > deadline;
  };
  
  const getDaysRemaining = () => {
    const deadline = new Date(task.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const isViewableStatus = (status: TaskStatus): status is 'submitted' | 'completed' | 'resubmit' => {
    return ['submitted', 'completed', 'resubmit'].includes(status);
  };
  
  return (
    <Card className={`
      border-l-4 
      ${taskStatus === 'completed' ? 'border-l-success' : 
        taskStatus === 'submitted' ? 'border-l-primary' : 
        taskStatus === 'overdue' ? 'border-l-destructive' : 
        taskStatus === 'resubmit' ? 'border-l-warning' : 
        'border-l-muted'}
    `}>
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <h3 className="font-medium">{task.title}</h3>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-sm">
              <span className="text-muted-foreground">Due: </span>
              <span className={isDeadlinePassed() && taskStatus === 'pending' ? 'text-destructive font-medium' : ''}>
                {new Date(task.deadline).toLocaleDateString()}
              </span>
            </div>
            
            {taskStatus === 'pending' && !isDeadlinePassed() && getDaysRemaining() <= 3 && (
              <div className="text-xs text-warning mt-1">
                {getDaysRemaining() === 0 ? 'Due today!' : `${getDaysRemaining()} days left`}
              </div>
            )}
            
            {taskStatus === 'completed' && rating && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs">Rating:</span>
                <span className="text-xs font-medium">{rating}/5</span>
                <span className="text-yellow-500">★</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-5 py-3 bg-muted/20 flex justify-end">
        {actions ? (
          actions
        ) : (
          <>
            {taskStatus === 'pending' || taskStatus === 'overdue' ? (
              <TaskSubmission 
                taskId={task.id}
                taskTitle={task.title}
                onSubmissionComplete={handleSubmissionComplete}
              />
            ) : isViewableStatus(taskStatus) ? (
              <TaskView
                taskId={task.id}
                taskTitle={task.title}
                taskStatus={taskStatus}
                submittedAt={submittedAt}
                feedback={feedback}
                rating={rating}
                onResubmit={handleResubmit}
              />
            ) : null}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default TaskCardUpdated;
