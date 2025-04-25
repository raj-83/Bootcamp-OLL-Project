
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock, Link as LinkIcon, Play, Video, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock data
const mockSessions = [
  { 
    id: 1, 
    title: "Business Idea Brainstorming", 
    date: new Date(2023, 5, 15, 15, 0), // June 15, 2023, 3:00 PM 
    status: "completed", 
    attended: true,
    recordingUrl: "https://example.com/recordings/session1"
  },
  { 
    id: 2, 
    title: "Marketing Fundamentals", 
    date: new Date(2023, 5, 22, 15, 0), // June 22, 2023, 3:00 PM
    status: "completed", 
    attended: true,
    recordingUrl: "https://example.com/recordings/session2"
  },
  { 
    id: 3, 
    title: "Financial Planning", 
    date: new Date(2023, 5, 29, 15, 0), // June 29, 2023, 3:00 PM
    status: "completed", 
    attended: false
  },
  { 
    id: 4, 
    title: "Product Development", 
    date: new Date(2023, 6, 6, 15, 0), // July 6, 2023, 3:00 PM
    status: "completed", 
    attended: true,
    recordingUrl: "https://example.com/recordings/session4"
  },
  { 
    id: 5, 
    title: "Customer Acquisition", 
    date: new Date(2023, 6, 13, 15, 0), // July 13, 2023, 3:00 PM
    status: "upcoming",
    joinLink: "https://zoom.us/j/1234567890"
  },
  { 
    id: 6, 
    title: "Sales Techniques", 
    date: new Date(2023, 6, 20, 15, 0), // July 20, 2023, 3:00 PM
    status: "upcoming"
  },
  { 
    id: 7, 
    title: "Scaling Strategies", 
    date: new Date(2023, 6, 27, 15, 0), // July 27, 2023, 3:00 PM
    status: "rescheduled",
    newDate: new Date(2023, 6, 29, 15, 0), // July 29, 2023, 3:00 PM
    reason: "Mentor unavailable"
  }
];

// Calculate attendance percentage
const calculateAttendance = () => {
  const completedSessions = mockSessions.filter(session => session.status === "completed");
  const attended = completedSessions.filter(session => session.attended).length;
  return (attended / completedSessions.length) * 100;
};

const StudentSessions = () => {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredSessions = () => {
    switch (activeTab) {
      case "upcoming":
        return mockSessions.filter(session => ["upcoming", "rescheduled"].includes(session.status));
      case "completed":
        return mockSessions.filter(session => session.status === "completed");
      default:
        return mockSessions;
    }
  };

  const handleJoinSession = (joinLink: string) => {
    window.open(joinLink, "_blank");
  };

  const handleViewRecording = (recordingUrl: string) => {
    window.open(recordingUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Sessions</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Attendance:</span>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {Math.round(calculateAttendance())}%
          </Badge>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            Track all your bootcamp sessions and recordings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="all">All Sessions</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions().map(session => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="font-medium">{format(session.date, 'MMM d, yyyy')}</div>
                        <div className="text-sm text-muted-foreground">{format(session.date, 'h:mm a')}</div>
                        
                        {session.status === "rescheduled" && session.newDate && (
                          <div className="text-xs text-warning mt-1 flex items-center gap-1">
                            <Clock size={12} />
                            <span>Rescheduled to {format(session.newDate, 'MMM d, h:mm a')}</span>
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>{session.title}</TableCell>
                      
                      <TableCell>
                        {session.status === "completed" && (
                          <Badge className="bg-success">Completed</Badge>
                        )}
                        {session.status === "upcoming" && (
                          <Badge className="bg-primary">Upcoming</Badge>
                        )}
                        {session.status === "rescheduled" && (
                          <Badge className="bg-warning text-warning-foreground">Rescheduled</Badge>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {session.status === "completed" && (
                          session.attended ? 
                          <div className="flex items-center gap-1 text-success">
                            <CheckCircle size={16} />
                            <span>Present</span>
                          </div> :
                          <div className="flex items-center gap-1 text-destructive">
                            <XCircle size={16} />
                            <span>Absent</span>
                          </div>
                        )}
                        {session.status !== "completed" && "-"}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        {session.status === "upcoming" && session.joinLink && (
                          <Button size="sm" onClick={() => handleJoinSession(session.joinLink!)}>
                            <LinkIcon size={16} className="mr-1" />
                            Join
                          </Button>
                        )}
                        
                        {session.status === "completed" && session.recordingUrl && (
                          <Button size="sm" variant="outline" onClick={() => handleViewRecording(session.recordingUrl!)}>
                            <Play size={16} className="mr-1" />
                            Recording
                          </Button>
                        )}
                        
                        {((session.status === "completed" && !session.recordingUrl) || 
                          (session.status === "upcoming" && !session.joinLink)) && (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentSessions;
