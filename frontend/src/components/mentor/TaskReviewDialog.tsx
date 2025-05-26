import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { format } from 'date-fns';
import { FileText, Download } from 'lucide-react';

const API_URL = import.meta.env.VITE_REACT_API_URL || 'http://localhost:5000';

interface TaskSubmission {
  _id: string;
  student: {
    _id: string;
    name: string;
  };
  task: {
    _id: string;
    title: string;
    description: string;
    dueDate: string;
  };
  batch: {
    _id: string;
    batchName: string;
  };
  status: string;
  submissionDate: string;
  notes: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  feedback?: string;
  rating?: number;
  points?: number;
}

interface TaskReviewDialogProps {
  submission: TaskSubmission;
  onClose: () => void;
  onUpdate: () => void;
}

const TaskReviewDialog: React.FC<TaskReviewDialogProps> = ({
  submission,
  onClose,
  onUpdate,
}) => {
  const [feedback, setFeedback] = useState({
    status: submission.status,
    feedback: submission.feedback || '',
    rating: submission.rating || 0,
    points: submission.points || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await axios.put(`${API_URL}/api/taskSubmission/${submission._id}`, feedback);
      
      toast({
        title: 'Feedback submitted',
        description: 'Your review has been saved successfully.',
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Review Task Submission</DialogTitle>
          <DialogDescription>
            Review and provide feedback for {submission.student.name}'s submission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Task Details</h3>
              <div className="mt-2 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Title:</span> {submission.task.title}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Description:</span> {submission.task.description}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Due Date:</span>{' '}
                  {format(new Date(submission.task.dueDate), 'MMM d, yyyy')}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Submitted:</span>{' '}
                  {format(new Date(submission.submissionDate), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Student Notes */}
            {submission.notes && (
              <div>
                <h3 className="text-sm font-medium">Student Notes</h3>
                <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                  {submission.notes}
                </div>
              </div>
            )}

            {/* Attachments */}
            {submission.fileUrl && (
              <div>
                <h3 className="text-sm font-medium">Attachments</h3>
                <div className="mt-2 flex items-center gap-2 p-3 bg-muted rounded-md">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm flex-1">{submission.fileName}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatFileSize(submission.fileSize)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(submission.fileUrl, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Review Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={feedback.status}
                  onValueChange={(value) =>
                    setFeedback({ ...feedback, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="resubmit">Needs Resubmission</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={feedback.feedback}
                  onChange={(e) =>
                    setFeedback({ ...feedback, feedback: e.target.value })
                  }
                  placeholder="Provide detailed feedback for the student..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    value={feedback.rating}
                    onChange={(e) =>
                      setFeedback({
                        ...feedback,
                        rating: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="0"
                    value={feedback.points}
                    onChange={(e) =>
                      setFeedback({
                        ...feedback,
                        points: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskReviewDialog; 