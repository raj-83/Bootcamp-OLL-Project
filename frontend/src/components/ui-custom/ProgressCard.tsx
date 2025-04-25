
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProgressCardProps {
  title: string;
  value: number;
  maxValue: number;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'accent' | 'warning' | 'destructive';
  subtitle?: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  maxValue,
  icon,
  color = 'primary',
  subtitle
}) => {
  const percentage = Math.min(Math.round((value / maxValue) * 100), 100);
  
  const colorClasses = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-success text-success-foreground",
    accent: "bg-accent text-accent-foreground",
    warning: "bg-warning text-warning-foreground",
    destructive: "bg-destructive text-destructive-foreground",
  };
  
  const bgColorClasses = {
    primary: "bg-primary/20",
    secondary: "bg-secondary/20",
    success: "bg-success/20",
    accent: "bg-accent/20",
    warning: "bg-warning/20",
    destructive: "bg-destructive/20",
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          {value} {maxValue && <span className="text-muted-foreground text-sm font-normal">/ {maxValue}</span>}
        </div>
        
        {subtitle && (
          <p className="text-sm text-muted-foreground mb-2">{subtitle}</p>
        )}
        
        <div className="progress-bar">
          <div 
            className={cn("progress-bar-fill", colorClasses[color])}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
