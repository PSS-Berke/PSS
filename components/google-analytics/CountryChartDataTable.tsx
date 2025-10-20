import React from 'react';
import { ChartData } from './interfaces';

interface CountryChartDataTableProps {
  countryChartData: ChartData[];
}

export const CountryChartDataTable: React.FC<CountryChartDataTableProps> = ({
  countryChartData,
}) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Sessions</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Active Users</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Screen Page Views</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Conversions</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Total Revenue</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Transactions</th>
          </tr>
        </thead>
        <tbody>
          {countryChartData.map((data, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{data.sessions || 0}</td>
              <td style={{ padding: '8px' }}>{data.activeUsers || 0}</td>
              <td style={{ padding: '8px' }}>{data.screenPageViews || 0}</td>
              <td style={{ padding: '8px' }}>{data.conversions || 0}</td>
              <td style={{ padding: '8px' }}>{data.totalRevenue || 0}</td>
              <td style={{ padding: '8px' }}>{data.transactions || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
