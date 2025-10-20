import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { NewVsReturningData } from './interfaces';

interface NewVsReturningUsersPieChartProps {
  newVsReturningPieChartData: NewVsReturningData[];
  selectedDateRange: '1day' | '7days' | '28days';
}

export const NewVsReturningUsersPieChart: React.FC<NewVsReturningUsersPieChartProps> = ({
  newVsReturningPieChartData,
  selectedDateRange,
}) => {
  if (newVsReturningPieChartData.length === 0 || selectedDateRange === '1day') return null;

  return (
    <div style={{ marginTop: '20px' }}>
      <h4>New vs. Returning Users Ratio</h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={newVsReturningPieChartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {
              newVsReturningPieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#8884d8' : '#82ca9d'} />
              ))
            }
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
