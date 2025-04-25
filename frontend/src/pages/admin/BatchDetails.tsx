import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Calendar, 
  Clock, 
  Search, 
  Users 
} from 'lucide-react';
import axios from 'axios';

const BatchDetails = () => {
  const { batchId } = useParams();
  const [batchData, setBatchData] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatchAndStudents = async () => {
      try {
        setLoading(true);
        // Fetch batch data using the correct API endpoint
        const batchResponse = await axios.get(`http://localhost:5000/api/batches/${batchId}`);
        setBatchData(batchResponse.data);
        
        // Get student IDs from the batch data
        const studentIds = batchResponse.data.students || [];
        
        // Fetch each student's data using individual requests
        const studentPromises = studentIds.map(studentId => 
          axios.get(`http://localhost:5000/api/students/${studentId}`)
        );
        
        // Wait for all student requests to complete
        const studentResponses = await Promise.all(studentPromises);
        
        // Extract student data from responses
        const fetchedStudents = studentResponses.map(response => response.data);
        setStudents(fetchedStudents);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load batch data or student information');
        setLoading(false);
      }
    };

    if (batchId) {
      fetchBatchAndStudents();
    }
  }, [batchId]);

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (student.school?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-64">Loading batch information...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!batchData) return <div className="text-center">No batch data found</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{batchData.batchName}</h1>
          <p className="text-muted-foreground">Batch ID: {batchId}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="capitalize">
            {new Date() > new Date(batchData.endDate) ? 'completed' : 
             new Date() < new Date(batchData.startDate) ? 'upcoming' : 'active'}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div className="text-sm">
                {batchData.startDate ? new Date(batchData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'} - 
                {batchData.endDate ? new Date(batchData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold">
                {students.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">active</div>
              {students.some(s => s.status !== 'active') && (
                <>
                  <div className="text-sm text-muted-foreground mx-1">•</div>
                  <div className="text-sm text-muted-foreground">
                    {students.filter(s => s.status !== 'active').length} inactive
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Session Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div className="text-sm">
                {batchData.scheduleDays ? batchData.scheduleDays.join(', ') : 'No schedule set'} at {batchData.sessionTime || 'TBD'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Session Topic</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{batchData.sessionTopic || 'No topic specified'}</p>
        </CardContent>
      </Card>
      
      <div className="relative">
        <div className="mt-16 space-y-4">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{student.name?.split(' ').map(n => n[0]).join('') || 'S'}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.school || 'Not specified'}</TableCell>
                      <TableCell>{student.grade || 'Not specified'}</TableCell>
                      <TableCell>
                        <Badge variant={student.status === 'active' ? 'outline' : 'secondary'} className="capitalize">
                          {student.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No students found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchDetails;