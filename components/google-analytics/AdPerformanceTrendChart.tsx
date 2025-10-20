import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AdMetricsTrend } from './interfaces';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '../ui/chart';

interface AdPerformanceTrendChartProps {
  adMetricsTrend: AdMetricsTrend[];
}

const chartConfig = {
  publisherAdClicks: { label: 'Ad Clicks', color: 'hsl(var(--chart-1))' },
  publisherAdImpressions: { label: 'Ad Impressions', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

export const AdPerformanceTrendChart: React.FC<AdPerformanceTrendChartProps> = ({
  adMetricsTrend,
}) => {
  if (adMetricsTrend.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="mb-2 text-md font-semibold">Ad Performance Trend</h4>
      <ChartContainer config={chartConfig} className="min-h-[300px]">
        <LineChart
          accessibilityLayer
          data={adMetricsTrend}
          margin={{ left: 12, right: 12 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            // tickFormatter={(value) => `$${value}`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            dataKey="publisherAdClicks"
            type="monotone"
            stroke="var(--color-publisherAdClicks)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="publisherAdImpressions"
            type="monotone"
            stroke="var(--color-publisherAdImpressions)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
};
