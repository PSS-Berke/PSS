import React from 'react';
import { ChartData } from './interfaces';

interface TopChartDataTableProps {
  countryChartData: ChartData[];
}

export const TopChartDataTable: React.FC<TopChartDataTableProps> = ({
  countryChartData,
}) => {
  const metrics = [
    { label: 'Sessions', key: 'sessions' },
    { label: 'Active Users', key: 'activeUsers' },
    { label: 'Screen Page Views', key: 'screenPageViews' },
    { label: 'Conversions', key: 'conversions' },
    { label: 'Total Revenue', key: 'totalRevenue' },
    { label: 'Transactions', key: 'transactions' },
  ];

  return (
    <div className="mt-4">

      {/* Desktop View */}
      <div className="hidden md:block rounded-md border">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Sessions</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Active Users</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Screen Page Views</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Conversions</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Total Revenue</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Transactions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {countryChartData.map((data, index) => (
              <tr key={index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{data.sessions || 0}</td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{data.activeUsers || 0}</td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{data.screenPageViews || 0}</td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{data.conversions || 0}</td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{data.totalRevenue || 0}</td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{data.transactions || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {countryChartData.length === 0 && <p className="p-4">No country data available.</p>}
      </div>

      {/* Mobile View */}
      <div className="md:hidden rounded-md border p-4">
        {countryChartData.map((data, index) => (
          <div key={index} className="mb-4 last:mb-0 rounded-md border p-4 shadow-sm">
            {metrics.map((metric) => (
              <div key={metric.key} className="flex flex-col sm:flex-row justify-between border-b last:border-b-0 py-2">
                <div className="font-medium sm:w-1/2">{metric.label}</div>
                <div className="sm:w-1/2 text-right sm:text-left lg:text-center">
                  {data[metric.key as keyof ChartData] !== undefined ? String(data[metric.key as keyof ChartData]) : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
