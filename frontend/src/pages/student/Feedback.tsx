
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FeedbackForm from '@/components/student/FeedbackForm';
import BatchReviewForm from '@/components/student/BatchReviewForm';

const Feedback = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Feedback & Reviews</h1>
      
      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="reviews">Batch Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feedback" className="mt-6">
          <FeedbackForm />
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Reviews</CardTitle>
              <CardDescription>
                Share your experience after completing a course batch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <BatchReviewForm batchName="Business Bootcamp - Summer 2023" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Feedback;
