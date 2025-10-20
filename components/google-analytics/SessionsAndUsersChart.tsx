import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ChartData } from './interfaces';

interface SessionsAndUsersChartProps {
  dateChartData: ChartData[];
}

export const SessionsAndUsersChart: React.FC<SessionsAndUsersChartProps> = ({
  dateChartData,
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h4>Sessions and Users over Time</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dateChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar type="monotone" dataKey="sessions" fill="#8884d8" />
          <Bar type="monotone" dataKey="activeUsers" fill="#82ca9d" />
          <Bar type="monotone" dataKey="screenPageViews" fill="#ffc658" />
          <Bar type="monotone" dataKey="conversions" fill="#ff7300" />
          <Bar type="monotone" dataKey="totalRevenue" fill="#d0ed57" />
          <Bar type="monotone" dataKey="transactions" fill="#a4de6c" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
