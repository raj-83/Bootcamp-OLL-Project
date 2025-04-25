import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Mail, Phone, User, MapPin, Briefcase, Calendar, Shield, Edit, Users, Star, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';


const MentorProfile = () => {
  // Use State for profile data
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    jobTitle: "",
    yearOfExp: 0,
    specialization: "",
    totalStudents: 0,
    rating: 0,
    students: []
  });
  
  // State for student data
  const [studentData, setStudentData] = useState([]);
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({...profile});
  
  // Fetch teacher data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get teacher ID from localStorage
        const teacherId = localStorage.getItem('id');
        
        if (!teacherId) {
          throw new Error('Teacher ID not found in localStorage');
        }
        
        // Fetch teacher data
        const teacherResponse = await axios.get(`http://localhost:5000/api/teachers/${teacherId}`);
        const teacherData = teacherResponse.data;
        
        setProfile(teacherData);
        setEditedProfile(teacherData);
        
        // Fetch student data for each student ID
        if (teacherData.students && teacherData.students.length > 0) {
          const studentsPromises = teacherData.students.map(studentId => 
            axios.get(`http://localhost:5000/api/students/${studentId}`)
          );
          
          const studentsResponses = await Promise.all(studentsPromises);
          const studentsData = studentsResponses.map(response => response.data);
          
          setStudentData(studentsData);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setIsLoading(false);
        toast({
          title: "Error",
          description: `Failed to load profile: ${err.message}`,
          variant: "destructive"
        });
      }
    };
    
    fetchData();
  }, []);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({
      ...editedProfile,
      [name]: value
    });
  };
  
  // Save changes
  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated"
    });
  };
  
  // Cancel editing
  const handleCancel = () => {
    setEditedProfile({...profile});
    setIsEditing(false);
  };
  
  // Display loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  // Display error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-lg text-red-500 mb-4">Failed to load profile</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mentor Profile</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg" alt={profile.name} />
                <AvatarFallback>{profile.name ? profile.name.split(' ').map(n => n[0]).join('') : 'MN'}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <CardTitle>{profile.name}</CardTitle>
                <CardDescription>{profile.jobTitle}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{profile.location}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Specialization
                </h3>
                <p className="text-sm">{profile.specialization}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="space-y-1">
                  <div className="flex items-center justify-center">
                    <Users size={16} className="text-primary" />
                  </div>
                  <p className="text-xl font-bold">{profile.students.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center">
                    <Star size={16} className="text-yellow-500" />
                  </div>
                  <p className="text-xl font-bold">{profile.rating || 0}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center">
                    <Clock size={16} className="text-accent" />
                  </div>
                  <p className="text-xl font-bold">{profile.yearOfExp || 0}</p>
                  <p className="text-xs text-muted-foreground">Years</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          {isEditing ? (
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name"
                    name="name"
                    value={editedProfile.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      value={editedProfile.email}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone"
                      name="phone"
                      value={editedProfile.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location"
                    name="location"
                    value={editedProfile.location}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input 
                    id="jobTitle"
                    name="jobTitle"
                    value={editedProfile.jobTitle}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearOfExp">Years of Experience</Label>
                    <Input 
                      id="yearOfExp"
                      name="yearOfExp"
                      type="number"
                      value={editedProfile.yearOfExp}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input 
                      id="specialization"
                      name="specialization"
                      value={editedProfile.specialization}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio"
                    name="bio"
                    value={editedProfile.bio}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p>{profile.bio || "No bio information available."}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Joining Date</h3>
                    <p className="text-sm">
                      {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : "Not available"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Status</h3>
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${profile.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                      <span className="text-sm capitalize">{profile.status || "Unknown"}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Teaching Statistics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/20 rounded-lg text-center">
                      <p className="text-lg font-bold">{profile.totalBatches || 0}</p>
                      <p className="text-xs text-muted-foreground">Total Batches</p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-lg text-center">
                      <p className="text-lg font-bold">{profile.currentBatches || 0}</p>
                      <p className="text-xs text-muted-foreground">Current Batches</p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-lg text-center">
                      <p className="text-lg font-bold">${profile.totalEarnings || 0}</p>
                      <p className="text-xs text-muted-foreground">Total Earnings</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Students</CardTitle>
          <CardDescription>Students you are currently mentoring</CardDescription>
        </CardHeader>
        <CardContent>
          {studentData.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="h-12 px-4 text-left align-middle font-medium">Student</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">School</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Progress</th>
                    <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentData.slice(0, 3).map((student, index) => (
                    <tr key={student._id} className={index !== studentData.length - 1 ? "border-b transition-colors hover:bg-muted/20" : "transition-colors hover:bg-muted/20"}>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{student.name ? student.name.split(' ').map(n => n[0]).join('') : 'ST'}</AvatarFallback>
                          </Avatar>
                          <span>{student.name}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">{student.school || "Not specified"}</td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${student.taskCompletion || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{student.taskCompletion || 0}%</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No students found</p>
            </div>
          )}
          
          {studentData.length > 3 && (
            <div className="flex justify-center mt-4">
              <Button variant="outline">View All Students</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorProfile;