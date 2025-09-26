// Settings Routes - Exports all settings page routes for integration with main router

import agentAutomationRoute from "./settings/agents";
import usageAnalyticsRoute from "./settings/analytics";
import notificationSettingsRoute from "./settings/notifications";
import profileSettingsRoute from "./settings/profile";
import securitySettingsRoute from "./settings/security";
import helpSupportRoute from "./settings/support";

// Export individual route creators
export {
	profileSettingsRoute,
	securitySettingsRoute,
	agentAutomationRoute,
	usageAnalyticsRoute,
	notificationSettingsRoute,
	helpSupportRoute,
};

// Export all routes as an array for easy integration
export const settingsRoutes = [
	profileSettingsRoute,
	securitySettingsRoute,
	agentAutomationRoute,
	usageAnalyticsRoute,
	notificationSettingsRoute,
	helpSupportRoute,
];

// Export route paths for navigation
export const settingsPaths = {
	profile: "/settings/profile",
	security: "/settings/security",
	agents: "/settings/agents",
	analytics: "/settings/analytics",
	notifications: "/settings/notifications",
	support: "/settings/support",
} as const;
