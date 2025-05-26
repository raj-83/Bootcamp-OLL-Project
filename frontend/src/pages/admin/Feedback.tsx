import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, MessageSquare, Search, Filter, Star, Image as ImageIcon, Loader2 } from 'lucide-react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_REACT_API_URL || "https://localhost:5000";

const AdminFeedback = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState({
    category: 'all',
    status: 'all',
    date: 'all'
  });
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all feedbacks
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/api/feedback/feedback`);
        
        // Map the response data to match our component's expected structure
        const mappedFeedbacks = response.data.map(item => ({
          id: item._id,
          studentName: item.student?.name || "Unknown Student", // In case student isn't fully populated
          studentId: item.student?._id || item.student,
          category: item.category,
          subject: `Feedback from ${item.student?.name || "Student"}`, // Create a subject line
          message: item.feedback,
          date: item.createdAt,
          status: item.status,
          imageUrl: item.image ? `${item.image}` : null,
          response: item.reply || null
        }));
        
        setFeedbacks(mappedFeedbacks);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
        setError("Failed to load feedbacks. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  // Filter feedbacks based on search term and filters
  const filteredFeedbacks = feedbacks.filter(feedback => {
    // Search term filter
    const matchesSearch = 
      feedback.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (feedback.subject && feedback.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      feedback.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Tab filter
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'pending' && feedback.status === 'pending') ||
      (activeTab === 'in-progress' && feedback.status === 'in-progress') ||
      (activeTab === 'resolved' && feedback.status === 'resolved');
    
    // Additional filters
    const matchesCategory = selectedFilter.category === 'all' || feedback.category.toLowerCase() === selectedFilter.category.toLowerCase();
    const matchesStatus = selectedFilter.status === 'all' || feedback.status === selectedFilter.status;
    
    // Date filter implementation
    let matchesDate = true;
    const feedbackDate = new Date(feedback.date);
    const today = new Date();
    
    if (selectedFilter.date === 'today') {
      matchesDate = feedbackDate.toDateString() === today.toDateString();
    } else if (selectedFilter.date === 'this-week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      matchesDate = feedbackDate >= oneWeekAgo;
    } else if (selectedFilter.date === 'this-month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      matchesDate = feedbackDate >= oneMonthAgo;
    }
    
    return matchesSearch && matchesTab && matchesCategory && matchesStatus && matchesDate;
  });

  // Mark feedback as in-progress
  const handleMarkInProgress = async () => {
    if (!selectedFeedback) return;
    
    try {
      setSubmitting(true);
      
      // Call API to update status
      const response = await axios.patch(`${apiUrl}/api/feedback/feedback/${selectedFeedback.id}`, {
        status: 'in-progress'
      });
      
      // Update local state
      const updatedFeedbacks = feedbacks.map(feedback => 
        feedback.id === selectedFeedback.id 
          ? { ...feedback, status: 'in-progress' } 
          : feedback
      );
      
      setFeedbacks(updatedFeedbacks);
      setSelectedFeedback(prev => prev ? {...prev, status: 'in-progress'} : null);
    } catch (err) {
      console.error("Error updating feedback status:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Send reply to feedback
  const handleSendReply = async () => {
    if (!selectedFeedback || !replyText.trim()) return;
    
    try {
      setSubmitting(true);
      
      // Call API to update status and add reply
      const response = await axios.patch(`${apiUrl}/api/feedback/feedback/${selectedFeedback.id}`, {
        status: 'resolved',
        reply: replyText
      });
      
      // Update local state
      const updatedFeedbacks = feedbacks.map(feedback => 
        feedback.id === selectedFeedback.id 
          ? { 
              ...feedback, 
              status: 'resolved', 
              response: replyText 
            } 
          : feedback
      );
      
      setFeedbacks(updatedFeedbacks);
      setSelectedFeedback(prev => prev ? {...prev, status: 'resolved', response: replyText} : null);
      setReplyText('');
    } catch (err) {
      console.error("Error sending reply:", err);
      alert("Failed to send reply. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading feedbacks...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="ml-2">
          <p className="font-medium text-red-800">{error}</p>
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Student Feedback</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search feedback..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setFilterVisible(!filterVisible)}
            className={filterVisible ? "bg-muted" : ""}
          >
            <Filter size={18} />
          </Button>
        </div>
      </div>

      {filterVisible && (
        <Card className="animate-fade-in">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category-filter">Category</Label>
                <Select 
                  value={selectedFilter.category} 
                  onValueChange={(value) => setSelectedFilter({...selectedFilter, category: value})}
                >
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="platform">Platform</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select 
                  value={selectedFilter.status} 
                  onValueChange={(value) => setSelectedFilter({...selectedFilter, status: value})}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date-filter">Date Range</Label>
                <Select 
                  value={selectedFilter.date} 
                  onValueChange={(value) => setSelectedFilter({...selectedFilter, date: value})}
                >
                  <SelectTrigger id="date-filter">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedFilter({
                  category: 'all',
                  status: 'all',
                  date: 'all'
                })}
              >
                Reset
              </Button>
              <Button 
                size="sm"
                onClick={() => setFilterVisible(false)}
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
            
            <div className="mt-4 space-y-2">
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((feedback) => (
                  <div 
                    key={feedback.id} 
                    className={`
                      p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors
                      ${selectedFeedback?.id === feedback.id ? 'border-primary bg-primary/5' : ''}
                    `}
                    onClick={() => setSelectedFeedback(feedback)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3 items-center">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${feedback.studentName}`} alt={feedback.studentName} />
                          <AvatarFallback>{feedback.studentName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{feedback.studentName}</p>
                          <p className="text-xs text-muted-foreground">{new Date(feedback.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {renderStatusBadge(feedback.status)}
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm font-medium truncate">{feedback.subject || 'Feedback'}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{feedback.message}</p>
                    </div>
                    
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="bg-muted/50 hover:bg-muted/50 capitalize">
                        {feedback.category}
                      </Badge>
                      {feedback.imageUrl && (
                        <div className="ml-2 flex items-center">
                          <ImageIcon size={12} className="mr-1" />
                          <span>Has attachment</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No feedback found matching your criteria.</p>
                </div>
              )}
            </div>
          </Tabs>
        </div>
        
        <div className="md:col-span-2">
          {selectedFeedback ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedFeedback.subject || 'Feedback'}</CardTitle>
                    <CardDescription>
                      From {selectedFeedback.studentName} • {new Date(selectedFeedback.date).toLocaleString()}
                    </CardDescription>
                  </div>
                  {renderStatusBadge(selectedFeedback.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedFeedback.studentName}`} alt={selectedFeedback.studentName} />
                      <AvatarFallback>{selectedFeedback.studentName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedFeedback.studentName}</p>
                      <p className="text-sm text-muted-foreground capitalize">Category: {selectedFeedback.category}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="whitespace-pre-line">{selectedFeedback.message}</p>
                  </div>
                  
                  {selectedFeedback.imageUrl && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Attached Image:</p>
                      <img 
                        src={selectedFeedback.imageUrl} 
                        alt="Feedback attachment" 
                        className="max-w-full max-h-64 rounded-md border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/placeholder-image.jpg"; // Fallback image path
                          console.error("Error loading image:", selectedFeedback.imageUrl);
                        }}
                      />
                    </div>
                  )}
                </div>
                
                {selectedFeedback.response ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="ml-2">
                      <p className="font-medium text-green-800">Admin Response:</p>
                      <p className="text-green-800 mt-1">{selectedFeedback.response}</p>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={16} className="text-muted-foreground" />
                      <p className="text-sm font-medium">Your Reply</p>
                    </div>
                    
                    <Textarea 
                      placeholder="Type your response here..."
                      className="min-h-32"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      disabled={submitting}
                    />
                    
                    <div className="flex justify-end mt-4 gap-2">
                      <Button 
                        variant="outline"
                        onClick={handleMarkInProgress}
                        disabled={selectedFeedback.status === 'in-progress' || selectedFeedback.status === 'resolved' || submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Mark as In Progress'
                        )}
                      </Button>
                      <Button 
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Reply'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 border rounded-lg bg-muted/10">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Feedback Selected</h3>
              <p className="text-center text-muted-foreground">
                Select a feedback from the list to view details and respond.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFeedback;
