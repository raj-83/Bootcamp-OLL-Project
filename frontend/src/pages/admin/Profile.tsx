import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Mail, Phone, User, MapPin, Briefcase, Calendar, Shield, Edit, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminProfile = () => {
  // Initial profile state with empty values
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    jobTitle: "",
    department: "",
    bio: "",
    responsibilities: [],
    location: "Not specified"
  });
  
  // Platform statistics state
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeStudents: 0,
    activeMentors: 0,
    totalRevenue: 0
  });
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({...profile});
  
  // Fetch admin profile data
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        // Get admin ID from localStorage
        const adminId = localStorage.getItem('id');
        
        if (!adminId) {
          toast({
            title: "Authentication Error",
            description: "Admin ID not found. Please login again.",
            variant: "destructive"
          });
          return;
        }
        
        const response = await fetch(`http://localhost:5000/api/admin/${adminId}`);
        
        if (response.ok) {
          const adminData = await response.json();
          
          // Map the fetched data to our profile state structure
          setProfile({
            name: adminData.name || "",
            email: adminData.email || "",
            phone: adminData.phone || "",
            jobTitle: adminData.jobTitle || "",
            department: adminData.department || "",
            bio: adminData.bio || "",
            responsibilities: adminData.responsibilities || [],
            location: adminData.location || "Not specified"
          });
          
          // Also update the editedProfile state
          setEditedProfile({
            name: adminData.name || "",
            email: adminData.email || "",
            phone: adminData.phone || "",
            jobTitle: adminData.jobTitle || "",
            department: adminData.department || "",
            bio: adminData.bio || "",
            responsibilities: adminData.responsibilities || [],
            location: adminData.location || "Not specified"
          });
        } else {
          toast({
            title: "Failed to load profile",
            description: "Could not retrieve admin profile data",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching admin profile:", error);
        toast({
          title: "Network error",
          description: "Failed to connect to the server",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminProfile();
  }, []);
  
  // Fetch platform statistics
  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/batches');
        
        if (response.ok) {
          const batches = await response.json();
          
          // Calculate statistics from batches data
          let totalStudentsCount = 0;
          let totalMentorsCount = new Set(); // Use Set to avoid counting duplicates
          let totalRevenueAmount = 0;
          
          batches.forEach(batch => {
            // Count unique students
            if (batch.students && Array.isArray(batch.students)) {
              totalStudentsCount += batch.students.length;
            }
            
            // Count unique teachers/mentors
            if (batch.teacher) {
              totalMentorsCount.add(batch.teacher);
            }
            
            // Sum up revenue
            if (batch.revenue) {
              totalRevenueAmount += batch.revenue;
            }
          });
          
          setStats({
            totalBatches: batches.length,
            activeStudents: totalStudentsCount,
            activeMentors: totalMentorsCount.size,
            totalRevenue: totalRevenueAmount
          });
        } else {
          console.error("Failed to fetch batch data");
        }
      } catch (error) {
        console.error("Error fetching platform statistics:", error);
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchPlatformStats();
  }, []);
  
  // Handle input changes when editing
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({
      ...editedProfile,
      [name]: value
    });
  };
  
  // Save profile changes
  const handleSave = async () => {
    try {
      setSavingProfile(true);
      
      const adminId = localStorage.getItem('id');
      if (!adminId) {
        toast({
          title: "Authentication Error",
          description: "Admin ID not found. Please login again.",
          variant: "destructive"
        });
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/admin/${adminId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editedProfile)
      });
  
      if (response.ok) {
        const updatedAdmin = await response.json();
        
        // Update profile state with the returned data
        setProfile({
          ...profile,
          ...editedProfile
        });
        
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated"
        });
      } else {
        // Try to parse the error
        let errorMessage = "Failed to update profile.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If parsing fails, use generic message
        }
        
        toast({
          title: "Update failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Network error",
        description: "Failed to connect to the server",
        variant: "destructive"
      });
    } finally {
      setSavingProfile(false);
    }
  };
  
  // Cancel editing and revert changes
  const handleCancel = () => {
    setEditedProfile({...profile});
    setIsEditing(false);
  };
  
  // Format currency amount
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading profile data...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Profile</h1>
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
                <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
            
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <Briefcase className="h-4 w-4 mr-2" />
                Department
              </h3>
              <p className="text-sm">{profile.department}</p>
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
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input 
                    id="department"
                    name="department"
                    value={editedProfile.department}
                    onChange={handleChange}
                  />
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
                <Button variant="outline" onClick={handleCancel} disabled={savingProfile}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={savingProfile}>
                  {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                <p>{profile.bio}</p>
                
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Core Responsibilities
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {profile.responsibilities.map((resp, index) => (
                      <li key={index} className="text-sm">{resp}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Platform Statistics</CardTitle>
          <CardDescription>Overall platform performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded-md p-4">
                <p className="text-sm text-muted-foreground">Total Batches</p>
                <p className="text-2xl font-bold">{stats.totalBatches}</p>
              </div>
              <div className="border rounded-md p-4">
                <p className="text-sm text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold">{stats.activeStudents}</p>
              </div>
              <div className="border rounded-md p-4">
                <p className="text-sm text-muted-foreground">Active Mentors</p>
                <p className="text-2xl font-bold">{stats.activeMentors}</p>
              </div>
              <div className="border rounded-md p-4">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile;