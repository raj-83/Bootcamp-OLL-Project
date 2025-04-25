import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, Users, Calendar, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';

const MentorBatches = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch batches data on component mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        // Assume we have the teacher ID from auth context or local storage
        const teacherId = localStorage.getItem('id'); // Adjust based on your auth implementation
        const response = await axios.get(`http://localhost:5000/api/batches/teacher/${teacherId}`);
        
        // Transform the data to match the frontend structure
        const formattedBatches = response.data.map(batch => {
          // Determine batch status based on dates
          const today = new Date();
          const startDate = new Date(batch.startDate);
          const endDate = new Date(batch.endDate);
          
          let status = 'upcoming';
          if (today > endDate) {
            status = 'completed';
          } else if (today >= startDate) {
            status = 'ongoing';
          }


          return {
            id: batch._id,
            name: batch.batchName,
            status: status,
            startDate: new Date(batch.startDate).toISOString().split('T')[0],
            endDate: new Date(batch.endDate).toISOString().split('T')[0],
            students: batch.students.length,
            earnings: batch.revenue,
            nextSession: calculateNextSession(batch),
            topic: batch.sessionTopic
          };
        });
        
        setBatches(formattedBatches);
      } catch (err) {
        console.error("Error fetching batches:", err);
        setError("Failed to load batches. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBatches();
  }, []);

  console.log("Batches data:", batches);

  // Helper function to calculate the next session date based on schedule
  const calculateNextSession = (batch) => {
    const today = new Date();
    if (!batch.scheduleDays || batch.scheduleDays.length === 0 || !batch.sessionTime || today > new Date(batch.endDate)) {
      return null;
    }
    
    const startDate = new Date(batch.startDate);
    const daysMap = {
      'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 
      'Friday': 5, 'Saturday': 6, 'Sunday': 0
    };
    
    // Find the next session day
    const todayDay = today.getDay();
    let nextDayOffset = -1;
    
    // Sort batch days by their day number
    const batchDays = batch.scheduleDays
      .map(day => daysMap[day])
      .sort((a, b) => {
        // Calculate offset from today
        const offsetA = (a - todayDay + 7) % 7;
        const offsetB = (b - todayDay + 7) % 7;
        // If offset is 0, it means today, so we need special handling
        return (offsetA === 0 ? 7 : offsetA) - (offsetB === 0 ? 7 : offsetB);
      });
    
    // Find the next upcoming day
    const nextDay = batchDays.find(day => {
      const offset = (day - todayDay + 7) % 7;
      // If offset is 0, check if the time has passed
      if (offset === 0) {
        const [hours, minutes] = batch.sessionTime.split(':').map(Number);
        const sessionTime = new Date();
        sessionTime.setHours(hours, minutes, 0, 0);
        return today < sessionTime;
      }
      return offset > 0;
    });
    
    if (nextDay !== undefined) {
      nextDayOffset = (nextDay - todayDay + 7) % 7;
      // If nextDayOffset is 0, it means the next session is today
      if (nextDayOffset === 0) nextDayOffset = 7;
    } else if (batchDays.length > 0) {
      // If we didn't find a day after today, take the first day of the next week
      nextDayOffset = (batchDays[0] - todayDay + 7) % 7;
    }
    
    if (nextDayOffset !== -1) {
      const nextSessionDate = new Date();
      nextSessionDate.setDate(today.getDate() + nextDayOffset);
      
      // Set the time
      const [hours, minutes] = batch.sessionTime.split(':').map(Number);
      nextSessionDate.setHours(hours, minutes, 0, 0);
      
      return nextSessionDate;
    }
    
    return null;
  };

  const filteredBatches = batches
    .filter(batch => 
      batch.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (activeTab === 'all' || batch.status === activeTab)
    );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading batches...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center h-64 flex items-center justify-center">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">My Batches</h1>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search batches..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredBatches.length > 0 ? (
            filteredBatches.map((batch) => (
              <Card key={batch.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{batch.name}</CardTitle>
                      <CardDescription>
                        {batch.startDate} to {batch.endDate}
                      </CardDescription>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      batch.status === 'ongoing' 
                        ? 'bg-green-100 text-green-800' 
                        : batch.status === 'upcoming' 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {batch.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{batch.students}</div>
                        <div className="text-xs text-muted-foreground">Students</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">${batch.earnings}</div>
                        <div className="text-xs text-muted-foreground">Earnings</div>
                      </div>
                    </div>
                    {batch.nextSession && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">
                            {new Date(batch.nextSession).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">Next Session</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => navigate(`/mentor/batches/${batch.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No batches found matching your criteria.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MentorBatches;