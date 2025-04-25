
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, X, FileText, Download, Star, Edit, Eye } from 'lucide-react';

interface Submission {
  id: number;
  studentId: number;
  studentName: string;
  taskId: number;
  taskTitle: string;
  submittedAt: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'needs_revision';
  feedback?: string;
  rating?: number;
  files: {
    id: number;
    name: string;
    size: string;
    url: string;
  }[];
}

interface TaskSubmissionViewerProps {
  submissionId: number;
  submissions?: Submission[];
}

// Mock submissions data
const mockSubmissions: Submission[] = [
  {
    id: 1,
    studentId: 101,
    studentName: 'Alex Johnson',
    taskId: 201,
    taskTitle: 'Business Plan Draft',
    submittedAt: '2023-07-10T15:30:00',
    status: 'pending_review',
    files: [
      { id: 1, name: 'business_plan.pdf', size: '1.2 MB', url: '#' },
      { id: 2, name: 'financial_projections.xlsx', size: '850 KB', url: '#' }
    ]
  },
  {
    id: 2,
    studentId: 102,
    studentName: 'Samantha Lee',
    taskId: 201,
    taskTitle: 'Business Plan Draft',
    submittedAt: '2023-07-09T12:45:00',
    status: 'approved',
    feedback: 'Excellent work! Your business plan is comprehensive and well-structured.',
    rating: 5,
    files: [
      { id: 3, name: 'business_plan_final.pdf', size: '1.5 MB', url: '#' },
    ]
  },
  {
    id: 3,
    studentId: 103,
    studentName: 'Miguel Santos',
    taskId: 201,
    taskTitle: 'Business Plan Draft',
    submittedAt: '2023-07-08T09:15:00',
    status: 'needs_revision',
    feedback: 'Your financial projections need more detail. Please revise the revenue estimates and add explanations for your assumptions.',
    rating: 3,
    files: [
      { id: 4, name: 'business_plan_draft.docx', size: '980 KB', url: '#' },
      { id: 5, name: 'projections.xlsx', size: '720 KB', url: '#' }
    ]
  }
];

const TaskSubmissionViewer: React.FC<TaskSubmissionViewerProps> = ({ 
  submissionId,
  submissions = mockSubmissions 
}) => {
  const [currentSubmissionId, setCurrentSubmissionId] = useState(submissionId);
  const [viewFileDialogOpen, setViewFileDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<{name: string, url: string} | null>(null);
  
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    feedback: '',
    rating: '5'
  });
  
  // Find the current submission
  const currentSubmission = submissions.find(sub => sub.id === currentSubmissionId);
  
  if (!currentSubmission) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Submission not found</p>
        </CardContent>
      </Card>
    );
  }
  
  // Navigate to next or previous submission
  const handleNavigation = (direction: 'next' | 'prev') => {
    const currentIndex = submissions.findIndex(sub => sub.id === currentSubmissionId);
    
    if (direction === 'next' && currentIndex < submissions.length - 1) {
      setCurrentSubmissionId(submissions[currentIndex + 1].id);
    } else if (direction === 'prev' && currentIndex > 0) {
      setCurrentSubmissionId(submissions[currentIndex - 1].id);
    }
  };
  
  const handleViewFile = (file: {name: string, url: string}) => {
    setCurrentFile(file);
    setViewFileDialogOpen(true);
  };
  
  const handleReviewSubmit = () => {
    // Mock submission review
    toast({
      title: "Review submitted",
      description: `You have reviewed ${currentSubmission.studentName}'s submission.`
    });
    
    setReviewDialogOpen(false);
  };
  
  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'pending_review':
        return <Badge variant="outline">Pending Review</Badge>;
      case 'approved':
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">Rejected</Badge>;
      case 'needs_revision':
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Needs Revision</Badge>;
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{currentSubmission.taskTitle}</CardTitle>
            <CardDescription>
              Submitted by {currentSubmission.studentName} on {new Date(currentSubmission.submittedAt).toLocaleString()}
            </CardDescription>
          </div>
          {getStatusBadge(currentSubmission.status)}
        </div>
      </CardHeader>
      
      <CardContent className="pb-0 space-y-4">
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">Submitted Files</h4>
          <div className="space-y-2">
            {currentSubmission.files.map(file => (
              <div 
                key={file.id} 
                className="flex items-center justify-between p-3 bg-background rounded border"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.size}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleViewFile(file)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Feedback section (if exists) */}
        {currentSubmission.feedback && (
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2">Feedback</h4>
            <p className="text-sm">{currentSubmission.feedback}</p>
            
            {currentSubmission.rating && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs">Rating:</span>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < currentSubmission.rating! ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-6 pb-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigation('prev')}
            disabled={submissions.findIndex(sub => sub.id === currentSubmissionId) === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigation('next')}
            disabled={submissions.findIndex(sub => sub.id === currentSubmissionId) === submissions.length - 1}
          >
            Next
          </Button>
        </div>
        
        <Button onClick={() => setReviewDialogOpen(true)}>
          {currentSubmission.status === 'pending_review' ? 'Review Submission' : 'Edit Review'}
        </Button>
      </CardFooter>
      
      {/* View File Dialog */}
      <Dialog open={viewFileDialogOpen} onOpenChange={setViewFileDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{currentFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-[60vh] bg-muted/20 rounded-lg">
            {/* This would typically render a PDF or image viewer */}
            <div className="text-center">
              <FileText size={64} className="mx-auto text-muted-foreground mb-4" />
              <p>File preview would appear here</p>
              <p className="text-sm text-muted-foreground mt-2">
                URL: {currentFile?.url}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewFileDialogOpen(false)}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentSubmission.status === 'pending_review' ? 'Review Submission' : 'Edit Review'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={reviewData.status}
                onValueChange={(value) => setReviewData({ ...reviewData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="needs_revision">Needs Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea 
                id="feedback"
                value={reviewData.feedback}
                onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                placeholder="Provide feedback on the submission"
                rows={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Select 
                value={reviewData.rating}
                onValueChange={(value) => setReviewData({ ...reviewData, rating: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Poor</SelectItem>
                  <SelectItem value="2">2 - Below Average</SelectItem>
                  <SelectItem value="3">3 - Average</SelectItem>
                  <SelectItem value="4">4 - Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReviewSubmit}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TaskSubmissionViewer;
