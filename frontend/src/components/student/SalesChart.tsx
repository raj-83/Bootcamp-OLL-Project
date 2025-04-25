
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesData {
  date: string;
  amount: number;
}

interface SalesChartProps {
  data: SalesData[];
  title?: string;
  description?: string;
}

const SalesChart: React.FC<SalesChartProps> = ({ 
  data, 
  title = "Sales History", 
  description = "Your daily sales performance over time" 
}) => {
  // Format dates for display
  const formattedData = data.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  // Calculate total sales
  const totalSales = data.reduce((sum, item) => sum + item.amount, 0);

  // Find the day with highest sales
  const highestSale = Math.max(...data.map(item => item.amount));
  const bestDay = data.find(item => item.amount === highestSale);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold">${totalSales}</p>
          </div>
          {bestDay && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Best Day</p>
              <p className="text-2xl font-bold">${bestDay.amount}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(bestDay.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          )}
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="formattedDate" 
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                tickFormatter={(value) => `$${value}`}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Sales']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary) / 0.2)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
