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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const apiUrl = import.meta.env.VITE_REACT_API_URL || "https://localhost:5000";

// Add the form schema
const adminProfileSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name cannot exceed 50 characters" })
    .regex(/^[a-zA-Z\s]*$/, { message: "Name can only contain letters and spaces" }),
  email: z.string()
    .email({ message: "Please enter a valid email address" })
    .min(1, { message: "Email is required" }),
  phone: z.string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(15, { message: "Phone number cannot exceed 15 digits" })
    .regex(/^[0-9+\-\s()]*$/, { message: "Please enter a valid phone number" }),
  jobTitle: z.string()
    .min(2, { message: "Job title must be at least 2 characters long" })
    .max(50, { message: "Job title cannot exceed 50 characters" }),
  department: z.string()
    .min(2, { message: "Department must be at least 2 characters long" })
    .max(50, { message: "Department cannot exceed 50 characters" }),
  bio: z.string()
    .max(500, { message: "Bio cannot exceed 500 characters" })
    .optional(),
  location: z.string()
    .min(2, { message: "Location must be at least 2 characters long" })
    .max(100, { message: "Location cannot exceed 100 characters" }),
  responsibilities: z.array(z.string())
    .min(1, { message: "At least one responsibility is required" })
    .max(10, { message: "Cannot exceed 10 responsibilities" })
});

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

  // Initialize form with Zod resolver
  const form = useForm({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      jobTitle: "",
      department: "",
      bio: "",
      responsibilities: [],
      location: "Not specified"
    }
  });

  // Fetch admin profile data
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const adminId = localStorage.getItem('id');
        
        if (!adminId) {
          toast({
            title: "Authentication Error",
            description: "Admin ID not found. Please login again.",
            variant: "destructive"
          });
          return;
        }
        
        const response = await fetch(`${apiUrl}/api/admin/${adminId}`);
        
        if (response.ok) {
          const adminData = await response.json();
          
          // Update profile state
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
          
          // Update form values
          form.reset({
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
        const response = await fetch(`${apiUrl}/api/batches`);
        
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
  
  // Save profile changes
  const handleSave = async (data) => {
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
      
      const response = await fetch(`${apiUrl}/api/admin/${adminId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
  
      if (response.ok) {
        const updatedAdmin = await response.json();
        
        // Update profile state with the returned data
        setProfile({
          ...profile,
          ...data
        });
        
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated"
        });
      } else {
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
  
  // Format currency amount
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your job title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your department" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      disabled={savingProfile}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={savingProfile}>
                      {savingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
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