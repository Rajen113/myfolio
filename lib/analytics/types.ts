export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  viewsToday: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
}

export interface AnalyticsTimeSeriesPoint {
  date: string; // YYYY-MM-DD
  views: number;
  uniqueVisitors: number;
}

export interface ReferrerCount {
  domain: string;
  count: number;
  percentage: number;
}

export interface DeviceBreakdown {
  desktop: number;
  mobile: number;
  tablet: number;
  unknown: number;
}

export interface CountryCount {
  country: string;
  code: string;
  count: number;
  percentage: number;
}

export interface PortfolioAnalyticsData {
  summary: AnalyticsSummary;
  timeSeries: AnalyticsTimeSeriesPoint[];
  topReferrers: ReferrerCount[];
  deviceBreakdown: DeviceBreakdown;
  countryBreakdown: CountryCount[] | null;
  rangeDays: number;
}
