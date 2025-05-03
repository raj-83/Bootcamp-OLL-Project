import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock, Link as LinkIcon, Play, Video, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'rescheduled';
  batchName: string;
  notes: string;
}

const StudentSessions = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log("Token:", token ? "Token exists" : "No token found"); // Debug log
      
      if (!token) {
        toast({
          title: "Error",
          description: "Please login to view sessions",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      // Log the user ID from the token
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log("Token payload:", payload); // Debug log
        }
      } catch (e) {
        console.error("Error parsing token:", e);
      }

      const response = await axios.get('http://localhost:5000/api/sessions/student', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("API response:", response.data); // Debug log
      setSessions(response.data);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      console.error('Error details:', error.response?.data); // Debug log
      
      if (error.response?.status === 401) {
        toast({
          title: "Error",
          description: "Session expired. Please login again.",
          variant: "destructive"
        });
        navigate('/login');
      } else {
        toast({
          title: "Error",
          description: `Failed to fetch sessions: ${error.response?.data?.error || error.message}`,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendance = () => {
    const completedSessions = sessions.filter(session => session.status === "completed");
    if (completedSessions.length === 0) return 0;
    return 100; // Since we don't have attendance tracking yet
  };

  const filteredSessions = () => {
    switch (activeTab) {
      case "upcoming":
        return sessions.filter(session => ["upcoming", "rescheduled"].includes(session.status));
      case "completed":
        return sessions.filter(session => session.status === "completed");
      default:
        return sessions;
    }
  };

  const handleJoinSession = (joinLink: string) => {
    window.open(joinLink, "_blank");
  };

  const handleViewRecording = (recordingUrl: string) => {
    window.open(recordingUrl, "_blank");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading sessions...</div>;
  }

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
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sessions found. You may not be enrolled in any batches yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions().map(session => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="font-medium">{format(new Date(session.date), 'MMM d, yyyy')}</div>
                          <div className="text-sm text-muted-foreground">{session.time}</div>
                        </TableCell>
                        
                        <TableCell>{session.title}</TableCell>
                        
                        <TableCell>{session.batchName}</TableCell>
                        
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
                          {session.status === "cancelled" && (
                            <Badge variant="destructive">Cancelled</Badge>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm text-muted-foreground">{session.notes}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentSessions;