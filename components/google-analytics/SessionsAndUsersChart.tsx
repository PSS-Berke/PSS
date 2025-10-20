import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
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
        <LineChart data={dateChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sessions" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="activeUsers" stroke="#82ca9d" />
          <Line type="monotone" dataKey="screenPageViews" stroke="#ffc658" />
          <Line type="monotone" dataKey="conversions" stroke="#ff7300" />
          <Line type="monotone" dataKey="totalRevenue" stroke="#d0ed57" />
          <Line type="monotone" dataKey="transactions" stroke="#a4de6c" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
