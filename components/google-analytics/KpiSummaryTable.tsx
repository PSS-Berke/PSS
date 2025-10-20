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
    <div style={{ marginTop: '20px' }}>
      <h4>Key Performance Indicators (KPI) Summary Table</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Metric</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Sum</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Average</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Active Users</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{kpiSummary.activeUsers.sum}</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{kpiSummary.activeUsers.avg}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>New Users</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{kpiSummary.newUsers.sum}</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{kpiSummary.newUsers.avg}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Screen Page Views</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{kpiSummary.screenPageViews.sum}</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{kpiSummary.screenPageViews.avg}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Publisher Ad Clicks</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{kpiSummary.publisherAdClicks.sum}</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{kpiSummary.publisherAdClicks.avg}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Publisher Ad Impressions</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{kpiSummary.publisherAdImpressions.sum}</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{kpiSummary.publisherAdImpressions.avg}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
