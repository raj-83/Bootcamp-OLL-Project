import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  School,
  Trophy, 
  Edit, 
  ShoppingBag,
  Rocket,
  Clock,
  X,
  Save,
  Check
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
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

interface StudentProfile {
  _id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  school: string;
  grade: string;
  joined: string;
  status: string;
  earning: number;
  attendance: number;
  taskCompletion: number;
  batches: any[];
  teachers: any[];
}

const apiUrl = import.meta.env.VITE_REACT_API_URL || "https://localhost:5000";

// Add the form schema
const profileFormSchema = z.object({
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
  location: z.string()
    .min(2, { message: "Location must be at least 2 characters long" })
    .max(100, { message: "Location cannot exceed 100 characters" }),
  school: z.string()
    .min(2, { message: "School name must be at least 2 characters long" })
    .max(100, { message: "School name cannot exceed 100 characters" }),
  grade: z.string()
    .min(1, { message: "Grade is required" })
    .max(20, { message: "Grade cannot exceed 20 characters" })
});

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<StudentProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize form with Zod resolver
  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      school: "",
      grade: ""
    }
  });

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/students/${user?._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch student profile');
        }
        
        const data = await response.json();
        setProfileData(data);
        
        // Set form values when profile data is loaded
        form.reset({
          name: data.name,
          email: data.email,
          phone: data.phone,
          location: data.location,
          school: data.school,
          grade: data.grade
        });
      } catch (error) {
        console.error('Error fetching student profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?._id) {
      fetchStudentProfile();
    }
  }, [user]);

  const handleSaveProfile = async (data) => {
    try {
      const response = await fetch(`${apiUrl}/api/students/update/${user?._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();
      setProfileData(updatedData.student);
      
      setIsEditModalOpen(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">No profile data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Name:</span>
              <span>{profileData.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Email:</span>
              <span>{profileData.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Phone:</span>
              <span>{profileData.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Location:</span>
              <span>{profileData.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <School className="w-4 h-4 text-gray-500" />
              <span className="font-medium">School:</span>
              <span>{profileData.school}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Grade:</span>
              <span>{profileData.grade}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Your progress and achievements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Earnings:</span>
              <span>₹{profileData.earning}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Attendance:</span>
              <span>{profileData.attendance}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Task Completion:</span>
              <span>{profileData.taskCompletion}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                profileData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {profileData.status}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveProfile)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
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

              <FormField
                control={form.control}
                name="school"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your school name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your grade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    form.reset();
                    setIsEditModalOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;