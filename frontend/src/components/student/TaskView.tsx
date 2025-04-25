
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FileIcon, CalendarIcon, Clock, CheckCircle, FileText, RotateCcw, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TaskViewProps {
  taskId: number;
  taskTitle: string;
  taskStatus: 'submitted' | 'completed' | 'resubmit';
  submittedAt?: string;
  feedback?: string;
  rating?: number;
  onResubmit: () => void;
}

const TaskView: React.FC<TaskViewProps> = ({ 
  taskId, 
  taskTitle, 
  taskStatus, 
  submittedAt, 
  feedback, 
  rating,
  onResubmit
}) => {
  const [open, setOpen] = useState(false);
  
  const getStatusIcon = () => {
    switch (taskStatus) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'submitted':
        return <FileText className="h-5 w-5 text-primary" />;
      case 'resubmit':
        return <RotateCcw className="h-5 w-5 text-warning" />;
      default:
        return null;
    }
  };
  
  const getStatusBadge = () => {
    switch (taskStatus) {
      case 'completed':
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Completed</Badge>;
      case 'submitted':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Submitted</Badge>;
      case 'resubmit':
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Needs Revision</Badge>;
      default:
        return null;
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not submitted';
    return new Date(dateString).toLocaleString();
  };
  
  const handleResubmitClick = () => {
    setOpen(false);
    onResubmit();
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">View Submission</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {taskTitle}
            {getStatusBadge()}
          </DialogTitle>
          <DialogDescription>
            Submission Details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Submitted at:</span>
            <span>{formatDate(submittedAt)}</span>
          </div>
          
          {taskStatus === 'completed' && rating && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground">Rating:</span>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}
                  />
                ))}
                <span className="ml-1 font-medium">{rating}/5</span>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Your Submission</Label>
            <div className="rounded-md border p-3 bg-muted/20">
              <p className="text-sm mb-2">
                I've completed the task as requested. Please find attached my work on eco-friendly packaging designs.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-background rounded border text-sm">
                  <FileIcon className="h-4 w-4 text-primary" />
                  <span className="flex-1 truncate">task_submission.pdf</span>
                  <Button variant="ghost" size="sm" className="h-7">View</Button>
                </div>
                <div className="flex items-center gap-2 p-2 bg-background rounded border text-sm">
                  <FileIcon className="h-4 w-4 text-primary" />
                  <span className="flex-1 truncate">design_mockups.jpg</span>
                  <Button variant="ghost" size="sm" className="h-7">View</Button>
                </div>
              </div>
            </div>
          </div>
          
          {feedback && (
            <div className="space-y-2">
              <Label>Feedback</Label>
              <div className="rounded-md border p-3 bg-muted/20">
                <p className="text-sm">{feedback}</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          {taskStatus === 'resubmit' ? (
            <Button onClick={handleResubmitClick}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Resubmit Task
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskView;
