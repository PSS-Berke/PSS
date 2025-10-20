import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AdMetricsTrend } from './interfaces';

interface AdPerformanceTrendChartProps {
  adMetricsTrend: AdMetricsTrend[];
}

export const AdPerformanceTrendChart: React.FC<AdPerformanceTrendChartProps> = ({
  adMetricsTrend,
}) => {
  if (adMetricsTrend.length === 0) return null;

  return (
    <div style={{ marginTop: '20px' }}>
      <h4>Ad Performance Trend</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={adMetricsTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="publisherAdClicks" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="publisherAdImpressions" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
