import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { format } from 'date-fns';
import TaskReviewDialog from '@/components/mentor/TaskReviewDialog';

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
  googleDocsLink?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  feedback?: string;
  rating?: number;
  points?: number;
}

const TaskReview = () => {
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const teacherId = localStorage.getItem('id');
      if (!teacherId) {
        throw new Error('Teacher ID not found');
      }
      const response = await axios.get(`${API_URL}/api/taskSubmission/teacher/${teacherId}`);
      setSubmissions(response.data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions');
      toast({
        title: 'Error',
        description: 'Failed to load task submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (!submission.student || !submission.task || !submission.batch) {
      return false;
    }

    const matchesSearch = 
      (submission.student.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (submission.task.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (submission.batch.batchName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      submitted: { variant: 'secondary', className: 'bg-blue-100 text-blue-800' },
      reviewed: { variant: 'secondary', className: 'bg-purple-100 text-purple-800' },
      approved: { variant: 'default', className: 'bg-green-100 text-green-800' },
      rejected: { variant: 'destructive', className: 'bg-red-100 text-red-800' },
      resubmit: { variant: 'warning', className: 'bg-yellow-100 text-yellow-800' },
    };

    const { variant, className } = variants[status as keyof typeof variants] || { 
      variant: 'secondary', 
      className: 'bg-gray-100 text-gray-800' 
    };

    return (
      <Badge variant={variant as any} className={className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleReview = (submission: TaskSubmission) => {
    setSelectedSubmission(submission);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading submissions...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchSubmissions} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Task Review Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[200px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="resubmit">Needs Resubmission</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Submissions</CardTitle>
          <CardDescription>
            Review and provide feedback on student task submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submission Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((submission) => (
                  <TableRow key={submission._id}>
                    <TableCell className="font-medium">
                      {submission.student?.name || 'N/A'}
                    </TableCell>
                    <TableCell>{submission.task?.title || 'N/A'}</TableCell>
                    <TableCell>{submission.batch?.batchName || 'N/A'}</TableCell>
                    <TableCell>
                      {format(new Date(submission.submissionDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      {submission.googleDocsLink ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          Google Docs
                        </Badge>
                      ) : submission.fileUrl ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          File Upload
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700">
                          Notes Only
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReview(submission)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No submissions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedSubmission && (
        <TaskReviewDialog
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onUpdate={fetchSubmissions}
        />
      )}
    </div>
  );
};

export default TaskReview; 