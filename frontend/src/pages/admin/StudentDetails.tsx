import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Mail, Phone, School, Calendar, MapPin, GraduationCap, Users, Clock, CheckSquare } from 'lucide-react';
import  UserAvatar  from '@/components/ui-custom/UserAvatar'; // Assuming you have this component

const AdminStudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/students/${studentId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch student data: ${response.status}`);
        }
        
        // Check content type to ensure we're receiving JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not in JSON format');
        }
        
        const data = await response.json();
        setStudentData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  // Function to handle errors gracefully
  const renderErrorState = () => (
    <div className="text-center p-6">
      <div className="text-red-500 mb-4">Error: {error}</div>
      <p className="mb-4">There was a problem fetching the student information. This might be due to:</p>
      <ul className="list-disc list-inside mb-4 text-left max-w-md mx-auto">
        <li>Invalid student ID</li>
        <li>Server connection issues</li>
        <li>API endpoint is not working correctly</li>
      </ul>
      <Button onClick={() => navigate('/admin/students')}>
        Return to Students List
      </Button>
    </div>
  );

  if (loading) return (
    <Card>
      <CardContent className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading student information...</p>
        </div>
      </CardContent>
    </Card>
  );
  
  if (error) return (
    <Card>
      <CardContent className="p-6">
        {renderErrorState()}
      </CardContent>
    </Card>
  );
  
  if (!studentData) return (
    <Card>
      <CardContent className="p-6 text-center">
        <p className="mb-4">No student information found</p>
        <Button onClick={() => navigate('/admin/students')}>
          Return to Students List
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/admin/students')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Students
        </Button>
        <h1 className="text-2xl font-bold">Student Details</h1>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex flex-col items-center text-center md:w-1/4">
              <UserAvatar name={studentData.name} size="xl" />
              <h2 className="text-xl font-bold mt-4">{studentData.name}</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                studentData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
              } mt-2`}>
                {studentData.status || 'Unknown'}
              </span>
              <p className="text-sm text-muted-foreground mt-2">
                Joined on {studentData.joined || new Date(studentData.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{studentData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{studentData.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{studentData.age || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{studentData.location || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <School className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">School</p>
                  <p className="font-medium">{studentData.school || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grade</p>
                  <p className="font-medium">{studentData.grade || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Batches</p>
                  <p className="font-medium">
                    {Array.isArray(studentData.batches) ? studentData.batches.length : 0} total
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attendance</p>
                  <p className="font-medium">{studentData.attendance || 0}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Task Completion</p>
                  <p className="font-medium">{studentData.taskCompletion || 0}%</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStudentDetails;