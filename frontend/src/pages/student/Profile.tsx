
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

// Mock data
const initialProfileData = {
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
    { id: 2, name: 'School Creator', description: 'Created a business plan', icon: <Rocket size={16} /> },
    { id: 3, name: 'Early Bird', description: 'Joined in the first week', icon: <Clock size={16} /> },
    { id: 4, name: 'Rising Star', description: 'Top 10 in leaderboard', icon: <Trophy size={16} /> },
  ],
  stats: {
    sales: 17,
    earnings: 325,
    points: 780,
    rank: 7,
    nationalRank: 245
  },
  recentActivities: [
    { id: 1, action: 'Made a sale', details: 'Eco-friendly notebook for $25', date: '2 days ago' },
    { id: 2, action: 'Updated business plan', details: 'Added new product line', date: '1 week ago' },
    { id: 3, action: 'Earned badge', details: 'Rising Star badge for reaching top 10', date: '2 weeks ago' },
  ]
};

const Profile = () => {
  const [profileData, setProfileData] = useState(initialProfileData);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: profileData.name,
    email: profileData.email,
    phone: profileData.phone,
    location: profileData.location,
    school: profileData.school,
    grade: profileData.grade
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = () => {
    // Update the profile data
    setProfileData(prev => ({
      ...prev,
      name: editedProfile.name,
      email: editedProfile.email,
      phone: editedProfile.phone,
      location: editedProfile.location,
      school: editedProfile.school,
      grade: editedProfile.grade
    }));
    
    setIsEditModalOpen(false);
    
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
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
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats & Leaderboard */}
        <Card className="lg:col-span-2 animate-fade-in" style={{animationDelay: '0.1s'}}>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Your progress and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Sales</p>
                <p className="text-2xl font-bold">{profileData.stats.sales}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Earnings</p>
                <p className="text-2xl font-bold">${profileData.stats.earnings}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Batch Rank</p>
                <p className="text-2xl font-bold">#{profileData.stats.rank}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">National Rank</p>
                <p className="text-2xl font-bold">#{profileData.stats.nationalRank}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-3">Earned Badges</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {profileData.badges.map(badge => (
                  <div key={badge.id} className="border rounded-lg p-3 text-center hover:border-primary/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                      {badge.icon}
                    </div>
                    <p className="font-medium text-sm">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="animate-fade-in" style={{animationDelay: '0.2s'}}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profileData.recentActivities.map(activity => (
              <div 
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg border"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Check size={14} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.details}</p>
                </div>
                <div className="text-xs text-muted-foreground">{activity.date}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={editedProfile.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                value={editedProfile.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={editedProfile.phone}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                name="location"
                value={editedProfile.location}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="school" className="text-right">
                School Name
              </Label>
              <Input
                id="school"
                name="school"
                value={editedProfile.school}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grade" className="text-right">
                Grade
              </Label>
              <Input
                id="grade"
                name="grade"
                value={editedProfile.grade}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveProfile}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
