/**
 * Contractor Detail Feature Index
 *
 * Comprehensive exports following the enhanced architecture pattern.
 * Clean public API for contractor detail functionality with proper categorization.
 * Enhanced with Lusha API integration and proper colocation structure.
 */

// =============================================================================
// MAIN COMPONENTS
// =============================================================================

export { ContractorDetail } from "./ContractorDetail_Orchestrator";
export { ContractorDetailHeader } from "./ContractorDetail_Header";
export { HeadlineMetrics } from "./Headline_Metrics";

// =============================================================================
// TAB COMPONENTS
// =============================================================================

// Overview Tab
export * from "./tabs/overview";

// Performance Tab
export * from "./tabs/performance";

// Activity Tab
export * from "./tabs/activity";

// Relationships Tab
export * from "./tabs/relationships";

// Contacts Tab (Enhanced with Lusha Integration)
export * from "./tabs/contacts";
export { ContactsTab } from "./tabs/contacts/ContactsTab";
export { ContactFilterPanel } from "./tabs/contacts/ContactFilterPanel";
export { ContactGridPanel } from "./tabs/contacts/ContactGridPanel";

// =============================================================================
// SERVICES & DATA INTEGRATION
// =============================================================================

export * from "./services";

// Data Orchestration Services
export {
	contractorDataOrchestrator,
	type ContractorDetailData,
	type ContractorPerformanceData,
	type ContractorNetworkData,
	type ContractorActivityData,
	type ContractorContactData,
} from "./services/contractor-data";

export {
	performanceCalculationService,
	type PerformanceMetrics,
	type BenchmarkComparison,
	type PerformanceTrends,
} from "./services/performance-calculations";

// Contact Integration Services
export {
	contractorContactService,
	type ContractorContact,
	type ContactSearchFilters,
	type ContactSearchResult,
	type ContactExportData,
} from "./services/contact-integration";

// Geographic and Location Services
export * from "./services/geocoding";

// =============================================================================
// HOOKS & STATE MANAGEMENT
// =============================================================================

// Activity Tab Hooks
export * from "./tabs/activity/hooks/useActivityState";
export * from "./tabs/activity/hooks/useContractData";

// =============================================================================
// BUSINESS LOGIC
// =============================================================================

// Activity Logic
export * from "./tabs/activity/logic/contractGrouping";
export * from "./tabs/activity/logic/contractData";
export * from "./tabs/activity/logic/contractCalculations";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

// Re-export key types for external consumption
export type {} from // Activity Types (contact types are already exported above from services)
"./tabs/activity/types";

// =============================================================================
// CONSTANTS
// =============================================================================

// Contractor Detail specific constants
export const CONTRACTOR_DETAIL_CONSTANTS = {
	// Contact Management
	MAX_CONTACTS_PER_EXPORT: 1000,
	CONTACT_CACHE_TTL_MINUTES: 60,
	MOCK_FALLBACK_TTL_MINUTES: 5,
	SUPPORTED_CONTACT_EXPORTS: ["csv"] as const,
	DEFAULT_CONTACT_PAGE_SIZE: 20,
	MAX_CONTACT_SEARCH_RESULTS: 100,

	// Data Caching
	CACHE_TTL: {
		CONTRACTOR_INFO: 60, // 1 hour
		PERFORMANCE_DATA: 30, // 30 minutes
		NETWORK_DATA: 45, // 45 minutes
		ACTIVITY_DATA: 15, // 15 minutes
		CONTACT_DATA: 120, // 2 hours
	},

	// Performance Calculations
	PERFORMANCE_WEIGHTS: {
		REVENUE: 0.3,
		GROWTH: 0.25,
		EFFICIENCY: 0.25,
		RELIABILITY: 0.2,
	},

	// Risk Assessment Thresholds
	RISK_THRESHOLDS: {
		LOW: 0,
		MEDIUM: 30,
		HIGH: 60,
	},

	// Charts and Visualization
	CHARTS: {
		DEFAULT_TIME_RANGE: "12M",
		AVAILABLE_TIME_RANGES: ["3M", "6M", "12M", "24M", "5Y"],
		DEFAULT_CHART_HEIGHT: 300,
		ANIMATION_DURATION: 750,
	},
} as const;

// =============================================================================
// FEATURE STATUS
// =============================================================================

/**
 * Contractor Detail Feature Status
 *
 * Tracks the current state of contractor detail features for progressive enhancement.
 */
export const CONTRACTOR_DETAIL_FEATURE_STATUS = {
	// Core Features
	overviewDisplay: "stable",
	performanceMetrics: "stable",
	activityTracking: "stable",
	relationshipsMapping: "stable",
	contactsIntegration: "beta", // New with Lusha

	// Data Orchestration (New)
	dataOrchestration: "stable", // New centralized data management
	performanceCalculations: "stable", // New performance analytics
	sharedServiceIntegration: "stable", // Migrated to shared services

	// Data Integration
	lushaApiIntegration: "beta",
	contactMockFallback: "development", // TODO: Remove after full integration
	geographicMapping: "stable",
	icebergDataSource: "beta", // Large data materialized views
	snowflakeIntegration: "beta", // Real-time data queries

	// Advanced Features
	contactSearch: "beta",
	contactExport: "beta",
	contactFiltering: "beta",
	realTimeContactUpdates: "planned",
	performanceBenchmarking: "stable", // New with performance service
	riskAssessment: "stable", // New with performance service
	revenueForecast: "stable", // New with performance service

	// External Integrations
	logoResolution: "stable",
	thirdPartyEnrichment: "beta",
	largeDataCaching: "stable", // Integrated caching layer
} as const;

// =============================================================================
// VERSION INFO
// =============================================================================

export const CONTRACTOR_DETAIL_VERSION = {
	major: 1,
	minor: 2,
	patch: 0,
	prerelease: "stable",
	buildDate: "2025-01-24",
	features: [
		"Lusha API Integration",
		"Contact Search & Filtering",
		"CSV Export Functionality",
		"Mock Data Fallback System",
		"Enhanced Service Architecture",
		"Proper Colocation Structure",
		"Geographic Data Preservation",
		"Activity State Management",
		"Data Orchestration Service", // New
		"Performance Calculation Engine", // New
		"Shared Services Integration", // New
		"Large Data Caching Layer", // New
		"Risk Assessment Analytics", // New
		"Revenue Forecasting", // New
		"Benchmark Comparison", // New
		"Multi-source Data Integration", // New
	],
} as const;
