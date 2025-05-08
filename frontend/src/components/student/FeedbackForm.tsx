import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Upload, SendIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FeedbackFormProps {
  onComplete?: () => void;
}

const apiUrl = import.meta.env.VITE_REACT_API_URL || "https://localhost:5000";

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onComplete }) => {
  const [category, setCategory] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentId, setStudentId] = useState<string>('');
  
  useEffect(() => {
    // Get student ID from localStorage
    const id = localStorage.getItem('id');
    if (id) {
      setStudentId(id);
    }
  }, []);
  
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
    
    if (!category) {
      toast({
        title: "Missing category",
        description: "Please select a feedback category",
        variant: "destructive"
      });
      return;
    }
    
    if (!feedback.trim()) {
      toast({
        title: "Missing feedback",
        description: "Please enter your feedback",
        variant: "destructive"
      });
      return;
    }
    
    if (!studentId) {
      toast({
        title: "Authentication error",
        description: "You need to be logged in to submit feedback",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create form data for multipart/form-data submission
      const formData = new FormData();
      formData.append('student', studentId);
      formData.append('category', category);
      formData.append('feedback', feedback);
      
      // Only append file if it exists
      if (files.length > 0) {
        formData.append('image', files[0]);
      }
      
      // Submit to API
      await axios.post(`${apiUrl}/api/feedback/feedback`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
      
      setCategory('');
      setFeedback('');
      setFiles([]);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Feedback</CardTitle>
        <CardDescription>Share your thoughts to help us improve</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Feedback Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Teacher/Mentor</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="platform">Platform</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback">Your Feedback</Label>
            <Textarea 
              id="feedback" 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please share your thoughts..."
              rows={5}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="attachment">Attachment (optional)</Label>
            <div className="flex items-center gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              <Input 
                id="file-input" 
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
                Submit Feedback
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FeedbackForm;
