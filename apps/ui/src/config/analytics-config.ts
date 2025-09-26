/**
 * Analytics Configuration
 *
 * Centralized configuration for analytics settings and mock data
 */

export interface AnalyticsSettings {
  trackPageViews: boolean;
  trackSearchQueries: boolean;
  trackDownloads: boolean;
  trackSessionDuration: boolean;
  shareAnonymousData: boolean;
  emailWeeklyReports: boolean;
  retentionPeriod: string;
}

export interface UsageStats {
  totalSessions: number;
  averageSessionDuration: string;
  totalPageViews: number;
  totalSearches: number;
  totalDownloads: number;
  mostViewedPages: Array<{
    page: string;
    views: number;
    percentage: number;
  }>;
  searchTerms: Array<{
    term: string;
    count: number;
  }>;
  weeklyActivity: Array<{
    day: string;
    sessions: number;
    duration: number;
  }>;
}

export const DEFAULT_ANALYTICS_SETTINGS: AnalyticsSettings = {
  trackPageViews: true,
  trackSearchQueries: true,
  trackDownloads: true,
  trackSessionDuration: true,
  shareAnonymousData: false,
  emailWeeklyReports: true,
  retentionPeriod: "12-months",
};

export const TIME_RANGE_OPTIONS = [
  { value: "7-days", label: "Last 7 days" },
  { value: "30-days", label: "Last 30 days" },
  { value: "90-days", label: "Last 90 days" },
  { value: "12-months", label: "Last 12 months" },
] as const;

export const RETENTION_OPTIONS = [
  { value: "3-months", label: "3 months" },
  { value: "6-months", label: "6 months" },
  { value: "12-months", label: "12 months" },
  { value: "24-months", label: "24 months" },
] as const;

export const MOCK_USAGE_STATS: UsageStats = {
  totalSessions: 247,
  averageSessionDuration: "8m 32s",
  totalPageViews: 1542,
  totalSearches: 89,
  totalDownloads: 34,
  mostViewedPages: [
    { page: "Portfolio Overview", views: 412, percentage: 26.7 },
    { page: "Discovery Dashboard", views: 324, percentage: 21.0 },
    { page: "Contractor Details", views: 298, percentage: 19.3 },
    { page: "Analytics Reports", views: 186, percentage: 12.1 },
    { page: "Account Settings", views: 124, percentage: 8.0 },
  ],
  searchTerms: [
    { term: "construction contractors", count: 23 },
    { term: "risk assessment", count: 18 },
    { term: "financial analysis", count: 15 },
    { term: "compliance reports", count: 12 },
    { term: "market trends", count: 9 },
  ],
  weeklyActivity: [
    { day: "Mon", sessions: 42, duration: 512 },
    { day: "Tue", sessions: 38, duration: 486 },
    { day: "Wed", sessions: 45, duration: 578 },
    { day: "Thu", sessions: 41, duration: 523 },
    { day: "Fri", sessions: 36, duration: 445 },
    { day: "Sat", sessions: 15, duration: 198 },
    { day: "Sun", sessions: 12, duration: 156 },
  ],
};