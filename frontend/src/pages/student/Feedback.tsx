import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FeedbackForm from '@/components/student/FeedbackForm';
import BatchReviewForm from '@/components/student/BatchReviewForm';

const apiUrl = import.meta.env.VITE_REACT_API_URL || "https://localhost:5000";

const Feedback = () => {
  const [studentId, setStudentId] = useState<string>('');
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Get student ID from localStorage
    const id = localStorage.getItem('id');
    if (id) {
      setStudentId(id);
      fetchStudentBatches(id);
    } else {
      setError('You need to be logged in to access this page');
      setLoading(false);
    }
  }, []);
  
  const fetchStudentBatches = async (id: string) => {
    try {
      const res = await axios.get(`${apiUrl}/api/students/${id}`);
      if (res.data && res.data.batches && res.data.batches.length > 0) {
        // Fetch details for each batch
        const batchPromises = res.data.batches.map((batchId: string) => 
          axios.get(`${apiUrl}/api/batches/${batchId}`)
        );
        
        const batchResponses = await Promise.all(batchPromises);
        const batchesData = batchResponses.map(response => response.data);
        setBatches(batchesData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching student batches:', error);
      setError('Failed to load your batch information');
      setLoading(false);
    }
  };
  
  const handleFormComplete = () => {
    // Optional: Refresh data or show a success message
  };
  
  if (loading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 py-8">{error}</div>;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Feedback & Reviews</h1>
      
      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="reviews">Batch Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feedback" className="mt-6">
          <FeedbackForm onComplete={handleFormComplete} />
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
              {batches.length > 0 ? (
                batches.map((batch) => (
                  <div key={batch._id} className="space-y-6">
                    <BatchReviewForm 
                      batchName={batch.name} 
                      batchId={batch._id}
                      onComplete={handleFormComplete}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  You are not enrolled in any batches
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Feedback;
