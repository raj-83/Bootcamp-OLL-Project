import React, { useState } from 'react';
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
  Save
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

// Mock data
const profileData = {
  name: 'Alex Johnson',
  role: 'Student',
  email: 'alex.johnson@example.com',
  phone: '(555) 123-4567',
  location: 'San Francisco, CA',
  school: 'Lincoln High School',
  grade: '10th Grade',
  joined: 'June 2023',
  badges: [
    { id: 1, name: 'First Sale', description: 'Made first product sale', icon: <ShoppingBag size={16} /> },
    { id: 2, name: 'Business Creator', description: 'Created a business plan', icon: <Rocket size={16} /> },
    { id: 3, name: 'Early Bird', description: 'Joined in the first week', icon: <Clock size={16} /> },
    { id: 4, name: 'Rising Star', description: 'Top 10 in leaderboard', icon: <Trophy size={16} /> },
  ],
  stats: {
    sales: 17,
    earnings: 325,
    points: 780,
    rank: 7
  },
  recentActivities: [
    { id: 1, action: 'Made a sale', details: 'Eco-friendly notebook for $25', date: '2 days ago' },
    { id: 2, action: 'Updated business plan', details: 'Added new product line', date: '1 week ago' },
    { id: 3, action: 'Earned badge', details: 'Rising Star badge for reaching top 10', date: '2 weeks ago' },
  ]
};

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

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

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      location: profileData.location,
      school: profileData.school,
      grade: profileData.grade
    }
  });

  const handleSaveProfile = async (data) => {
    try {
      // In a real app, this would save to backend
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          <Edit size={16} className="mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <Card className="lg:col-span-1 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mb-4">
                {profileData.name.split(' ').map(n => n[0]).join('')}
              </div>
              
              <h2 className="text-xl font-bold">{profileData.name}</h2>
              <p className="text-muted-foreground mb-6">{profileData.role}</p>
              
              <div className="w-full space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Mail size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{profileData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Phone size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{profileData.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">{profileData.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <School size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">School</p>
                    <p className="text-sm font-medium">{profileData.school}</p>
                    <p className="text-xs text-muted-foreground">{profileData.grade}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Overview */}
          <Card className="animate-fade-in" style={{animationDelay: '0.1s'}}>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <p className="text-muted-foreground text-sm mb-1">Total Sales</p>
                  <p className="text-2xl font-bold">{profileData.stats.sales}</p>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <p className="text-muted-foreground text-sm mb-1">Earnings</p>
                  <p className="text-2xl font-bold text-success">${profileData.stats.earnings}</p>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <p className="text-muted-foreground text-sm mb-1">Points</p>
                  <p className="text-2xl font-bold text-primary">{profileData.stats.points}</p>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <p className="text-muted-foreground text-sm mb-1">Rank</p>
                  <p className="text-2xl font-bold text-accent">#{profileData.stats.rank}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for badges and activity */}
          <Tabs defaultValue="badges" className="animate-fade-in" style={{animationDelay: '0.2s'}}>
            <TabsList>
              <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="badges" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy size={18} className="text-accent" />
                    Earned Badges
                  </CardTitle>
                  <CardDescription>
                    Achievements unlocked through the program
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profileData.badges.map(badge => (
                      <div 
                        key={badge.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                          {badge.icon}
                        </div>
                        <div>
                          <p className="font-medium">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/rewards">View All Rewards</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest actions and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profileData.recentActivities.map(activity => (
                      <div 
                        key={activity.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.details}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">{activity.date}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveProfile)} className="space-y-4">
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
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="gap-2"
                >
                  <X size={16} />
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  <Save size={16} />
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
