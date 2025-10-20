import { format, parse } from 'date-fns';
import {
  GoogleAccountSummaryResponse,
  ChartData,
  KpiSummary,
  TopDayActivity,
  AdMetricsTrend,
  OverallSummaryItem,
  NewVsReturningData,
  CalculatedKPIs,
  ProcessedSummaryData,
} from './interfaces';

export const processSummaryDataForCharts = (
  summary: GoogleAccountSummaryResponse | null,
  metrics: Array<{ name: string }>,
  dimensions: Array<{ name: string }>,
): ProcessedSummaryData => {
  if (!summary || !summary.rows) return {
    dateChartData: [],
    countryChartData: [],
    kpiSummary: { activeUsers: { sum: 0, avg: 0 }, newUsers: { sum: 0, avg: 0 }, screenPageViews: { sum: 0, avg: 0 }, publisherAdClicks: { sum: 0, avg: 0 }, publisherAdImpressions: { sum: 0, avg: 0 } },
    topDaysActivity: [],
    adMetricsTrend: [], // Added adMetricsTrend initialization
    overallSummary: [],
    newVsReturningPieChartData: [],
    calculatedKPIs: { newUsersShare: '0%', viewsPerUser: '0', ctr: '0%' },
  };

  const dateChartMap = new Map<string, ChartData>();
  const countryChartMap = new Map<string, ChartData>();

  let totalActiveUsers = 0;
  let totalNewUsers = 0;
  let totalScreenPageViews = 0;
  let totalPublisherAdClicks = 0;
  let totalPublisherAdImpressions = 0;
  let daysWithData = 0;

  const dailyActivityData: TopDayActivity[] = [];

  summary.rows.forEach((row) => {
    const dimensionValues = row.dimensionValues.map((d) => d.value);
    const metricValues = row.metricValues.map((m) => parseFloat(m.value));

    const dateIndex = dimensions.findIndex((d) => d.name === 'date');
    const countryIndex = dimensions.findIndex((d) => d.name === 'country');

    const date = dateIndex !== -1 ? dimensionValues[dateIndex] : 'Unknown Date';
    const formattedDate = date !== 'Unknown Date' ? format(parse(date, 'yyyyMMdd', new Date()), 'yyyy-MM-dd') : 'Unknown Date';
    const country = countryIndex !== -1 ? dimensionValues[countryIndex] : 'Unknown Country';

    // Aggregate for Date Chart
    if (dateIndex !== -1) {
      if (!dateChartMap.has(formattedDate)) {
        dateChartMap.set(formattedDate, { name: formattedDate } as ChartData);
      }
      const currentData = dateChartMap.get(formattedDate)!;
      metrics.forEach((metric, idx) => {
        currentData[metric.name] = (currentData[metric.name] || 0) + (metricValues[idx] || 0);
      });

      // For aggregated data and daily activity table
      const activeUsers = metricValues[metrics.findIndex(m => m.name === 'activeUsers')] || 0;
      const newUsers = metricValues[metrics.findIndex(m => m.name === 'newUsers')] || 0;
      const screenPageViews = metricValues[metrics.findIndex(m => m.name === 'screenPageViews')] || 0;
      const publisherAdClicks = metricValues[metrics.findIndex(m => m.name === 'publisherAdClicks')] || 0;
      const publisherAdImpressions = metricValues[metrics.findIndex(m => m.name === 'publisherAdImpressions')] || 0;

      totalActiveUsers += activeUsers;
      totalNewUsers += newUsers;
      totalScreenPageViews += screenPageViews;
      totalPublisherAdClicks += publisherAdClicks;
      totalPublisherAdImpressions += publisherAdImpressions;
      daysWithData++;

      dailyActivityData.push({
        date: formattedDate,
        activeUsers: activeUsers,
        newUsers: newUsers,
        screenPageViews: screenPageViews,
      });
    }

    // Aggregate for Country Chart
    if (countryIndex !== -1) {
      if (!countryChartMap.has(country)) {
        countryChartMap.set(country, { name: country } as ChartData);
      }
      const currentData = countryChartMap.get(country)!;
      metrics.forEach((metric, idx) => {
        currentData[metric.name] = (currentData[metric.name] || 0) + (metricValues[idx] || 0);
      });
    }
  });

  const dateChartData = Array.from(dateChartMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  const countryChartData = Array.from(countryChartMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  // Calculate KPIs
  const avgActiveUsers = daysWithData > 0 ? totalActiveUsers / daysWithData : 0;
  const avgNewUsers = daysWithData > 0 ? totalNewUsers / daysWithData : 0;
  const avgScreenPageViews = daysWithData > 0 ? totalScreenPageViews / daysWithData : 0;
  const avgPublisherAdClicks = daysWithData > 0 ? totalPublisherAdClicks / daysWithData : 0;
  const avgPublisherAdImpressions = daysWithData > 0 ? totalPublisherAdImpressions / daysWithData : 0;

  const kpiSummary: KpiSummary = {
    activeUsers: { sum: totalActiveUsers, avg: parseFloat(avgActiveUsers.toFixed(2)) },
    newUsers: { sum: totalNewUsers, avg: parseFloat(avgNewUsers.toFixed(2)) },
    screenPageViews: { sum: totalScreenPageViews, avg: parseFloat(avgScreenPageViews.toFixed(2)) },
    publisherAdClicks: { sum: totalPublisherAdClicks, avg: parseFloat(avgPublisherAdClicks.toFixed(2)) },
    publisherAdImpressions: { sum: totalPublisherAdImpressions, avg: parseFloat(avgPublisherAdImpressions.toFixed(2)) },
  };

  const topDaysActivity = [...dailyActivityData]
    .sort((a, b) => b.activeUsers - a.activeUsers)
    .slice(0, 5);

  const overallSummary: OverallSummaryItem[] = [
    { metric: 'Active Users (sum)', value: totalActiveUsers },
    { metric: 'New Users (sum)', value: totalNewUsers },
    { metric: 'Screen Page Views/Screens (sum)', value: totalScreenPageViews },
    { metric: 'Average daily active users', value: parseFloat(avgActiveUsers.toFixed(2)) },
    { metric: 'Average daily screen page views/screens', value: parseFloat(avgScreenPageViews.toFixed(2)) },
    { metric: 'Publisher Ad Clicks (sum)', value: totalPublisherAdClicks },
    { metric: 'Publisher Ad Impressions (sum)', value: totalPublisherAdImpressions },
  ];

  const adMetricsTrend: AdMetricsTrend[] = dailyActivityData.map(day => ({
    date: day.date,
    publisherAdClicks: dateChartMap.get(day.date)?.publisherAdClicks || 0,
    publisherAdImpressions: dateChartMap.get(day.date)?.publisherAdImpressions || 0,
  })).sort((a,b) => a.date.localeCompare(b.date));

  // For Pie Chart (New vs. Returning Users)
  const returningUsers = totalActiveUsers - totalNewUsers;
  const newVsReturningPieChartData: NewVsReturningData[] = [
    { name: 'New Users', value: totalNewUsers },
    { name: 'Returning Users', value: returningUsers > 0 ? returningUsers : 0 },
  ];

  // Calculated KPIs
  const newUsersShare = totalActiveUsers > 0 ? `${((totalNewUsers / totalActiveUsers) * 100).toFixed(2)}%` : '0%';
  const viewsPerUser = totalActiveUsers > 0 ? (totalScreenPageViews / totalActiveUsers).toFixed(2) : '0';
  const ctr = totalPublisherAdImpressions > 0 ? `${((totalPublisherAdClicks / totalPublisherAdImpressions) * 100).toFixed(2)}%` : '0%';

  const calculatedKPIs: CalculatedKPIs = {
    newUsersShare,
    viewsPerUser,
    ctr,
  };

  return {
    dateChartData,
    countryChartData,
    kpiSummary,
    topDaysActivity,
    adMetricsTrend,
    overallSummary,
    newVsReturningPieChartData,
    calculatedKPIs,
  };
};
