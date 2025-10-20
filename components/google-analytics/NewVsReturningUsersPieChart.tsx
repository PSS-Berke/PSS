import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { NewVsReturningData } from './interfaces';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '../ui/chart';

interface NewVsReturningUsersPieChartProps {
  newVsReturningPieChartData: NewVsReturningData[];
  selectedDateRange: '1day' | '7days' | '28days';
}

const chartConfig = {
  'New Users': { label: 'New Users', color: 'hsl(var(--chart-1))' },
  'Returning Users': { label: 'Returning Users', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

export const NewVsReturningUsersPieChart: React.FC<NewVsReturningUsersPieChartProps> = ({
  newVsReturningPieChartData,
  selectedDateRange,
}) => {
  if (newVsReturningPieChartData.length === 0 || selectedDateRange === '1day') return null;

  return (
    <div className="mt-4">
      <h4 className="mb-2 text-md font-semibold">New vs. Returning Users Ratio</h4>
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <PieChart>
          <Pie
            data={newVsReturningPieChartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={50}
            // fill="#8884d8" // Removed inline fill
            label
          >
            {
              newVsReturningPieChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartConfig[entry.name as keyof typeof chartConfig]?.color || `hsl(var(--chart-${index + 1}))`}
                />
              ))
            }
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
        </PieChart>
      </ChartContainer>
    </div>
  );
};
