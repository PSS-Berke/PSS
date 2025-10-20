import React from 'react';
import { ChartData } from './interfaces';

interface CountryChartDataTableProps {
  countryChartData: ChartData[];
}

export const CountryChartDataTable: React.FC<CountryChartDataTableProps> = ({
  countryChartData,
}) => {
  return (
    <div className="mt-4">
      <div className="rounded-md border">
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
      </div>
    </div>
  );
};
