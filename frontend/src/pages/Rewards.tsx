
import React from 'react';
import { Gift, Trophy, Award, Star, Check, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// Mock data
const badges = [
  { 
    id: 1, 
    name: 'First Sale', 
    description: 'Make your first product sale', 
    icon: <Award size={20} />, 
    color: 'primary',
    earned: true,
    date: 'July 15, 2023'
  },
  { 
    id: 2, 
    name: 'Business Creator', 
    description: 'Successfully create a business plan', 
    icon: <Star size={20} />, 
    color: 'secondary',
    earned: true,
    date: 'June 10, 2023'
  },
  { 
    id: 3, 
    name: 'Marketing Expert', 
    description: 'Create a marketing strategy for your business', 
    icon: <Trophy size={20} />, 
    color: 'accent',
    earned: true,
    date: 'July 24, 2023'
  },
  { 
    id: 4, 
    name: 'Sales Superstar', 
    description: 'Reach $100 in total sales', 
    icon: <Gift size={20} />, 
    color: 'success',
    earned: true,
    date: 'August 5, 2023'
  },
  { 
    id: 5, 
    name: 'Innovation Award', 
    description: 'Create a unique product offering', 
    icon: <Star size={20} />, 
    color: 'warning',
    earned: false,
    progress: 60
  },
  { 
    id: 6, 
    name: 'Customer Service Pro', 
    description: 'Receive 5 positive customer reviews', 
    icon: <Award size={20} />, 
    color: 'primary',
    earned: false,
    progress: 40
  },
  { 
    id: 7, 
    name: 'Top 10 Finisher', 
    description: 'Finish in the top 10 of the leaderboard', 
    icon: <Trophy size={20} />, 
    color: 'secondary',
    earned: false,
    progress: 80
  },
  { 
    id: 8, 
    name: 'Financial Wizard', 
    description: 'Create a detailed financial plan', 
    icon: <Star size={20} />, 
    color: 'accent',
    earned: false,
    progress: 10
  },
];

const skillTitansProgress = {
  salesGoal: { current: 325, target: 500 },
  pitchScore: { current: 85, target: 100 },
  mentorRating: { current: 4.2, target: 5 },
  leaderboardRank: { current: 7, target: 5 },
  totalPoints: { current: 780, target: 1000 }
};

const Rewards = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Gift size={24} className="text-accent" />
        <h1 className="text-2xl font-bold">Rewards & Achievements</h1>
      </div>

      <Tabs defaultValue="badges" className="animate-fade-in">
        <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="skill-titans">Skill Titans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="badges" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {badges.map(badge => (
              <Card key={badge.id} className={`hover-card ${badge.earned ? 'border-opacity-100' : 'border-opacity-50'}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-${badge.color} bg-${badge.color}/10`}>
                      {badge.icon}
                    </div>
                    {badge.earned ? (
                      <div className="badge-success">
                        <Check size={12} className="mr-1" />
                        Earned
                      </div>
                    ) : (
                      <div className="badge-basic bg-muted text-muted-foreground">
                        <Lock size={12} className="mr-1" />
                        Locked
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-lg mb-1">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                  
                  {badge.earned ? (
                    <p className="text-xs text-muted-foreground">Earned on {badge.date}</p>
                  ) : (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{badge.progress}%</span>
                      </div>
                      <Progress value={badge.progress} className="h-1.5" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="skill-titans" className="mt-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy size={20} className="text-accent" />
                Skill Titans Qualification
              </CardTitle>
              <CardDescription>
                Track your progress toward qualifying for the exclusive Skill Titans program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">Sales Goal</div>
                    <div className="text-sm">${skillTitansProgress.salesGoal.current} / ${skillTitansProgress.salesGoal.target}</div>
                  </div>
                  <Progress 
                    value={(skillTitansProgress.salesGoal.current / skillTitansProgress.salesGoal.target) * 100} 
                    className="h-2" 
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">Business Pitch Score</div>
                    <div className="text-sm">{skillTitansProgress.pitchScore.current} / {skillTitansProgress.pitchScore.target}</div>
                  </div>
                  <Progress 
                    value={(skillTitansProgress.pitchScore.current / skillTitansProgress.pitchScore.target) * 100} 
                    className="h-2" 
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">Mentor Rating</div>
                    <div className="text-sm">{skillTitansProgress.mentorRating.current} / {skillTitansProgress.mentorRating.target}</div>
                  </div>
                  <Progress 
                    value={(skillTitansProgress.mentorRating.current / skillTitansProgress.mentorRating.target) * 100} 
                    className="h-2" 
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">Leaderboard Ranking</div>
                    <div className="text-sm">#{skillTitansProgress.leaderboardRank.current} / #{skillTitansProgress.leaderboardRank.target}</div>
                  </div>
                  <Progress 
                    value={((skillTitansProgress.leaderboardRank.target + 1 - skillTitansProgress.leaderboardRank.current) / skillTitansProgress.leaderboardRank.target) * 100} 
                    className="h-2" 
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">Total Points</div>
                    <div className="text-sm">{skillTitansProgress.totalPoints.current} / {skillTitansProgress.totalPoints.target}</div>
                  </div>
                  <Progress 
                    value={(skillTitansProgress.totalPoints.current / skillTitansProgress.totalPoints.target) * 100} 
                    className="h-2" 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                You are 65% of the way to qualifying for the Skill Titans program. Keep up the good work!
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Skill Titans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Skill Titans is our exclusive program for top-performing students who demonstrate exceptional business acumen and entrepreneurial potential.
              </p>

              <h3 className="font-semibold mb-2">Program Benefits:</h3>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-success mt-0.5" />
                  <span>Exclusive mentorship from industry leaders</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-success mt-0.5" />
                  <span>Access to additional funding opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-success mt-0.5" />
                  <span>Invitation to special networking events</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-success mt-0.5" />
                  <span>Summer internship opportunities with partner companies</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-success mt-0.5" />
                  <span>Special recognition at the end-of-program ceremony</span>
                </li>
              </ul>

              <h3 className="font-semibold mb-2">Qualification Requirements:</h3>
              <p className="text-muted-foreground">
                To qualify for Skill Titans, you need to meet the minimum requirements in all five categories shown in the progress tracker above.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Learn More</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Rewards;
