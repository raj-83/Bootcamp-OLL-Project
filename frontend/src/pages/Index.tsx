
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Rocket, Users, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  className,
  style
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div 
    className={cn(
      "glass-card p-6 rounded-xl hover-card", 
      className
    )}
    style={style}
  >
    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4 sm:py-24">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block animate-fade-in">
            <span className="badge-primary mb-4">Summer 2025</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
            OLL Summer Business <span className="text-primary">Bootcamp</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
            Join our entrepreneurship program where students learn to create, market, and sell their own products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{animationDelay: '0.3s'}}>
            <Button size="lg" asChild>
              <Link to="/register">
                Get Started <ArrowRight className="ml-2" size={16} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Program Features</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Rocket size={24} />}
              title="Launch a Business"
              description="Create and sell your own products with guidance from experienced mentors."
              className="animate-fade-in"
              style={{animationDelay: '0.1s'}}
            />
            <FeatureCard 
              icon={<Users size={24} />}
              title="Mentor Support"
              description="Get personalized feedback and support from business professionals."
              className="animate-fade-in"
              style={{animationDelay: '0.2s'}}
            />
            <FeatureCard 
              icon={<Trophy size={24} />}
              title="Competitions"
              description="Compete with other students to earn badges and climb the leaderboard."
              className="animate-fade-in"
              style={{animationDelay: '0.3s'}}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Success Stories</h2>
          
          <div className="glass-card p-8 rounded-xl">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Star size={24} />
              </div>
              <p className="text-lg italic mb-6">
                "The bootcamp helped me turn my hobby into a real business. I learned so much about marketing and sales!"
              </p>
              <div>
                <p className="font-medium">Sarah Johnson</p>
                <p className="text-sm text-muted-foreground">Student, Age 16</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Business Journey?</h2>
          <p className="text-muted-foreground mb-8">Join hundreds of students who are building their entrepreneurial skills.</p>
          <Button size="lg" asChild>
            <Link to="/register">
              Register Now <ArrowRight className="ml-2" size={16} />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
