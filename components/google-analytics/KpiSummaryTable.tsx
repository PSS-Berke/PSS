import React from 'react';
import { KpiSummary } from './interfaces';

interface KpiSummaryTableProps {
  kpiSummary: KpiSummary | null;
}

export const KpiSummaryTable: React.FC<KpiSummaryTableProps> = ({
  kpiSummary,
}) => {
  if (!kpiSummary) return null;

  return (
    <div className="mt-4">
      <h4 className="mb-2 text-md font-semibold">KPI Summary Table</h4>
      <div className="rounded-md border overflow-x-scroll">
        <table className="w-full caption-bottom text-sm max-sm:min-w-[600px]">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Metric</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Sum</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Average</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            <tr>
            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">Active Users</td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{kpiSummary.activeUsers.sum}</td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{kpiSummary.activeUsers.avg}</td>
            </tr>
            <tr>
            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">New Users</td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{kpiSummary.newUsers.sum}</td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{kpiSummary.newUsers.avg}</td>
            </tr>
            <tr>
            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">Screen Page Views</td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{kpiSummary.screenPageViews.sum}</td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{kpiSummary.screenPageViews.avg}</td>
            </tr>
            <tr>
            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">Publisher Ad Clicks</td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{kpiSummary.publisherAdClicks.sum}</td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{kpiSummary.publisherAdClicks.avg}</td>
            </tr>
            <tr>
            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">Publisher Ad Impressions</td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{kpiSummary.publisherAdImpressions.sum}</td>
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{kpiSummary.publisherAdImpressions.avg}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
