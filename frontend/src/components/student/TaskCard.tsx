import React from 'react';
import { AlertCircle, CheckCircle, Clock, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isPast } from 'date-fns';

interface TaskCardProps {
  task: {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'submitted' | 'completed' | 'overdue' | 'resubmit';
    deadline: string;
    submittedAt?: string;
    feedback?: string;
    rating?: number;
  };
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const handleSubmit = () => {
    // In a real app, this would open a file upload dialog or form
    console.log("Submit task:", task.id);
  };

  const getStatusBadge = () => {
    switch (task.status) {
      case 'pending':
        return <Badge variant="outline" className="bg-muted">Pending</Badge>;
      case 'submitted':
        return <Badge className="bg-primary">Submitted</Badge>;
      case 'completed':
        return <Badge className="bg-success">Completed</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'resubmit':
        return <Badge variant="warning">Resubmit</Badge>;
      default:
        return null;
    }
  };

  const getDeadlineText = () => {
    const deadlineDate = new Date(task.deadline);
    const isOverdue = isPast(deadlineDate) && task.status === 'pending';
    
    return (
      <div className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
        {isOverdue ? <AlertCircle size={14} /> : <Clock size={14} />}
        <span>
          {isOverdue ? 'Overdue: ' : 'Due: '}
          {format(deadlineDate, 'MMM d, yyyy')}
        </span>
      </div>
    );
  };

  return (
    <Card className={`p-4 border-l-4 ${
      task.status === 'completed' ? 'border-l-success' : 
      task.status === 'overdue' ? 'border-l-destructive' :
      task.status === 'submitted' ? 'border-l-primary' :
      task.status === 'resubmit' ? 'border-l-warning' :
      'border-l-muted-foreground'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{task.title}</h3>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-muted-foreground">{task.description}</p>
          {getDeadlineText()}
          
          {task.status === 'completed' && task.feedback && (
            <div className="mt-2 p-3 bg-muted/50 rounded-md">
              <p className="text-sm font-medium">Feedback:</p>
              <p className="text-sm">{task.feedback}</p>
              {task.rating && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-sm font-medium">Rating:</span>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="text-sm">{task.rating}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {task.status === 'resubmit' && task.feedback && (
            <div className="mt-2 p-3 bg-warning/10 rounded-md">
              <p className="text-sm font-medium">Feedback:</p>
              <p className="text-sm">{task.feedback}</p>
            </div>
          )}
          
          {task.status === 'submitted' && task.submittedAt && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <CheckCircle size={12} className="text-primary" />
              <span>Submitted on {format(new Date(task.submittedAt), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
        
        {(task.status === 'pending' || task.status === 'overdue' || task.status === 'resubmit') && (
          <Button onClick={handleSubmit} size="sm" className="whitespace-nowrap">
            <Upload size={16} className="mr-1" />
            {task.status === 'resubmit' ? 'Resubmit' : 'Upload'} Task
          </Button>
        )}
      </div>
    </Card>
  );
};

export default TaskCard;
