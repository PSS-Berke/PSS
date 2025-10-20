import React from 'react';
import { TopDayActivity } from './interfaces';

interface TopDaysActivityTableProps {
  topDaysActivity: TopDayActivity[];
}

export const TopDaysActivityTable: React.FC<TopDaysActivityTableProps> = ({
  topDaysActivity,
}) => {
  if (topDaysActivity.length === 0) return null;

  return (
    <div style={{ marginTop: '20px' }}>
      <h4>Top Days by Activity</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Active Users</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>New Users</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Screen Page Views</th>
          </tr>
        </thead>
        <tbody>
          {topDaysActivity.map((day) => (
            <tr key={day.date} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{day.date}</td>
              <td style={{ padding: '8px' }}>{day.activeUsers}</td>
              <td style={{ padding: '8px' }}>{day.newUsers}</td>
              <td style={{ padding: '8px' }}>{day.screenPageViews}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
