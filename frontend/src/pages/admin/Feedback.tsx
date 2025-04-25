
import React, { useState } from 'react';
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
import { CheckCircle, XCircle, MessageSquare, Search, Filter, Star, Image as ImageIcon } from 'lucide-react';

// Mock feedback data
const feedbackData = [
  {
    id: 1,
    studentName: "Alex Johnson",
    studentId: "ST12345",
    category: "Teacher",
    subject: "Teaching Pace Too Fast",
    message: "I'm finding it difficult to keep up with the pace of the lessons. Could we slow down a bit or have additional resources provided?",
    date: "2025-04-10T09:30:00",
    status: "pending",
    imageUrl: null,
    response: null
  },
  {
    id: 2,
    studentName: "Emma Martinez",
    studentId: "ST12346",
    category: "Content",
    subject: "Missing Module Materials",
    message: "The slides for Module 3 seem to be incomplete. The last few pages mentioned during the lecture are missing.",
    date: "2025-04-08T14:15:00",
    status: "resolved",
    imageUrl: "https://example.com/screenshot1.jpg",
    response: "Thank you for pointing this out. We've updated the materials with the missing slides. You can now access the complete module."
  },
  {
    id: 3,
    studentName: "David Wong",
    studentId: "ST12347",
    category: "Platform",
    subject: "Video Playback Issues",
    message: "I'm experiencing buffering issues when trying to watch the recorded sessions. The video keeps pausing every few seconds.",
    date: "2025-04-05T11:20:00",
    status: "in-progress",
    imageUrl: "https://example.com/screenshot2.jpg",
    response: null
  },
  {
    id: 4,
    studentName: "Sophia Chen",
    studentId: "ST12348",
    category: "Teacher",
    subject: "Need More Practical Examples",
    message: "The theoretical content is good, but I would benefit from more real-world examples and case studies to understand the application better.",
    date: "2025-04-03T16:45:00",
    status: "resolved",
    imageUrl: null,
    response: "We appreciate your feedback. We've added more practical examples to the upcoming classes and shared additional case studies in the resources section."
  },
  {
    id: 5,
    studentName: "Taylor Swift",
    studentId: "ST12349",
    category: "Content",
    subject: "Suggestion for Additional Resources",
    message: "Would it be possible to get a list of recommended books or articles for further reading on the topics covered in class?",
    date: "2025-04-01T10:05:00",
    status: "pending",
    imageUrl: null,
    response: null
  }
];

const AdminFeedback = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState({
    category: 'all',
    status: 'all',
    date: 'all'
  });
  const [selectedFeedback, setSelectedFeedback] = useState<typeof feedbackData[0] | null>(null);
  const [replyText, setReplyText] = useState('');
  const [feedbacks, setFeedbacks] = useState(feedbackData);

  // Filter feedbacks based on search term and filters
  const filteredFeedbacks = feedbacks.filter(feedback => {
    // Search term filter
    const matchesSearch = 
      feedback.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Tab filter
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'pending' && feedback.status === 'pending') ||
      (activeTab === 'in-progress' && feedback.status === 'in-progress') ||
      (activeTab === 'resolved' && feedback.status === 'resolved');
    
    // Additional filters
    const matchesCategory = selectedFilter.category === 'all' || feedback.category === selectedFilter.category;
    const matchesStatus = selectedFilter.status === 'all' || feedback.status === selectedFilter.status;
    
    // Date filter would be implemented here with actual date logic
    const matchesDate = true; // Placeholder
    
    return matchesSearch && matchesTab && matchesCategory && matchesStatus && matchesDate;
  });

  const handleSendReply = () => {
    if (!selectedFeedback || !replyText.trim()) return;
    
    // Update the feedback with the response
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
  };

  const renderStatusBadge = (status: string) => {
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
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Content">Content</SelectItem>
                    <SelectItem value="Platform">Platform</SelectItem>
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
                          <AvatarImage src={`https://avatar.vercel.sh/${feedback.studentId}`} alt={feedback.studentName} />
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
                      <p className="text-sm font-medium truncate">{feedback.subject}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{feedback.message}</p>
                    </div>
                    
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="bg-muted/50 hover:bg-muted/50">
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
                    <CardTitle>{selectedFeedback.subject}</CardTitle>
                    <CardDescription>
                      From {selectedFeedback.studentName} ({selectedFeedback.studentId}) • {new Date(selectedFeedback.date).toLocaleString()}
                    </CardDescription>
                  </div>
                  {renderStatusBadge(selectedFeedback.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://avatar.vercel.sh/${selectedFeedback.studentId}`} alt={selectedFeedback.studentName} />
                      <AvatarFallback>{selectedFeedback.studentName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedFeedback.studentName}</p>
                      <p className="text-sm text-muted-foreground">Category: {selectedFeedback.category}</p>
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
                    />
                    
                    <div className="flex justify-end mt-4 gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          // Mark as in-progress without sending a reply
                          const updatedFeedbacks = feedbacks.map(feedback => 
                            feedback.id === selectedFeedback.id 
                              ? { ...feedback, status: 'in-progress' } 
                              : feedback
                          );
                          setFeedbacks(updatedFeedbacks);
                          setSelectedFeedback(prev => prev ? {...prev, status: 'in-progress'} : null);
                        }}
                      >
                        Mark as In Progress
                      </Button>
                      <Button onClick={handleSendReply}>
                        Send Reply
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
