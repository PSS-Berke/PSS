export interface PropertySummary {
  property: string;
  displayName: string;
  propertyType: string;
  parent: string;
}

export interface GooglePropertiesResponse {
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

export interface AccountSummary {
  name: string;
  account: string;
  displayName: string;
  propertySummaries: PropertySummary[];
}

export interface GoogleAccountSummaryResponse {
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

export type ChartData = {
  name: string;
} & { [key: string]: number };

export interface KpiSummary {
  activeUsers: { sum: number; avg: number };
  newUsers: { sum: number; avg: number };
  screenPageViews: { sum: number; avg: number };
  publisherAdClicks: { sum: number; avg: number };
  publisherAdImpressions: { sum: number; avg: number };
}

export interface TopDayActivity {
  date: string;
  activeUsers: number;
  newUsers: number;
  screenPageViews: number;
}

export interface AdMetricsTrend {
  date: string;
  publisherAdClicks: number;
  publisherAdImpressions: number;
}

export interface OverallSummaryItem {
  metric: string;
  value: number | string;
}

export interface NewVsReturningData {
  name: string;
  value: number;
}

export interface CalculatedKPIs {
  newUsersShare: string;
  viewsPerUser: string;
  ctr: string;
}

export interface ProcessedSummaryData {
  dateChartData: ChartData[];
  countryChartData: ChartData[];
  kpiSummary: KpiSummary;
  topDaysActivity: TopDayActivity[];
  adMetricsTrend: AdMetricsTrend[];
  overallSummary: OverallSummaryItem[];
  newVsReturningPieChartData: NewVsReturningData[];
  calculatedKPIs: CalculatedKPIs;
}
