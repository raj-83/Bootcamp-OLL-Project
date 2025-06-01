import React, { useState, useEffect } from 'react';
import { Trophy, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserAvatar from '@/components/ui-custom/UserAvatar';

const apiUrl = import.meta.env.VITE_REACT_API_URL || "https://localhost:5000";

interface Student {
  _id: string;
  name: string;
  points: number;
  earning: number;
  school: string;
  nationalRank: number;
  taskCompletion: number;
  attendance: number;
}

const MentorLeaderboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/students/leaderboard/national`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      const data = await response.json();
      setStudents(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilters = () => {
    setFilterVisible(!filterVisible);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.school.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Trophy size={24} className="text-accent" />
          <h1 className="text-2xl font-bold">Student Leaderboard</h1>
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

      <Card>
        <CardHeader>
          <CardTitle>National Student Leaderboard</CardTitle>
          <CardDescription>Based on points earned from sales and achievements across all batches</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="rounded-md border min-w-[800px] sm:min-w-full">
            <div className="grid grid-cols-12 py-3 px-4 font-medium border-b bg-muted/50">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-3">Student</div>
              <div className="col-span-2 hidden sm:block">School</div>
              <div className="col-span-1 text-center">Tasks</div>
              <div className="col-span-1 text-center">Attend.</div>
              <div className="col-span-1 text-center">Points</div>
              <div className="col-span-2 text-center">Earnings</div>
            </div>
            
            {filteredStudents.map((student) => (
              <div 
                key={student._id}
                className="grid grid-cols-12 py-3 px-4 items-center border-b last:border-0 hover:bg-muted/20 transition-colors"
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
                <div className="col-span-3 flex items-center gap-3">
                  <UserAvatar name={student.name} size="sm" />
                  <span className="font-medium truncate">{student.name}</span>
                </div>
                <div className="col-span-2 hidden sm:block truncate">{student.school}</div>
                <div className="col-span-1 text-center">
                  <span className={`font-medium ${student.taskCompletion >= 90 ? 'text-success' : 
                    student.taskCompletion >= 70 ? 'text-warning' : 'text-muted-foreground'}`}>
                    {student.taskCompletion}%
                  </span>
                </div>
                <div className="col-span-1 text-center">
                  <span className={`font-medium ${student.attendance >= 90 ? 'text-success' : 
                    student.attendance >= 70 ? 'text-warning' : 'text-muted-foreground'}`}>
                    {student.attendance}%
                  </span>
                </div>
                <div className="col-span-1 text-center font-semibold">{student.points}</div>
                <div className="col-span-2 text-center text-success font-semibold">₹{student.earning}</div>
              </div>
            ))}
            
            {filteredStudents.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No students found matching your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorLeaderboard;
