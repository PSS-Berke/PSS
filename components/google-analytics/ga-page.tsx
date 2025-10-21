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
import { TopChartDataTable } from './TopChartDataTable';
import { SessionsAndUsersChart } from './SessionsAndUsersChart';
import { KpiSummaryTable } from './KpiSummaryTable';
import { AdPerformanceTrendChart } from './AdPerformanceTrendChart';
import { NewVsReturningUsersPieChart } from './NewVsReturningUsersPieChart';
import { CalculatedKpisDisplay } from './CalculatedKpisDisplay';
import { ChartTooltipContent } from '../ui/chart';
import { ChartContainer } from '../ui/chart';
import { TopDaysPieCharts } from './TopDaysPieCharts';

const pieChartConfig = {
  'segment-1': { color: 'hsl(var(--chart-1))' },
  'segment-2': { color: 'hsl(var(--chart-2))' },
  'segment-3': { color: 'hsl(var(--chart-3))' },
  'segment-4': { color: 'hsl(var(--chart-4))' },
  'segment-5': { color: 'hsl(var(--chart-5))' },
  'segment-6': { color: 'hsl(var(--chart-6))' },
} as const;

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
  const [topChartData, setTopChartData] = useState<ChartData[]>([]);
  const [kpiSummary, setKpiSummary] = useState<KpiSummary | null>(null);
  const [topDaysActivity, setTopDaysActivity] = useState<TopDayActivity[]>([]);
  const [adMetricsTrend, setAdMetricsTrend] = useState<AdMetricsTrend[]>([]);
  const [overallSummary, setOverallSummary] = useState<OverallSummaryItem[]>([]);
  const [newVsReturningPieChartData, setNewVsReturningPieChartData] = useState<NewVsReturningData[]>([]);
  const [calculatedKPIs, setCalculatedKPIs] = useState<CalculatedKPIs | null>(null);

  type DateRangeKey = '1day' | '7days' | '28days';

  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeKey>('28days');

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
      default:
        startDate = subDays(today, 27); // Default to 28 days
        break;
    }

    return { startDate: startDate ? format(startDate, 'yyyy-MM-dd') : null, endDate: endDate ? format(endDate, 'yyyy-MM-dd') : null };
  };

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
      setTopChartData([]);
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
    setTopChartData([]);
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
      setKpiSummary(processedData.kpiSummary);
      setTopDaysActivity(processedData.topDaysActivity);
      setAdMetricsTrend(processedData.adMetricsTrend);
      setOverallSummary(processedData.overallSummary);
      setNewVsReturningPieChartData(processedData.newVsReturningPieChartData);
      setCalculatedKPIs(processedData.calculatedKPIs);
      setTopChartData(processedData.topChartData);
    } catch (error: any) {
      console.error('Error retrieving Google Analytics account summary:', error);
      setSummaryError(
        `Error retrieving account summary: ${error.message || 'Unknown error'}`,
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  if (!user) {
    return <div>The user is not authenticated.</div>;
  }

  return (
    <div className="p-4">
      {/* <h1>Google Analytics</h1>
      <p>Authorized user:</p>
      <p>Name: {user.name || 'Not specified'}</p>
      <p>Email: {user.email}</p>
      <p>User ID: {user.id || 'Not specified'}</p>
      <p>Company name: {user.company || 'Not specified'}</p> */}

      {propertiesLoading && <div>Loading properties...</div>}
      {propertiesError && <div className="text-red-500">{propertiesError}</div>}
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

          {summaryLoading && <div>Loading account summary...</div>}
          {summaryError && <div className="text-red-500">{summaryError}</div>}

          {!summaryLoading && !summaryError && (dateChartData.length > 0 || topChartData.length > 0 || kpiSummary || topDaysActivity.length > 0 || adMetricsTrend.length > 0 || overallSummary.length > 0 || newVsReturningPieChartData.length > 0 || calculatedKPIs) && (
            <div className="mt-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm space-y-4">
              <h3 className="mb-2 text-lg font-semibold">Google Analytics account information for {selectedPropertyName || expandedPropertyId}:</h3>

              {topChartData.length > 0 && (
                <div className="mt-4">
                  <TopChartDataTable topChartData={topChartData} />
                </div>
              )}
                
              {dateChartData.length > 0 && (
                <div className="mb-4">
                  <SessionsAndUsersChart dateChartData={dateChartData} />
                </div>
              )}


              {kpiSummary && (
                <div className="mt-4">
                  <KpiSummaryTable kpiSummary={kpiSummary} />
                </div>
              )}

              {/* Pie Charts for Top Days by Activity */}
              {selectedDateRange !== '1day' && topDaysActivity.length > 0 && (
                <TopDaysPieCharts
                  topDaysActivity={topDaysActivity}
                  selectedDateRange={selectedDateRange}
                  pieChartConfig={pieChartConfig}
                />
              )}

              {adMetricsTrend.length > 0 && (
                <div className="mt-4">
                  <AdPerformanceTrendChart adMetricsTrend={adMetricsTrend} />
                </div>
              )}

              {overallSummary.length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 text-md font-semibold">Overall Metrics Summary Table</h4>
                  <div className="rounded-md border p-4">
                    {overallSummary.map((item) => (
                      <div key={item.metric} className="flex flex-col sm:flex-row justify-between border-b last:border-b-0 py-2">
                        <div className="font-medium sm:w-1/2">{item.metric}</div>
                        <div className="sm:w-1/2 text-right sm:text-left lg:text-center">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-col md:flex-row gap-4">
                {/* New vs Returning Users Pie Chart */}
                {newVsReturningPieChartData.length > 0 && selectedDateRange !== '1day' && (
                  <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm flex-1">
                    <NewVsReturningUsersPieChart
                      newVsReturningPieChartData={newVsReturningPieChartData}
                      selectedDateRange={selectedDateRange}
                    />
                  </div>
                )}

                {/* Calculated KPIs */}
                {calculatedKPIs && (
                  <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm flex-1">
                    <CalculatedKpisDisplay calculatedKPIs={calculatedKPIs} />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}