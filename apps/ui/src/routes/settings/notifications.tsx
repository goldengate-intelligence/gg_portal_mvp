import { useState } from 'react';
import { createRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '../../components/protected-route';
import { SettingsLayout } from '../../components/settings/settings-layout';
import { FormSection, FormField, FormSelect, FormCheckbox, FormActions, SaveButton } from '../../components/settings/form-components';
import { Bell, Mail, Smartphone, Monitor, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

function NotificationSettingsComponent() {
  const [loading, setLoading] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState({
    portfolioUpdates: true,
    securityAlerts: true,
    systemMaintenance: true,
    weeklyReports: true,
    marketAlerts: false,
    agentUpdates: true,
    loginNotifications: true,
    dataExports: true,
  });

  const [pushNotifications, setPushNotifications] = useState({
    realTimeAlerts: false,
    portfolioChanges: false,
    securityWarnings: true,
    systemUpdates: true,
    agentNotifications: false,
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    frequency: 'immediate',
    quietHours: true,
    quietStart: '22:00',
    quietEnd: '08:00',
    timezone: 'America/New_York',
    groupSimilar: true,
    emailDigest: 'daily',
  });

  const frequencyOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'hourly', label: 'Hourly digest' },
    { value: 'daily', label: 'Daily digest' },
    { value: 'weekly', label: 'Weekly digest' },
  ];

  const digestOptions = [
    { value: 'none', label: 'No digest' },
    { value: 'daily', label: 'Daily digest' },
    { value: 'weekly', label: 'Weekly digest' },
    { value: 'monthly', label: 'Monthly digest' },
  ];

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (UTC-5)' },
    { value: 'America/Chicago', label: 'Central Time (UTC-6)' },
    { value: 'America/Denver', label: 'Mountain Time (UTC-7)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8)' },
    { value: 'UTC', label: 'UTC (UTC+0)' },
    { value: 'Europe/London', label: 'London (UTC+0)' },
    { value: 'Europe/Paris', label: 'Paris (UTC+1)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
  ];

  const [recentNotifications] = useState([
    {
      id: '1',
      type: 'security',
      title: 'New login detected',
      message: 'Someone logged into your account from a new device',
      timestamp: '2 minutes ago',
      read: false,
    },
    {
      id: '2',
      type: 'system',
      title: 'Weekly report ready',
      message: 'Your weekly portfolio analysis report is now available',
      timestamp: '1 hour ago',
      read: true,
    },
    {
      id: '3',
      type: 'agent',
      title: 'Portfolio Monitor alert',
      message: 'Significant change detected in portfolio risk assessment',
      timestamp: '3 hours ago',
      read: true,
    },
    {
      id: '4',
      type: 'info',
      title: 'Platform maintenance scheduled',
      message: 'Planned maintenance window this Sunday 2-4 AM EST',
      timestamp: '1 day ago',
      read: true,
    },
  ]);

  const handleEmailNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailNotifications(prev => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
  };

  const handlePushNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPushNotifications(prev => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setNotificationPreferences(prev => ({
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
      console.log('Notification settings updated:', {
        emailNotifications,
        pushNotifications,
        notificationPreferences,
      });
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'system':
        return <Info className="w-5 h-5 text-blue-400" />;
      case 'agent':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const testNotification = async () => {
    try {
      // Simulate sending a test notification
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('Test notification sent! Check your email and browser notifications.');
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  return (
    <ProtectedRoute>
      <SettingsLayout
        title="Notifications"
        description="Configure email and system notifications"
      >
        <div className="p-6 space-y-8">
          <form onSubmit={handleSaveSettings}>
            {/* Email Notifications */}
            <FormSection
              title="Email Notifications"
              description="Choose which events should trigger email notifications."
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      <Mail className="w-4 h-4" />
                      Portfolio & Reports
                    </h4>
                    <div className="space-y-3">
                      <FormCheckbox
                        label="Portfolio Updates"
                        id="portfolioUpdates"
                        checked={emailNotifications.portfolioUpdates}
                        onChange={handleEmailNotificationChange}
                        helpText="Changes to your portfolio holdings and valuations"
                      />
                      <FormCheckbox
                        label="Weekly Reports"
                        id="weeklyReports"
                        checked={emailNotifications.weeklyReports}
                        onChange={handleEmailNotificationChange}
                        helpText="Automated weekly analysis and summary reports"
                      />
                      <FormCheckbox
                        label="Market Alerts"
                        id="marketAlerts"
                        checked={emailNotifications.marketAlerts}
                        onChange={handleEmailNotificationChange}
                        helpText="Important market conditions affecting your portfolio"
                      />
                      <FormCheckbox
                        label="Data Exports"
                        id="dataExports"
                        checked={emailNotifications.dataExports}
                        onChange={handleEmailNotificationChange}
                        helpText="Notifications when data exports are ready for download"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      <AlertCircle className="w-4 h-4" />
                      Security & System
                    </h4>
                    <div className="space-y-3">
                      <FormCheckbox
                        label="Security Alerts"
                        id="securityAlerts"
                        checked={emailNotifications.securityAlerts}
                        onChange={handleEmailNotificationChange}
                        helpText="Login attempts, password changes, and security events"
                      />
                      <FormCheckbox
                        label="Login Notifications"
                        id="loginNotifications"
                        checked={emailNotifications.loginNotifications}
                        onChange={handleEmailNotificationChange}
                        helpText="Notifications when someone accesses your account"
                      />
                      <FormCheckbox
                        label="System Maintenance"
                        id="systemMaintenance"
                        checked={emailNotifications.systemMaintenance}
                        onChange={handleEmailNotificationChange}
                        helpText="Scheduled maintenance and system updates"
                      />
                      <FormCheckbox
                        label="Agent Updates"
                        id="agentUpdates"
                        checked={emailNotifications.agentUpdates}
                        onChange={handleEmailNotificationChange}
                        helpText="Notifications from your automated agents"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Push Notifications */}
            <FormSection
              title="Browser Notifications"
              description="Configure real-time notifications in your browser."
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 mb-4">
                  <Monitor className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-blue-400 font-medium mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      Enable Browser Notifications
                    </h4>
                    <p className="text-gray-300 text-sm mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      Allow the platform to send real-time notifications through your browser for immediate alerts.
                    </p>
                    <button
                      type="button"
                      onClick={testNotification}
                      className="bg-[#D2AC38] hover:bg-[#D2AC38]/90 text-black font-medium px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      Enable & Test Notifications
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      Real-time Alerts
                    </h4>
                    <div className="space-y-3">
                      <FormCheckbox
                        label="Real-time Portfolio Alerts"
                        id="realTimeAlerts"
                        checked={pushNotifications.realTimeAlerts}
                        onChange={handlePushNotificationChange}
                        helpText="Immediate notifications for significant portfolio changes"
                      />
                      <FormCheckbox
                        label="Portfolio Changes"
                        id="portfolioChanges"
                        checked={pushNotifications.portfolioChanges}
                        onChange={handlePushNotificationChange}
                        helpText="Any updates to your portfolio holdings"
                      />
                      <FormCheckbox
                        label="Agent Notifications"
                        id="agentNotifications"
                        checked={pushNotifications.agentNotifications}
                        onChange={handlePushNotificationChange}
                        helpText="Updates from your automated agents"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      Security & System
                    </h4>
                    <div className="space-y-3">
                      <FormCheckbox
                        label="Security Warnings"
                        id="securityWarnings"
                        checked={pushNotifications.securityWarnings}
                        onChange={handlePushNotificationChange}
                        helpText="Immediate alerts for security-related events"
                      />
                      <FormCheckbox
                        label="System Updates"
                        id="systemUpdates"
                        checked={pushNotifications.systemUpdates}
                        onChange={handlePushNotificationChange}
                        helpText="Important system announcements and updates"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Notification Preferences */}
            <FormSection
              title="Notification Preferences"
              description="Configure how and when you receive notifications."
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FormSelect
                      label="Notification Frequency"
                      id="frequency"
                      value={notificationPreferences.frequency}
                      onChange={handlePreferenceChange}
                      options={frequencyOptions}
                      helpText="How often to receive notifications"
                    />
                    <FormSelect
                      label="Email Digest"
                      id="emailDigest"
                      value={notificationPreferences.emailDigest}
                      onChange={handlePreferenceChange}
                      options={digestOptions}
                      helpText="Frequency of summary emails"
                    />
                  </div>

                  <div>
                    <FormSelect
                      label="Timezone"
                      id="timezone"
                      value={notificationPreferences.timezone}
                      onChange={handlePreferenceChange}
                      options={timezoneOptions}
                      helpText="Used for scheduling notifications"
                    />
                    <FormCheckbox
                      label="Group Similar Notifications"
                      id="groupSimilar"
                      checked={notificationPreferences.groupSimilar}
                      onChange={handlePreferenceChange}
                      helpText="Combine related notifications to reduce clutter"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <FormCheckbox
                    label="Enable Quiet Hours"
                    id="quietHours"
                    checked={notificationPreferences.quietHours}
                    onChange={handlePreferenceChange}
                    helpText="Pause non-urgent notifications during specified hours"
                  />

                  {notificationPreferences.quietHours && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                      <FormField
                        label="Quiet Hours Start"
                        id="quietStart"
                        type="time"
                        value={notificationPreferences.quietStart}
                        onChange={handlePreferenceChange}
                      />
                      <FormField
                        label="Quiet Hours End"
                        id="quietEnd"
                        type="time"
                        value={notificationPreferences.quietEnd}
                        onChange={handlePreferenceChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </FormSection>

            <FormActions>
              <SaveButton loading={loading}>Save Notification Settings</SaveButton>
            </FormActions>
          </form>

          {/* Recent Notifications */}
          <FormSection
            title="Recent Notifications"
            description="Your latest notifications and their status."
          >
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <div key={notification.id} className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                  notification.read
                    ? 'bg-gray-800/30 border-gray-600/20'
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}>
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-medium ${notification.read ? 'text-gray-300' : 'text-white'}`}
                          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        {notification.timestamp}
                      </span>
                    </div>
                    <p className={`text-sm ${notification.read ? 'text-gray-400' : 'text-gray-300'}`}
                       style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              ))}
            </div>
          </FormSection>
        </div>
      </SettingsLayout>
    </ProtectedRoute>
  );
}

export const notificationSettingsRoute = (rootRoute: any) => createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/notifications',
  component: NotificationSettingsComponent,
});

export default notificationSettingsRoute;