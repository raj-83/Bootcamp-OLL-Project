
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Upload, Star, SendIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BatchReviewFormProps {
  batchName: string;
  onComplete?: () => void;
}

const BatchReviewForm: React.FC<BatchReviewFormProps> = ({ batchName, onComplete }) => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };
  
  const handleRemoveFile = () => {
    setFiles([]);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Missing rating",
        description: "Please provide a rating",
        variant: "destructive"
      });
      return;
    }
    
    if (!feedback.trim()) {
      toast({
        title: "Missing feedback",
        description: "Please provide your review",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      });
      
      setRating(0);
      setFeedback('');
      setFiles([]);
      
      if (onComplete) {
        onComplete();
      }
    }, 1000);
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
            <Label htmlFor="feedback">Your Review</Label>
            <Textarea 
              id="feedback" 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
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
