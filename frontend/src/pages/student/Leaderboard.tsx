import React, { useState, useEffect } from 'react';
import { Trophy, Filter, Search, Star, CheckCircle, Clock, IndianRupee } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserAvatar from '@/components/ui-custom/UserAvatar';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_REACT_API_URL || 'http://localhost:5000';

interface Student {
  _id: string;
  name: string;
  points: number;
  earning: number;
  school: string;
  batchRank: number;
  nationalRank: number;
  taskCompletion: number;
  attendance: number;
}

const StudentLeaderboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [leaderboardType, setLeaderboardType] = useState<'national' | 'batch'>('national');
  const [nationalStudents, setNationalStudents] = useState<Student[]>([]);
  const [batchStudents, setBatchStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaderboardData();
  }, [leaderboardType]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const studentId = localStorage.getItem('id');
      const batchId = localStorage.getItem('batchId');

      // Fetch national leaderboard
      const nationalResponse = await axios.get(`${API_URL}/api/students/leaderboard/national`);
      setNationalStudents(nationalResponse.data);

      // Fetch batch leaderboard if batchId exists
      if (batchId) {
        const batchResponse = await axios.get(`${API_URL}/api/students/leaderboard/batch/${batchId}`);
        setBatchStudents(batchResponse.data);
      }

      // Find current user in the data
      const currentUserData = nationalResponse.data.find((student: Student) => student._id === studentId);
      if (currentUserData) {
        setCurrentUser(currentUserData);
      }

      // Calculate ranks
      await axios.get(`${API_URL}/api/students/leaderboard/calculate`);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leaderboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilters = () => {
    setFilterVisible(!filterVisible);
  };

  const filteredNationalStudents = nationalStudents.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.school.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const filteredBatchStudents = batchStudents.filter(student => 
  //   student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   student.school.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading leaderboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Trophy size={24} className="text-accent" />
          <h1 className="text-2xl font-bold">Leaderboard</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <Button variant="outline" size="icon" onClick={toggleFilters}>
            <Filter size={18} />
          </Button>
        </div>
      </div>

      {/* User's rank highlight card */}
      {currentUser && (
        <Card className="bg-primary/5 border-primary/20 animate-fade-in">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  {leaderboardType === 'national' 
                    ? currentUser.nationalRank 
                    : batchStudents.find(s => s._id === currentUser._id)?.batchRank || '-'}
                </div>
                <div>
                  <h3 className="font-medium">Your Ranking</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentUser.name} • {currentUser.points} points
                  </p>
                </div>
              </div>
              <div className="bg-background rounded-lg px-4 py-2 text-center">
                <p className="text-sm text-muted-foreground">National Rank</p>
                <p className="text-xl font-bold">#{currentUser.nationalRank}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filterVisible && (
        <Card className="animate-fade-in">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="school">School</Label>
                <Input id="school" placeholder="All Schools" />
              </div>
              
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="All Cities" />
              </div>
              
              <div>
                <Label htmlFor="age">Age Group</Label>
                <Input id="age" placeholder="All Ages" />
              </div>
              
              <div>
                <Label htmlFor="type">Achievement Type</Label>
                <Input id="type" placeholder="All Types" />
              </div>
            </div>
            
            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" size="sm">Reset</Button>
              <Button size="sm">Apply Filters</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="national" onValueChange={(value) => setLeaderboardType(value as 'national' | 'batch')}>
        {/* <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
          <TabsTrigger value="national">National Leaderboard</TabsTrigger>
          <TabsTrigger value="batch">Batch Leaderboard</TabsTrigger>
        </TabsList> */}
        
        <TabsContent value="national" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>National Student Leaderboard</CardTitle>
              <CardDescription>Based on points earned from sales and achievements across all batches</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="rounded-md border min-w-[800px] sm:min-w-full">
                <div className="grid grid-cols-12 py-3 px-4 font-medium border-b bg-muted/50">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-3 sm:col-span-3">Student</div>
                  <div className="col-span-2 hidden sm:block">School</div>
                  <div className="col-span-1 hidden md:block text-center">Natl. Rank</div>
                  <div className="col-span-1 md:col-span-1 text-center">Tasks</div>
                  <div className="col-span-1 md:col-span-1 text-center">Attend.</div>
                  <div className="col-span-1 md:col-span-1 text-center">Points</div>
                  <div className="col-span-2 text-center">Earnings</div>
                </div>
                
                {filteredNationalStudents.map((student) => (
                  <div 
                    key={student._id}
                    className={`grid grid-cols-12 py-3 px-4 items-center border-b last:border-0 hover:bg-muted/20 transition-colors ${student._id === currentUser?._id ? 'bg-primary/5' : ''}`}
                  >
                    <div className="col-span-1 text-center font-semibold">
                      {student.nationalRank <= 3 ? (
                        <div className={`
                          w-6 h-6 mx-auto rounded-full flex items-center justify-center text-white
                          ${student.nationalRank === 1 ? 'bg-yellow-500' : 
                            student.nationalRank === 2 ? 'bg-gray-400' : 'bg-amber-700'}
                        `}>
                          {student.nationalRank}
                        </div>
                      ) : (
                        student.nationalRank
                      )}
                    </div>
                    <div className="col-span-3 sm:col-span-3 flex items-center gap-3">
                      <UserAvatar 
                        name={student.name} 
                        size="sm" 
                        highlight={student._id === currentUser?._id}
                      />
                      <span className="font-medium truncate">{student.name}</span>
                    </div>
                    <div className="col-span-2 hidden sm:block truncate">{student.school}</div>
                    <div className="col-span-1 hidden md:block text-center font-semibold">#{student.nationalRank}</div>
                    <div className="col-span-1 md:col-span-1 text-center">
                      <span className={`font-medium ${student.taskCompletion >= 90 ? 'text-success' : 
                        student.taskCompletion >= 70 ? 'text-warning' : 'text-muted-foreground'}`}>
                        {student.taskCompletion}%
                      </span>
                    </div>
                    <div className="col-span-1 md:col-span-1 text-center">
                      <span className={`font-medium ${student.attendance >= 90 ? 'text-success' : 
                        student.attendance >= 70 ? 'text-warning' : 'text-muted-foreground'}`}>
                        {student.attendance}%
                      </span>
                    </div>
                    <div className="col-span-1 md:col-span-1 text-center font-semibold">{student.points}</div>
                    <div className="col-span-2 text-center text-success font-semibold">₹{student.earning}</div>
                  </div>
                ))}
                
                {filteredNationalStudents.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    No students found matching your search.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* <TabsContent value="batch" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Student Leaderboard</CardTitle>
              <CardDescription>Based on points earned from sales and achievements within your current batch</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="rounded-md border min-w-[800px] sm:min-w-full">
                <div className="grid grid-cols-12 py-3 px-4 font-medium border-b bg-muted/50">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-3 sm:col-span-3">Student</div>
                  <div className="col-span-2 hidden sm:block">School</div>
                  <div className="col-span-1 hidden md:block text-center">Batch Rank</div>
                  <div className="col-span-1 md:col-span-1 text-center">Tasks</div>
                  <div className="col-span-1 md:col-span-1 text-center">Attend.</div>
                  <div className="col-span-1 md:col-span-1 text-center">Points</div>
                  <div className="col-span-2 text-center">Earnings</div>
                </div>
                
                {filteredBatchStudents.map((student) => (
                  <div 
                    key={student._id}
                    className={`grid grid-cols-12 py-3 px-4 items-center border-b last:border-0 hover:bg-muted/20 transition-colors ${student._id === currentUser?._id ? 'bg-primary/5' : ''}`}
                  >
                    <div className="col-span-1 text-center font-semibold">
                      {student.batchRank <= 3 ? (
                        <div className={`
                          w-6 h-6 mx-auto rounded-full flex items-center justify-center text-white
                          ${student.batchRank === 1 ? 'bg-yellow-500' : 
                            student.batchRank === 2 ? 'bg-gray-400' : 'bg-amber-700'}
                        `}>
                          {student.batchRank}
                        </div>
                      ) : (
                        student.batchRank
                      )}
                    </div>
                    <div className="col-span-3 sm:col-span-3 flex items-center gap-3">
                      <UserAvatar 
                        name={student.name} 
                        size="sm" 
                        highlight={student._id === currentUser?._id}
                      />
                      <span className="font-medium truncate">{student.name}</span>
                    </div>
                    <div className="col-span-2 hidden sm:block truncate">{student.school}</div>
                    <div className="col-span-1 hidden md:block text-center font-semibold">#{student.batchRank}</div>
                    <div className="col-span-1 md:col-span-1 text-center">
                      <span className={`font-medium ${student.taskCompletion >= 90 ? 'text-success' : 
                        student.taskCompletion >= 70 ? 'text-warning' : 'text-muted-foreground'}`}>
                        {student.taskCompletion}%
                      </span>
                    </div>
                    <div className="col-span-1 md:col-span-1 text-center">
                      <span className={`font-medium ${student.attendance >= 90 ? 'text-success' : 
                        student.attendance >= 70 ? 'text-warning' : 'text-muted-foreground'}`}>
                        {student.attendance}%
                      </span>
                    </div>
                    <div className="col-span-1 md:col-span-1 text-center font-semibold">{student.points}</div>
                    <div className="col-span-2 text-center text-success font-semibold">₹{student.earning}</div>
                  </div>
                ))}
                
                {filteredBatchStudents.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    No students found matching your search.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  );
};

export default StudentLeaderboard;