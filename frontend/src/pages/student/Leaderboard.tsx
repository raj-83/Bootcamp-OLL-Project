import React, { useState, useEffect } from 'react';
import { Trophy, Filter, Search, Star, CheckCircle, Clock, IndianRupee } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserAvatar from '@/components/ui-custom/UserAvatar';

// Mock data for national leaderboard
const nationalStudentLeaderboard = [
  { id: 1, name: 'Alex Johnson', points: 1250, earnings: 345, school: 'Lincoln High School', rank: 1, nationalRank: 15, taskCompletion: 95, attendance: 98 },
  { id: 2, name: 'Samantha Lee', points: 1100, earnings: 290, school: 'Washington Academy', rank: 2, nationalRank: 23, taskCompletion: 92, attendance: 95 },
  { id: 3, name: 'Miguel Santos', points: 950, earnings: 210, school: 'Riverside Prep', rank: 3, nationalRank: 42, taskCompletion: 88, attendance: 90 },
  { id: 4, name: 'Emma Wilson', points: 900, earnings: 185, school: 'Oakwood High', rank: 4, nationalRank: 56, taskCompletion: 85, attendance: 92 },
  { id: 5, name: 'Jayden Brown', points: 850, earnings: 170, school: 'Lincoln High School', rank: 5, nationalRank: 78, taskCompletion: 82, attendance: 88 },
  { id: 6, name: 'Sophia Chen', points: 820, earnings: 165, school: 'Westlake Academy', rank: 6, nationalRank: 95, taskCompletion: 80, attendance: 86 },
  { id: 7, name: 'Ethan Miller', points: 780, earnings: 140, school: 'Riverside Prep', rank: 7, nationalRank: 112, taskCompletion: 78, attendance: 85 },
  { id: 8, name: 'Olivia Davis', points: 750, earnings: 120, school: 'Washington Academy', rank: 8, nationalRank: 143, taskCompletion: 75, attendance: 84 },
  { id: 9, name: 'Noah Garcia', points: 700, earnings: 110, school: 'Oakwood High', rank: 9, nationalRank: 187, taskCompletion: 72, attendance: 82 },
  { id: 10, name: 'Ava Martinez', points: 650, earnings: 95, school: 'Westlake Academy', rank: 10, nationalRank: 203, taskCompletion: 70, attendance: 80 },
];

// Mock data for batch leaderboard (smaller, more focused list)
const batchStudentLeaderboard = [
  { id: 7, name: 'Ethan Miller', points: 780, earnings: 140, school: 'Riverside Prep', rank: 1, nationalRank: 112, taskCompletion: 78, attendance: 85 },
  { id: 11, name: 'Lucas Wright', points: 620, earnings: 105, school: 'Riverside Prep', rank: 2, nationalRank: 231, taskCompletion: 68, attendance: 79 },
  { id: 12, name: 'Isabella Kim', points: 580, earnings: 95, school: 'Riverside Prep', rank: 3, nationalRank: 267, taskCompletion: 65, attendance: 76 },
  { id: 13, name: 'Mason Zhang', points: 540, earnings: 85, school: 'Riverside Prep', rank: 4, nationalRank: 302, taskCompletion: 62, attendance: 74 },
  { id: 14, name: 'Zoe Thompson', points: 510, earnings: 80, school: 'Riverside Prep', rank: 5, nationalRank: 348, taskCompletion: 60, attendance: 72 },
  { id: 15, name: 'Dylan Jackson', points: 480, earnings: 75, school: 'Riverside Prep', rank: 6, nationalRank: 392, taskCompletion: 58, attendance: 71 },
];

// Current user data (for highlighting and showing in the top stats)
const currentUserId = 7; // Ethan Miller

const StudentLeaderboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [leaderboardType, setLeaderboardType] = useState<'national' | 'batch'>('national');

  useEffect(() => {
    // Find the current user in the leaderboard
    const foundUser = nationalStudentLeaderboard.find(student => student.id === currentUserId);
    setCurrentUser(foundUser);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilters = () => {
    setFilterVisible(!filterVisible);
  };

  const filteredNationalStudents = nationalStudentLeaderboard.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.school.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBatchStudents = batchStudentLeaderboard.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.school.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                    ? currentUser.rank 
                    : batchStudentLeaderboard.find(s => s.id === currentUser.id)?.rank || '-'}
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
        <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
          <TabsTrigger value="national">National Leaderboard</TabsTrigger>
          <TabsTrigger value="batch">Batch Leaderboard</TabsTrigger>
        </TabsList>
        
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
                    key={student.id}
                    className={`grid grid-cols-12 py-3 px-4 items-center border-b last:border-0 hover:bg-muted/20 transition-colors ${student.id === currentUserId ? 'bg-primary/5' : ''}`}
                  >
                    <div className="col-span-1 text-center font-semibold">
                      {student.rank <= 3 ? (
                        <div className={`
                          w-6 h-6 mx-auto rounded-full flex items-center justify-center text-white
                          ${student.rank === 1 ? 'bg-yellow-500' : 
                            student.rank === 2 ? 'bg-gray-400' : 'bg-amber-700'}
                        `}>
                          {student.rank}
                        </div>
                      ) : (
                        student.rank
                      )}
                    </div>
                    <div className="col-span-3 sm:col-span-3 flex items-center gap-3">
                      <UserAvatar 
                        name={student.name} 
                        size="sm" 
                        highlight={student.id === currentUserId}
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
                    <div className="col-span-2 text-center text-success font-semibold">₹{student.earnings}</div>
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
        
        <TabsContent value="batch" className="mt-6">
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
                  <div className="col-span-1 hidden md:block text-center">Natl. Rank</div>
                  <div className="col-span-1 md:col-span-1 text-center">Tasks</div>
                  <div className="col-span-1 md:col-span-1 text-center">Attend.</div>
                  <div className="col-span-1 md:col-span-1 text-center">Points</div>
                  <div className="col-span-2 text-center">Earnings</div>
                </div>
                
                {filteredBatchStudents.map((student) => (
                  <div 
                    key={student.id}
                    className={`grid grid-cols-12 py-3 px-4 items-center border-b last:border-0 hover:bg-muted/20 transition-colors ${student.id === currentUserId ? 'bg-primary/5' : ''}`}
                  >
                    <div className="col-span-1 text-center font-semibold">
                      {student.rank <= 3 ? (
                        <div className={`
                          w-6 h-6 mx-auto rounded-full flex items-center justify-center text-white
                          ${student.rank === 1 ? 'bg-yellow-500' : 
                            student.rank === 2 ? 'bg-gray-400' : 'bg-amber-700'}
                        `}>
                          {student.rank}
                        </div>
                      ) : (
                        student.rank
                      )}
                    </div>
                    <div className="col-span-3 sm:col-span-3 flex items-center gap-3">
                      <UserAvatar 
                        name={student.name} 
                        size="sm" 
                        highlight={student.id === currentUserId}
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
                    <div className="col-span-2 text-center text-success font-semibold">₹{student.earnings}</div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentLeaderboard;
