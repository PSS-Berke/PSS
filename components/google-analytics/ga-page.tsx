import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/xano/auth-context';
import { apiRequest } from '@/lib/xano/api';
import { XANO_CONFIG, getGoogleAnalyticsApiUrl } from '@/lib/xano/config';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, parse } from 'date-fns';
import {
  PropertySummary,
  GooglePropertiesResponse,
  AccountSummary,
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
import { processSummaryDataForCharts } from './data-processing';
import { DateRangeSelector } from './DateRangeSelector';
import { PropertiesDisplay } from './PropertiesDisplay';
import { CountryChartDataTable } from './CountryChartDataTable';
import { SessionsAndUsersChart } from './SessionsAndUsersChart';
import { KpiSummaryTable } from './KpiSummaryTable';
import { TopDaysActivityTable } from './TopDaysActivityTable';
import { AdPerformanceTrendChart } from './AdPerformanceTrendChart';
import { NewVsReturningUsersPieChart } from './NewVsReturningUsersPieChart';
import { CalculatedKpisDisplay } from './CalculatedKpisDisplay';

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
  const [selectedPropertyName, setSelectedPropertyName] = useState<string | null>(null);
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
          // Automatically select the first property and set date range to 1 day
          if (allProperties.length > 0) {
            const firstProperty = allProperties[0];
            setExpandedPropertyId(firstProperty.property);
            setSelectedPropertyName(firstProperty.displayName);
            setSelectedDateRange('1day');
          }
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
      setSelectedPropertyName(null);
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
      setSelectedDateRange('1day'); // Reset to 1day when a new property is selected
      const selectedProperty = properties.find(p => p.property === propertyId);
      setSelectedPropertyName(selectedProperty ? selectedProperty.displayName : null);
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
    <div style={{ padding: '10px' }}>
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
        <PropertiesDisplay
          properties={properties}
          propertiesLoading={propertiesLoading}
          propertiesError={propertiesError}
          apiLoading={apiLoading}
          onPropertyClick={handlePropertyClick}
          expandedPropertyId={expandedPropertyId}
        />
      )}

      {expandedPropertyId && (
        <>
          <DateRangeSelector
            selectedDateRange={selectedDateRange}
            setSelectedDateRange={setSelectedDateRange}
          />

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

          <h3 style={{ marginBottom: '10px' }}>Google Analytics account information for {selectedPropertyName || expandedPropertyId}:</h3>

          {summaryLoading && <div>Loading account summary...</div>}
          {summaryError && <div style={{ color: 'red' }}>{summaryError}</div>}

          {!summaryLoading && !summaryError && (dateChartData.length > 0 || countryChartData.length > 0 || kpiSummary || topDaysActivity.length > 0 || adMetricsTrend.length > 0 || overallSummary.length > 0 || newVsReturningPieChartData.length > 0 || calculatedKPIs) && (
            <div style={{ marginTop: '20px' }}>

              {countryChartData.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <CountryChartDataTable countryChartData={countryChartData} />
                </div>
              )}
                
              {dateChartData.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <SessionsAndUsersChart dateChartData={dateChartData} />
                </div>
              )}


              {kpiSummary && (
                <div style={{ marginTop: '20px' }}>
                  <KpiSummaryTable kpiSummary={kpiSummary} />
                </div>
              )}

              {topDaysActivity.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <TopDaysActivityTable topDaysActivity={topDaysActivity} />
                </div>
              )}

              {/* New Pie Charts for Top Days by Activity */}
              {selectedDateRange !== '1day' && topDaysActivity.length > 0 && (
                <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                  {/* Active Users Pie Chart */}
                  {topDaysActivity.some(day => day.activeUsers > 0) && (
                    <div style={{ flex: '1' }}>
                      <h4>Active Users by Day</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={topDaysActivity.map(day => ({ name: day.date, value: day.activeUsers }))}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {topDaysActivity.map((entry, index) => (
                              <Cell key={`cell-active-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0'][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* New Users Pie Chart */}
                  {topDaysActivity.some(day => day.newUsers > 0) && (
                    <div style={{ flex: '1' }}>
                      <h4>New Users by Day</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={topDaysActivity.map(day => ({ name: day.date, value: day.newUsers }))}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#82ca9d"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {topDaysActivity.map((entry, index) => (
                              <Cell key={`cell-new-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0'][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Screen Page Views Pie Chart */}
                  {topDaysActivity.some(day => day.screenPageViews > 0) && (
                    <div style={{ flex: '1' }}>
                      <h4>Screen Page Views by Day</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={topDaysActivity.map(day => ({ name: day.date, value: day.screenPageViews }))}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#ffc658"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {topDaysActivity.map((entry, index) => (
                              <Cell key={`cell-views-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0'][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              {adMetricsTrend.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <AdPerformanceTrendChart adMetricsTrend={adMetricsTrend} />
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
                  <NewVsReturningUsersPieChart
                    newVsReturningPieChartData={newVsReturningPieChartData}
                    selectedDateRange={selectedDateRange}
                  />
                </div>
              )}

              {/* Calculated KPIs */}
              {calculatedKPIs && (
                <div style={{ marginTop: '20px' }}>
                  <CalculatedKpisDisplay calculatedKPIs={calculatedKPIs} />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}