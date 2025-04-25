
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ThumbsUp, Upload, BadgeCheck, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock completed batches data
const completedBatches = [
  {
    id: 1,
    name: "Business Bootcamp - Batch 0",
    period: "Feb 1, 2023 to Apr 30, 2023",
    mentor: "Jamie Smith",
    hasReview: true,
    review: {
      rating: 4,
      comment: "Great experience! Learned a lot about business fundamentals and how to apply them in real-world scenarios.",
      date: "May 2, 2023"
    }
  },
  {
    id: 2,
    name: "Marketing Masterclass",
    period: "Jan 15, 2023 to Mar 15, 2023",
    mentor: "Sarah Johnson",
    hasReview: false
  }
];

// Mock upcoming batches data
const upcomingBatches = [
  {
    id: 3,
    name: "Business Bootcamp - Batch 1",
    period: "May 1, 2023 to Jul 30, 2023",
    status: "ongoing",
    progress: 65,
    endDate: "2023-07-30"
  },
  {
    id: 4,
    name: "Entrepreneurship 101",
    period: "Jul 1, 2023 to Sep 30, 2023",
    status: "upcoming",
    progress: 0,
    endDate: "2023-09-30"
  }
];

const StudentReviews = () => {
  const [activeTab, setActiveTab] = useState<string>("completed");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenReviewDialog = (batch: any) => {
    setSelectedBatch(batch);
    
    if (batch.hasReview) {
      setRating(batch.review.rating);
      setComment(batch.review.comment);
      setPreviewUrl(null);
    } else {
      setRating(0);
      setComment("");
      setPreviewUrl(null);
    }
    
    setDialogOpen(true);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmitReview = () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting your review.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Submitting review:", {
        batchId: selectedBatch.id,
        rating,
        comment,
        image: image ? image.name : null
      });
      
      // Update local state
      completedBatches.forEach(batch => {
        if (batch.id === selectedBatch.id) {
          batch.hasReview = true;
          batch.review = {
            rating,
            comment,
            date: new Date().toISOString().split('T')[0]
          };
        }
      });
      
      setIsSubmitting(false);
      setDialogOpen(false);
      
      toast({
        title: "Review submitted",
        description: "Thank you for sharing your feedback!",
      });
    }, 1500);
  };
  
  const renderStars = (count: number, interactive: boolean = false) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-5 w-5 cursor-${interactive ? 'pointer' : 'default'} ${
          (interactive ? (i < hoverRating || (hoverRating === 0 && i < rating)) : i < count)
            ? 'text-yellow-500 fill-current' 
            : 'text-gray-300'
        }`}
        onClick={() => interactive && setRating(i + 1)}
        onMouseEnter={() => interactive && setHoverRating(i + 1)}
        onMouseLeave={() => interactive && setHoverRating(0)}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Batch Reviews</h1>
      </div>
      
      <Tabs defaultValue="completed" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger value="completed">Completed Batches</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing Batches</TabsTrigger>
        </TabsList>
        
        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Completed Batches</CardTitle>
              <CardDescription>
                Share your feedback for batches you've completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {completedBatches.length > 0 ? (
                completedBatches.map((batch) => (
                  <div 
                    key={batch.id} 
                    className={`border rounded-md p-4 ${batch.hasReview ? 'bg-muted/30' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <h3 className="font-medium">{batch.name}</h3>
                        <p className="text-sm text-muted-foreground">{batch.period}</p>
                        <p className="text-sm mt-1">Mentor: {batch.mentor}</p>
                      </div>
                      
                      <div className="flex items-start sm:items-center">
                        {batch.hasReview ? (
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {renderStars(batch.review.rating)}
                              </div>
                              <span className="font-medium">{batch.review.rating}/5</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenReviewDialog(batch)}
                            >
                              View Review
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleOpenReviewDialog(batch)}
                            className="gap-2"
                          >
                            <Star className="h-4 w-4" />
                            Submit Review
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {batch.hasReview && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm">{batch.review.comment}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Submitted on {batch.review.date}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>You haven't completed any batches yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ongoing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ongoing & Upcoming Batches</CardTitle>
              <CardDescription>
                You can submit reviews for these batches once they are completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingBatches.length > 0 ? (
                upcomingBatches.map((batch) => (
                  <div key={batch.id} className="border rounded-md p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <h3 className="font-medium">{batch.name}</h3>
                        <p className="text-sm text-muted-foreground">{batch.period}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${batch.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {batch.progress}% complete
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-start sm:items-end justify-center gap-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">
                            {batch.status === 'ongoing' ? 'Ends' : 'Starts'} on {new Date(batch.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="gap-2"
                        >
                          <Star className="h-4 w-4" />
                          Review After Completion
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>You don't have any ongoing or upcoming batches.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedBatch?.hasReview ? 'Your Review' : 'Submit Review'}
            </DialogTitle>
            <DialogDescription>
              {selectedBatch?.hasReview 
                ? 'Your feedback for this batch' 
                : `Share your experience with ${selectedBatch?.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rating" className="mb-2 block">Rating</Label>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {renderStars(rating, !selectedBatch?.hasReview)}
                </div>
                <span className="text-sm font-medium">{rating > 0 ? `${rating}/5` : ''}</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="comment" className="mb-2 block">Your Feedback</Label>
              <Textarea 
                id="comment" 
                placeholder="Share your thoughts about this batch..." 
                className="min-h-[120px]" 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                readOnly={selectedBatch?.hasReview}
              />
            </div>
            
            {!selectedBatch?.hasReview && (
              <div>
                <Label htmlFor="image" className="mb-2 block">Image (Optional)</Label>
                <div className="border-2 border-dashed rounded-md p-4 text-center">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="image" className="cursor-pointer block">
                    {previewUrl ? (
                      <div className="space-y-2">
                        <img 
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-[100px] mx-auto object-contain"
                        />
                        <p className="text-sm">{image?.name}</p>
                        <Button type="button" variant="outline" size="sm">
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm">Click to upload an image</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              {selectedBatch?.hasReview ? 'Close' : 'Cancel'}
            </Button>
            
            {!selectedBatch?.hasReview && (
              <Button
                onClick={handleSubmitReview}
                disabled={isSubmitting || rating === 0}
                className="gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                {isSubmitting ? null : <ThumbsUp className="h-4 w-4" />}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentReviews;
