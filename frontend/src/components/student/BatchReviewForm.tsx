import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Upload, Star, SendIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BatchReviewFormProps {
  batchName: string;
  batchId: string;
  onComplete?: () => void;
}

const apiUrl = import.meta.env.VITE_REACT_API_URL || "https://localhost:5000";

const BatchReviewForm: React.FC<BatchReviewFormProps> = ({ batchName, batchId, onComplete }) => {
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [studentId, setStudentId] = useState<string>('');
  const [student, setStudent] = useState<any>(null);
  
  useEffect(() => {
    // Get student ID from localStorage
    const id = localStorage.getItem('id');
    if (id) {
      setStudentId(id);
      fetchStudentData(id);
    }
  }, []);
  
  const fetchStudentData = async (id: string) => {
    try {
      const res = await axios.get(`${apiUrl}/api/students/${id}`);
      setStudent(res.data);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };
  
  const handleRemoveFile = () => {
    setFiles([]);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Missing rating",
        description: "Please provide a rating",
        variant: "destructive"
      });
      return;
    }
    
    if (!review.trim()) {
      toast({
        title: "Missing review",
        description: "Please provide your review",
        variant: "destructive"
      });
      return;
    }
    
    if (!studentId) {
      toast({
        title: "Authentication error",
        description: "You need to be logged in to submit a review",
        variant: "destructive"
      });
      return;
    }
    
    if (!batchId) {
      toast({
        title: "Batch information missing",
        description: "Unable to identify which batch to review",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create form data for multipart/form-data submission
      const formData = new FormData();
      formData.append('student', studentId);
      formData.append('batch', batchId);
      formData.append('rating', String(rating));
      formData.append('review', review);
      
      // Only append file if it exists
      if (files.length > 0) {
        formData.append('image', files[0]);
      }
      
      // Submit to API
      await axios.post(`${apiUrl}/api/feedback/review`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      });
      
      setRating(0);
      setReview('');
      setFiles([]);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review - {batchName}</CardTitle>
        <CardDescription>Share your experience with this course</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="p-1 focus:outline-none"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(null)}
                >
                  <Star
                    size={28}
                    className={
                      value <= (hoveredRating || rating)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="review">Your Review</Label>
            <Textarea 
              id="review" 
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Please share your experience..."
              rows={5}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="attachment">Attachment (optional)</Label>
            <div className="flex items-center gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('file-input-review')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              <Input 
                id="file-input-review" 
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={handleFileChange}
              />
              {files.length > 0 && (
                <div className="text-sm">
                  {files[0].name}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2 h-auto p-1" 
                    onClick={handleRemoveFile}
                  >
                    <span className="sr-only">Remove</span>
                    <span aria-hidden>×</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <SendIcon className="h-4 w-4 mr-2" />
                Submit Review
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default BatchReviewForm;
