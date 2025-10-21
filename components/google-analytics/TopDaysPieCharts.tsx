import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { ChartTooltipContent } from '../ui/chart';
import { ChartContainer } from '../ui/chart';
import { TopDayActivity } from './interfaces';

interface TopDaysPieChartsProps {
  topDaysActivity: TopDayActivity[];
  selectedDateRange: '1day' | '7days' | '28days';
  pieChartConfig: {
    'segment-1': { color: string };
    'segment-2': { color: string };
    'segment-3': { color: string };
    'segment-4': { color: string };
    'segment-5': { color: string };
    'segment-6': { color: string };
  };
}

export const TopDaysPieCharts: React.FC<TopDaysPieChartsProps> = ({
  topDaysActivity,
  selectedDateRange,
  pieChartConfig,
}) => {
  return (
    <div className="mt-4 flex flex-wrap gap-4 justify-center">
      {/* Active Users Pie Chart */}
      {topDaysActivity.some(day => day.activeUsers > 0) && (
        <div className="w-full md:flex-1 flex flex-col items-center justify-center p-4">
          <h4 className="mb-2 text-md font-semibold">Top Days by Activity</h4>
          <div className="flex flex-col items-center w-full md:flex-row md:items-center">
            <ChartContainer config={pieChartConfig} className="h-[250px] max-w-full md:w-2/3">
              <PieChart>
                <Pie
                  data={topDaysActivity
                    .sort((a, b) => b.activeUsers - a.activeUsers)
                    .slice(0, selectedDateRange === '28days' ? 5 : 3)
                    .map(day => ({ name: day.date, value: day.activeUsers }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {topDaysActivity
                    .sort((a, b) => b.activeUsers - a.activeUsers)
                    .slice(0, selectedDateRange === '28days' ? 5 : 3)
                    .map((entry, index) => (
                      <Cell key={`cell-${entry.date}-active`} fill={`hsl(var(--chart-${(index % 6) + 1}))`} />
                    ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col items-center sm:items-start gap-1.5 w-full md:w-1/3 text-sm text-muted-foreground">
              {topDaysActivity
                .sort((a, b) => b.activeUsers - a.activeUsers)
                .slice(0, selectedDateRange === '28days' ? 5 : 3)
                .map((entry, index) => (
                  <div key={`legend-${entry.date}-active`} className="flex items-center gap-1">
                    <div
                      className="h-2 w-2 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: `hsl(var(--chart-${(index % 6) + 1}))` }}
                    />
                    <span>{format(new Date(entry.date), 'MMM dd')}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Screen Page Views Pie Chart */}
      {topDaysActivity.some(day => day.screenPageViews > 0) && (
        <div className="w-full md:flex-1 flex flex-col items-center justify-center p-4">
          <h4 className="mb-2 text-md font-semibold">Screen Page Views by Day</h4>
          <div className="flex flex-col items-center w-full md:flex-row md:items-center">
            <ChartContainer config={pieChartConfig} className="h-[250px] max-w-full md:w-2/3">
              <PieChart>
                <Pie
                  data={topDaysActivity
                    .sort((a, b) => b.screenPageViews - a.screenPageViews)
                    .slice(0, selectedDateRange === '28days' ? 5 : 3)
                    .map(day => ({ name: day.date, value: day.screenPageViews }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {topDaysActivity
                    .sort((a, b) => b.screenPageViews - a.screenPageViews)
                    .slice(0, selectedDateRange === '28days' ? 5 : 3)
                    .map((entry, index) => (
                      <Cell key={`cell-${entry.date}-views`} fill={`hsl(var(--chart-${(index % 6) + 1}))`} />
                    ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col items-center sm:items-start gap-1.5 w-full md:w-1/3 text-sm text-muted-foreground">
              {topDaysActivity
                .sort((a, b) => b.screenPageViews - a.screenPageViews)
                .slice(0, selectedDateRange === '28days' ? 5 : 3)
                .map((entry, index) => (
                  <div key={`legend-${entry.date}-views`} className="flex items-center gap-1">
                    <div
                      className="h-2 w-2 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: `hsl(var(--chart-${(index % 6) + 1}))` }}
                    />
                    <span>{format(new Date(entry.date), 'MMM dd')}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
