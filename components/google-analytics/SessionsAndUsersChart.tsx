import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ChartData } from './interfaces';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '../ui/chart';

interface SessionsAndUsersChartProps {
  dateChartData: ChartData[];
}

const chartConfig = {
  sessions: { label: 'Sessions', color: 'hsl(var(--chart-1))' },
  activeUsers: { label: 'Active Users', color: 'hsl(var(--chart-6))' },
  screenPageViews: { label: 'Screen Page Views', color: 'hsl(var(--chart-2))' },
  conversions: { label: 'Conversions', color: 'hsl(var(--chart-4))' },
  totalRevenue: { label: 'Total Revenue', color: 'hsl(var(--chart-5))' },
  transactions: { label: 'Transactions', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig;

export const SessionsAndUsersChart: React.FC<SessionsAndUsersChartProps> = ({
  dateChartData,
}) => {
  return (
    <div className="mb-4">
      <h4 className="mb-2 text-md font-semibold">Sessions and Users over Time</h4>
      <ChartContainer config={chartConfig} className="h-[375px] w-full">
        <BarChart accessibilityLayer data={dateChartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          />
          <YAxis
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="sessions" fill="var(--color-sessions)" radius={4} />
          <Bar dataKey="activeUsers" fill="var(--color-activeUsers)" radius={4} />
          <Bar dataKey="screenPageViews" fill="var(--color-screenPageViews)" radius={4} />
          <Bar dataKey="conversions" fill="var(--color-conversions)" radius={4} />
          <Bar dataKey="totalRevenue" fill="var(--color-totalRevenue)" radius={4} />
          <Bar dataKey="transactions" fill="var(--color-transactions)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};
