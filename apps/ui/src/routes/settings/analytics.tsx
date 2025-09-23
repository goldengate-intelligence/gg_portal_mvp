import { useState } from 'react';
import { createRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '../../components/protected-route';
import { SettingsLayout } from '../../components/settings/settings-layout';
import { FormSection, FormSelect, FormCheckbox, FormActions, SaveButton } from '../../components/settings/form-components';
import { BarChart3, Activity, Clock, Users, Download, TrendingUp, Eye, Search } from 'lucide-react';

function UsageAnalyticsComponent() {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30-days');

  const [analyticsSettings, setAnalyticsSettings] = useState({
    trackPageViews: true,
    trackSearchQueries: true,
    trackDownloads: true,
    trackSessionDuration: true,
    shareAnonymousData: false,
    emailWeeklyReports: true,
    retentionPeriod: '12-months',
  });

  const timeRangeOptions = [
    { value: '7-days', label: 'Last 7 days' },
    { value: '30-days', label: 'Last 30 days' },
    { value: '90-days', label: 'Last 90 days' },
    { value: '12-months', label: 'Last 12 months' },
  ];

  const retentionOptions = [
    { value: '3-months', label: '3 months' },
    { value: '6-months', label: '6 months' },
    { value: '12-months', label: '12 months' },
    { value: '24-months', label: '24 months' },
  ];

  // Mock analytics data
  const usageStats = {
    totalSessions: 247,
    averageSessionDuration: '8m 32s',
    totalPageViews: 1542,
    totalSearches: 89,
    totalDownloads: 34,
    mostViewedPages: [
      { page: 'Portfolio Overview', views: 412, percentage: 26.7 },
      { page: 'Discovery Dashboard', views: 324, percentage: 21.0 },
      { page: 'Contractor Details', views: 298, percentage: 19.3 },
      { page: 'Analytics Reports', views: 186, percentage: 12.1 },
      { page: 'Account Settings', views: 124, percentage: 8.0 },
    ],
    searchTerms: [
      { term: 'construction contractors', count: 23 },
      { term: 'risk assessment', count: 18 },
      { term: 'financial analysis', count: 15 },
      { term: 'compliance reports', count: 12 },
      { term: 'market trends', count: 9 },
    ],
    weeklyActivity: [
      { day: 'Mon', sessions: 42, duration: 512 },
      { day: 'Tue', sessions: 38, duration: 486 },
      { day: 'Wed', sessions: 45, duration: 578 },
      { day: 'Thu', sessions: 41, duration: 523 },
      { day: 'Fri', sessions: 36, duration: 445 },
      { day: 'Sat', sessions: 15, duration: 198 },
      { day: 'Sun', sessions: 12, duration: 156 },
    ]
  };

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
    // In a real app, this would trigger a data refresh
  };

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setAnalyticsSettings(prev => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Analytics settings updated:', analyticsSettings);
    } catch (error) {
      console.error('Failed to update analytics settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      // Simulate data export
      const data = JSON.stringify(usageStats, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `usage-analytics-${timeRange}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  return (
    <ProtectedRoute>
      <SettingsLayout
        title="Usage Analytics"
        description="View platform usage metrics and insights"
      >
        <div className="p-6 space-y-8">
          {/* Time Range Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FormSelect
                label=""
                id="timeRange"
                value={timeRange}
                onChange={handleTimeRangeChange}
                options={timeRangeOptions}
              />
            </div>
            <button
              onClick={exportData}
              className="flex items-center gap-2 bg-[#D2AC38] hover:bg-[#D2AC38]/90 text-black font-medium px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>

          {/* Overview Stats */}
          <FormSection
            title="Usage Overview"
            description="High-level metrics for your platform usage."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-[#D2AC38]" />
                  <span className="text-sm text-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Total Sessions
                  </span>
                </div>
                <span className="text-2xl font-bold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {usageStats.totalSessions.toLocaleString()}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-[#D2AC38]" />
                  <span className="text-sm text-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Avg. Session Duration
                  </span>
                </div>
                <span className="text-2xl font-bold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {usageStats.averageSessionDuration}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="w-5 h-5 text-[#D2AC38]" />
                  <span className="text-sm text-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Total Page Views
                  </span>
                </div>
                <span className="text-2xl font-bold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {usageStats.totalPageViews.toLocaleString()}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <Search className="w-5 h-5 text-[#D2AC38]" />
                  <span className="text-sm text-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Search Queries
                  </span>
                </div>
                <span className="text-2xl font-bold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {usageStats.totalSearches}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <Download className="w-5 h-5 text-[#D2AC38]" />
                  <span className="text-sm text-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Downloads
                  </span>
                </div>
                <span className="text-2xl font-bold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {usageStats.totalDownloads}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Trend
                  </span>
                </div>
                <span className="text-2xl font-bold text-green-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  +12.3%
                </span>
              </div>
            </div>
          </FormSection>

          {/* Most Viewed Pages */}
          <FormSection
            title="Most Viewed Pages"
            description="Your most frequently accessed platform pages."
          >
            <div className="space-y-3">
              {usageStats.mostViewedPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-600/20">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D2AC38] text-black text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-white font-medium" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      {page.page}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      {page.views} views
                    </span>
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-[#D2AC38] h-2 rounded-full"
                        style={{ width: `${page.percentage}%` }}
                      />
                    </div>
                    <span className="text-[#D2AC38] text-sm font-medium w-12 text-right">
                      {page.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </FormSection>

          {/* Search Terms */}
          <FormSection
            title="Popular Search Terms"
            description="Most frequently searched terms on the platform."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usageStats.searchTerms.map((term, index) => (
                <div key={term.term} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-600/20">
                  <span className="text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    {term.term}
                  </span>
                  <span className="text-[#D2AC38] font-medium">
                    {term.count} searches
                  </span>
                </div>
              ))}
            </div>
          </FormSection>

          {/* Weekly Activity */}
          <FormSection
            title="Weekly Activity"
            description="Your platform usage patterns throughout the week."
          >
            <div className="grid grid-cols-7 gap-2">
              {usageStats.weeklyActivity.map((day) => (
                <div key={day.day} className="text-center">
                  <div className="text-xs text-gray-400 mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    {day.day}
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                    <div className="text-sm text-white font-medium">
                      {day.sessions}
                    </div>
                    <div className="text-xs text-gray-400">
                      sessions
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div
                        className="bg-[#D2AC38] h-1 rounded-full"
                        style={{ width: `${(day.sessions / 50) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FormSection>

          {/* Analytics Settings */}
          <form onSubmit={handleSaveSettings}>
            <FormSection
              title="Analytics Settings"
              description="Configure what data is tracked and how long it's retained."
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      Data Collection
                    </h4>
                    <div className="space-y-3">
                      <FormCheckbox
                        label="Track Page Views"
                        id="trackPageViews"
                        checked={analyticsSettings.trackPageViews}
                        onChange={handleSettingChange}
                        helpText="Monitor which pages you visit most frequently"
                      />
                      <FormCheckbox
                        label="Track Search Queries"
                        id="trackSearchQueries"
                        checked={analyticsSettings.trackSearchQueries}
                        onChange={handleSettingChange}
                        helpText="Record your search terms for insights"
                      />
                      <FormCheckbox
                        label="Track Downloads"
                        id="trackDownloads"
                        checked={analyticsSettings.trackDownloads}
                        onChange={handleSettingChange}
                        helpText="Monitor file downloads and exports"
                      />
                      <FormCheckbox
                        label="Track Session Duration"
                        id="trackSessionDuration"
                        checked={analyticsSettings.trackSessionDuration}
                        onChange={handleSettingChange}
                        helpText="Measure how long you spend in the platform"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      Data Management
                    </h4>
                    <div className="space-y-3">
                      <FormSelect
                        label="Data Retention Period"
                        id="retentionPeriod"
                        value={analyticsSettings.retentionPeriod}
                        onChange={handleSettingChange}
                        options={retentionOptions}
                        helpText="How long to keep your analytics data"
                      />
                      <FormCheckbox
                        label="Share Anonymous Usage Data"
                        id="shareAnonymousData"
                        checked={analyticsSettings.shareAnonymousData}
                        onChange={handleSettingChange}
                        helpText="Help improve the platform by sharing anonymized usage patterns"
                      />
                      <FormCheckbox
                        label="Weekly Email Reports"
                        id="emailWeeklyReports"
                        checked={analyticsSettings.emailWeeklyReports}
                        onChange={handleSettingChange}
                        helpText="Receive weekly summaries of your platform usage"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <FormActions>
                <SaveButton loading={loading}>Save Analytics Settings</SaveButton>
              </FormActions>
            </FormSection>
          </form>
        </div>
      </SettingsLayout>
    </ProtectedRoute>
  );
}

export const usageAnalyticsRoute = (rootRoute: any) => createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/analytics',
  component: UsageAnalyticsComponent,
});

export default usageAnalyticsRoute;