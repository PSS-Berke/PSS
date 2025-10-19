import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/xano/auth-context';
import { apiRequest } from '@/lib/xano/api';
import { XANO_CONFIG, getGoogleAnalyticsApiUrl } from '@/lib/xano/config';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, parse } from 'date-fns';
// import FullCalendar from '@fullcalendar/react'; // Removed FullCalendar import
// import dayGridPlugin from '@fullcalendar/daygrid'; // Removed dayGridPlugin import
// import { EventInput } from '@fullcalendar/core'; // Removed EventInput import

interface PropertySummary {
  property: string;
  displayName: string;
  propertyType: string;
  parent: string;
}

interface GooglePropertiesResponse {
  ap: {
    request: any;
    response: {
      headers: any;
      result: {
        accountSummaries: AccountSummary[];
      };
      status: number;
    };
  };
}

interface AccountSummary {
  name: string;
  account: string;
  displayName: string;
  propertySummaries: PropertySummary[];
}

interface GoogleAccountSummaryResponse {
  dimensionHeaders: Array<{ name: string }>;
  metricHeaders: Array<any>; // Simplified, can be more detailed if needed
  rows: Array<{
    dimensionValues: Array<{ value: string }>;
    metricValues: Array<{ value: string }>;
  }>;
  rowCount: number;
  metadata: {
    currencyCode: string;
    timeZone: string;
  };
  kind: string;
}

  type ChartData = {
    name: string;
  } & { [key: string]: number };

  interface KpiSummary {
    activeUsers: { sum: number; avg: number };
    newUsers: { sum: number; avg: number };
    screenPageViews: { sum: number; avg: number };
    publisherAdClicks: { sum: number; avg: number };
    publisherAdImpressions: { sum: number; avg: number };
  }

  interface TopDayActivity {
    date: string;
    activeUsers: number;
    newUsers: number;
    screenPageViews: number;
  }

  interface AdMetricsTrend {
    date: string;
    publisherAdClicks: number;
    publisherAdImpressions: number;
  }

  interface OverallSummaryItem {
    metric: string;
    value: number | string;
  }

  interface NewVsReturningData {
    name: string;
    value: number;
  }

  interface CalculatedKPIs {
    newUsersShare: string;
    viewsPerUser: string;
    ctr: string;
  }

  interface ProcessedSummaryData {
    dateChartData: ChartData[];
    countryChartData: ChartData[];
    kpiSummary: KpiSummary;
    topDaysActivity: TopDayActivity[];
    adMetricsTrend: AdMetricsTrend[];
    overallSummary: OverallSummaryItem[];
    newVsReturningPieChartData: NewVsReturningData[];
    calculatedKPIs: CalculatedKPIs;
  }

  const processSummaryDataForCharts = (
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

export default function GaPage() {
  const { user, isLoading, token } = useAuth();
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [accountDataResponse, setAccountDataResponse] = useState<string | null>(null);
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<GoogleAccountSummaryResponse | null>(null);
  const [dateChartData, setDateChartData] = useState<ChartData[]>([]);
  const [countryChartData, setCountryChartData] = useState<ChartData[]>([]);
  const [kpiSummary, setKpiSummary] = useState<KpiSummary | null>(null);
  const [topDaysActivity, setTopDaysActivity] = useState<TopDayActivity[]>([]);
  const [adMetricsTrend, setAdMetricsTrend] = useState<AdMetricsTrend[]>([]);
  const [overallSummary, setOverallSummary] = useState<OverallSummaryItem[]>([]);
  const [newVsReturningPieChartData, setNewVsReturningPieChartData] = useState<NewVsReturningData[]>([]);
  const [calculatedKPIs, setCalculatedKPIs] = useState<CalculatedKPIs | null>(null);

  type DateRangeKey = '1day' | '7days' | '28days'; // Removed 'custom' from DateRangeKey

  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeKey>('28days');
  // const [customStartDate, setCustomStartDate] = useState<Date | null>(null); // Removed customStartDate state
  // const [customEndDate, setCustomEndDate] = useState<Date | null>(null); // Removed customEndDate state

  const calculateDateRange = (range: DateRangeKey, start: Date | null, end: Date | null) => {
    const today = startOfDay(new Date());
    let startDate: Date | null = null;
    let endDate: Date | null = endOfDay(new Date());

    switch (range) {
      case '1day':
        startDate = subDays(today, 0);
        break;
      case '7days':
        startDate = subDays(today, 6);
        break;
      case '28days':
        startDate = subDays(today, 27);
        break;
      // case 'custom': // Removed custom case
      //   startDate = start;
      //   endDate = end;
      //   break;
      default:
        startDate = subDays(today, 27); // Default to 28 days
        break;
    }

    return { startDate: startDate ? format(startDate, 'yyyy-MM-dd') : null, endDate: endDate ? format(endDate, 'yyyy-MM-dd') : null };
  };

  // const renderEventContent = (eventInfo: any) => { // Removed renderEventContent function
  //   return (
  //     <>
  //       <b>{eventInfo.event.title}</b>
  //       <p>{format(eventInfo.event.start, 'yyyy-MM-dd')}</p>
  //     </>
  //   );
  // };

  // const calendarEvents = useMemo(() => { // Removed calendarEvents useMemo
  //   const events: EventInput[] = [];
  //   if (customStartDate) {
  //     events.push({ title: 'Start', start: customStartDate });
  //   }
  //   if (customEndDate) {
  //     events.push({ title: 'End', start: customEndDate });
  //   }
  //   if (customStartDate && customEndDate && customStartDate < customEndDate) {
  //     events.push({ start: customStartDate, end: customEndDate, display: 'background', color: '#e6ffe6' });
  //   }
  //   return events;
  // }, [customStartDate, customEndDate]);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!token || !user?.id) {
        setPropertiesLoading(false);
        return;
      }

      setPropertiesLoading(true);
      setPropertiesError(null);

      try {
        const response = await apiRequest<
          GooglePropertiesResponse
        >(
          getGoogleAnalyticsApiUrl(XANO_CONFIG.ENDPOINTS.GOOGLE_ANALYTICS.PROPERTIES) + `?user_id=${user.id}`,
          { method: 'GET' },
          token,
        );

        if (response?.ap?.response?.result?.accountSummaries) {
          const allProperties: PropertySummary[] = [];
          response.ap.response.result.accountSummaries.forEach((accountSummary: AccountSummary) => {
            allProperties.push(...accountSummary.propertySummaries);
          });
          setProperties(allProperties);
        } else {
          setPropertiesError('Failed to retrieve Google Analytics properties.');
        }
      } catch (error: any) {
        console.error('Error retrieving Google Analytics properties:', error);
        setPropertiesError(
          `Error getting properties: ${error.message || 'Unknown error'}`,
        );
      } finally {
        setPropertiesLoading(false);
      }
    };

    fetchProperties();
  }, [token, user?.id]);

  useEffect(() => {
    if (expandedPropertyId) {
      handlePropertyClick(expandedPropertyId, true);
    }
  }, [selectedDateRange]);

  const handlePropertyClick = async (propertyId: string, isDateRangeChange: boolean = false) => {
    if (!isDateRangeChange && expandedPropertyId === propertyId) {
      setExpandedPropertyId(null);
      setSummaryData(null);
      // Reset all data when collapsing
      setDateChartData([]);
      setCountryChartData([]);
      setKpiSummary(null);
      setTopDaysActivity([]);
      setAdMetricsTrend([]);
      setOverallSummary([]);
      setNewVsReturningPieChartData([]);
      setCalculatedKPIs(null);
      return;
    }

    if (expandedPropertyId !== propertyId) {
      setExpandedPropertyId(propertyId);
    }

    setSummaryLoading(true);
    setSummaryError(null);
    setSummaryData(null);
    setDateChartData([]);
    setCountryChartData([]);
    setKpiSummary(null);
    setTopDaysActivity([]);
    setAdMetricsTrend([]);
    setOverallSummary([]);
    setNewVsReturningPieChartData([]);
    setCalculatedKPIs(null);

    if (!token || !user?.id || !user?.company_id) {
      setSummaryError('The user is not authenticated, the user ID or company ID is missing.');
      setSummaryLoading(false);
      return;
    }

    try {
      const numericPropertyId = propertyId.split('/').pop();
      if (!numericPropertyId) {
        setSummaryError('Failed to extract the numeric property ID.');
        setSummaryLoading(false);
        return;
      }

      const { startDate: formattedStartDate, endDate: formattedEndDate } = calculateDateRange(selectedDateRange, null, null); // Updated call to calculateDateRange

      const payload = {
        company_id: user.company_id,
        property_id: numericPropertyId,
        user_id: user.id.toString(),
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'conversions' },
          { name: 'totalRevenue' },
          { name: 'transactions' },
          { name: 'newUsers' },
          { name: 'publisherAdClicks' },
          { name: 'publisherAdImpressions' },
        ],
        dimensions: [{ name: 'date' }, { name: 'country' }],
        dateRanges: [
          { startDate: '30daysAgo', endDate: 'today' }, // Default to last 30 days
        ],
      };

      const apiUrl = getGoogleAnalyticsApiUrl(XANO_CONFIG.ENDPOINTS.GOOGLE_ANALYTICS.ACCOUNT_SUMMARY);
      console.log('Sending POST request to Account Summary:', apiUrl, payload);

      const response = await apiRequest<GoogleAccountSummaryResponse>(
        apiUrl,
        {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        },
        token,
      );
      setSummaryData(response);

      const processedData: ProcessedSummaryData = processSummaryDataForCharts(
        response,
        payload.metrics,
        payload.dimensions,
      );
      setDateChartData(processedData.dateChartData);
      setCountryChartData(processedData.countryChartData);
      setKpiSummary(processedData.kpiSummary);
      setTopDaysActivity(processedData.topDaysActivity);
      setAdMetricsTrend(processedData.adMetricsTrend);
      setOverallSummary(processedData.overallSummary);
      setNewVsReturningPieChartData(processedData.newVsReturningPieChartData);
      setCalculatedKPIs(processedData.calculatedKPIs);
    } catch (error: any) {
      console.error('Error retrieving Google Analytics account summary:', error);
      setSummaryError(
        `Error retrieving account summary: ${error.message || 'Unknown error'}`,
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleTestApiCall = async () => {
    // Existing test API call logic (kept for reference, but new logic for properties is above)
    setApiLoading(true);
    setApiError(null);
    setApiResponse(null);

    if (!token) {
      setApiError('User not authenticated. Token missing.');
      setApiLoading(false);
      return;
    }

    try {
      const response = await apiRequest('/test-endpoint', { method: 'GET' }, token);
      setApiResponse(JSON.stringify(response, null, 2));
    } catch (error: any) {
      console.error('Xano API call failed:', error);
      setApiError(`Error while calling API: ${error.message || 'Unknown error'}`);
    } finally {
      setApiLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  if (!user) {
    return <div>The user is not authenticated.</div>;
  }

  return (
    <div>
      <h1>Google Analytics</h1>
      <p>Authorized user:</p>
      <p>Name: {user.name || 'Not specified'}</p>
      <p>Email: {user.email}</p>
      <p>User ID: {user.id || 'Not specified'}</p>
      <p>Company name: {user.company || 'Not specified'}</p>

      <h2 style={{ marginTop: '20px' }}>Google Analytics properties</h2>
      {propertiesLoading && <div>Loading properties...</div>}
      {propertiesError && <div style={{ color: 'red' }}>{propertiesError}</div>}
      {!propertiesLoading && properties.length === 0 && !propertiesError && (
        <div>Properties not found.</div>
      )}
      {!propertiesLoading && properties.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', marginTop: '15px' }}>
          {properties.map((prop) => (
            <div
              key={prop.property}
              onClick={() => handlePropertyClick(prop.property, false)}
              style={{
                border: '1px solid #ddd',
                padding: '15px',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease-in-out',
                backgroundColor: apiLoading ? '#f0f0f0' : 'white',
                opacity: apiLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)')}
            >
              <h3>{prop.displayName}</h3>
              <p style={{ fontSize: '0.9em', color: '#666' }}>ID: {prop.property.split('/').pop()}</p>
              <p style={{ fontSize: '0.9em', color: '#666' }}>Type: {prop.propertyType}</p>
            </div>
          ))}
        </div>
      )}

      {expandedPropertyId && (
        <>
          <div style={{ marginBottom: '10px' }}>
            <button
              onClick={() => setSelectedDateRange('1day')}
              style={{ marginRight: '10px', padding: '8px 15px', backgroundColor: selectedDateRange === '1day' ? '#007bff' : '#f0f0f0', color: selectedDateRange === '1day' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              1 Day
            </button>
            <button
              onClick={() => setSelectedDateRange('7days')}
              style={{ marginRight: '10px', padding: '8px 15px', backgroundColor: selectedDateRange === '7days' ? '#007bff' : '#f0f0f0', color: selectedDateRange === '7days' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              7 Days
            </button>
            <button
              onClick={() => setSelectedDateRange('28days')}
              style={{ marginRight: '10px', padding: '8px 15px', backgroundColor: selectedDateRange === '28days' ? '#007bff' : '#f0f0f0', color: selectedDateRange === '28days' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              28 Days
            </button>
            {/* <button // Removed Custom button
              onClick={() => setSelectedDateRange('custom')}
              style={{ padding: '8px 15px', backgroundColor: selectedDateRange === 'custom' ? '#007bff' : '#f0f0f0', color: selectedDateRange === 'custom' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              Custom
            </button> */}
          </div>

          {/* Calendar for custom range will go here */}
          {/* {selectedDateRange === 'custom' && (
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '10px' }}>Select Custom Date Range</h4>
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: '',
                }}
                dateClick={(info) => {
                  const clickedDate = new Date(info.dateStr);
                  if (!customStartDate || (customStartDate && customEndDate)) {
                    // If no start date or both dates are already selected, start a new selection
                    setCustomStartDate(clickedDate);
                    setCustomEndDate(null);
                  } else if (customStartDate && clickedDate > customStartDate) {
                    // If start date is selected and clicked date is after, set end date
                    setCustomEndDate(clickedDate);
                  } else if (customStartDate && clickedDate < customStartDate) {
                    // If clicked date is before start date, reset and set new start date
                    setCustomStartDate(clickedDate);
                    setCustomEndDate(null);
                  }
                }}
                eventContent={renderEventContent} // Render custom event content
                events={calendarEvents}
              />
              {customStartDate && customEndDate && (
                <p style={{ marginTop: '10px' }}>
                  Selected: {format(customStartDate, 'yyyy-MM-dd')} to {format(customEndDate, 'yyyy-MM-dd')}
                </p>
              )}
              {!customStartDate && !customEndDate && (
                <p style={{ marginTop: '10px' }}>Please select a start date and an end date.</p>
              )}
            </div>
          )} */}

          <h3 style={{ marginBottom: '10px' }}>Google Analytics account information for {expandedPropertyId}:</h3>

          {summaryLoading && <div>Loading account summary...</div>}
          {summaryError && <div style={{ color: 'red' }}>{summaryError}</div>}

          {!summaryLoading && !summaryError && (dateChartData.length > 0 || countryChartData.length > 0 || kpiSummary || topDaysActivity.length > 0 || adMetricsTrend.length > 0 || overallSummary.length > 0 || newVsReturningPieChartData.length > 0 || calculatedKPIs) && (
            <div style={{ marginTop: '20px' }}>

              {countryChartData.length > 0 && (
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
              )}
                
              {dateChartData.length > 0 && (
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
              )}


              {kpiSummary && (
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
              )}

              {topDaysActivity.length > 0 && (
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
              )}

              {adMetricsTrend.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Ad Performance Trend</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={adMetricsTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="publisherAdClicks" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="publisherAdImpressions" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {overallSummary.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Overall Metrics Summary Table</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #ddd' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Metric</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overallSummary.map((item) => (
                        <tr key={item.metric} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '8px' }}>{item.metric}</td>
                          <td style={{ padding: '8px' }}>{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* New vs Returning Users Pie Chart */}
              {newVsReturningPieChartData.length > 0 && selectedDateRange !== '1day' && (
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
              )}

              {/* Calculated KPIs */}
              {calculatedKPIs && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Calculated Key Performance Indicators (KPIs)</h4>
                  <p><strong>New User Share:</strong> {calculatedKPIs.newUsersShare}</p>
                  <p><strong>Views per User:</strong> {calculatedKPIs.viewsPerUser}</p>
                  <p><strong>Click-Through Rate (CTR):</strong> {calculatedKPIs.ctr}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}