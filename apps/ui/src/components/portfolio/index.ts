/**
 * Portfolio Feature Index
 *
 * Comprehensive exports following the Discovery pattern for maximum discoverability.
 * Clean public API for portfolio functionality with proper categorization.
 */

// =============================================================================
// MAIN COMPONENTS
// =============================================================================

export { PortfolioMetrics } from "./PortfolioMetrics";
export { PortfolioTabs } from "./PortfolioTabs";
export { AssetCardNew } from "./AssetCardNew";
export { GroupDetailView } from "./GroupDetailView";
export { FileUploadModal } from "./FileUploadModal";
export { KnowledgeBaseModal } from "./KnowledgeBaseModal";

// =============================================================================
// TAB COMPONENTS
// =============================================================================

export { AssetsTab } from "./tabs/assets/AssetsTab";
export { RiskTab } from "./tabs/risk/RiskTab";
export { IntegrationTab } from "./tabs/integration/IntegrationTab";

// Risk Tab Components
export * from "./tabs/risk";

// Integration Tab Components
export * from "./tabs/integration";

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

export { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
export { GroupSettingsModal } from "./components/GroupSettingsModal";
export { GroupDeleteModal } from "./components/GroupDeleteModal";
export { PortfolioModalManager } from "./components/PortfolioModalManager";

// =============================================================================
// BUSINESS LOGIC
// =============================================================================

export * from "./logic/industryClassification";
export * from "./logic/grouping-logic";
export * from "./logic/pinning-logic";

// Logic Services (aliased for clean imports)
export {
	portfolioGroupingLogic,
	type GroupingOperation,
	type GroupingResult,
} from "./logic/grouping-logic";

export {
	portfolioPinningLogic,
	type PinnedAssetData,
	type PinningState,
} from "./logic/pinning-logic";

// =============================================================================
// DATA SERVICES & ORCHESTRATION
// =============================================================================

export * from "./services/portfolio-data";
export * from "./services/portfolio-orchestrator";
export * from "./services/portfolio-performance";

// Data Services (aliased for clean imports)
export {
	portfolioDataService,
	type PortfolioAsset,
	type GroupAsset,
	type PortfolioMetrics,
} from "./services/portfolio-data";

export {
	portfolioDataOrchestrator,
	type PortfolioData,
	type PortfolioFilter,
	type PortfolioSortConfig,
	type AssetEnrichmentData,
} from "./services/portfolio-orchestrator";

export {
	portfolioPerformanceService,
	type PortfolioPerformanceMetrics,
	type AssetPerformanceComparison,
	type PortfolioOptimizationSuggestions,
} from "./services/portfolio-performance";

// =============================================================================
// SPECIALIZED EXPORTS
// =============================================================================

// Monitoring Components (for portfolio risk tab)
export { MonitoringSpreadsheet } from "./monitoring/MonitoringSpreadsheet";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

// Re-export key types for external consumption
export type {
	// Asset Types
	PortfolioAsset,
	GroupAsset,
	PortfolioMetrics,
	// Logic Types
	GroupingOperation,
	GroupingResult,
	PinnedAssetData,
	PinningState,

	// Component Props (when needed externally)
} from "./services/portfolio-data";

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Industry Classification Utilities
export {
	getIndustryImage,
	getIndustryTag,
} from "./logic/industryClassification";

// =============================================================================
// HOOKS (if any are added in the future)
// =============================================================================

// Placeholder for portfolio-specific hooks
// export * from './hooks';

// =============================================================================
// CONSTANTS
// =============================================================================

// Portfolio-specific constants that might be used externally
export const PORTFOLIO_CONSTANTS = {
	MAX_PINNED_ASSETS: 10,
	MIN_GROUP_SIZE: 2,
	MAX_GROUP_SIZE: 50,
	CACHE_TTL_MINUTES: 15,
	DEFAULT_SORT: "performance",
	SUPPORTED_EXPORT_FORMATS: ["csv", "json", "pdf"] as const,
} as const;

// =============================================================================
// FEATURE STATUS
// =============================================================================

/**
 * Portfolio Feature Status
 *
 * This object provides information about the current state of portfolio features.
 * Useful for feature flags, progressive enhancement, and debugging.
 */
export const PORTFOLIO_FEATURE_STATUS = {
	// Core Features
	assetManagement: "stable",
	grouping: "stable",
	pinning: "stable",
	riskMonitoring: "beta",

	// Data Orchestration (New)
	dataOrchestration: "stable", // New centralized data management
	performanceAnalytics: "stable", // New comprehensive performance calculations
	sharedServiceIntegration: "stable", // Migrated to shared services

	// Data Integration
	icebergIntegration: "beta", // Integrated with data orchestrator
	realTimeUpdates: "beta", // Available through orchestrator
	contractorMetricsIntegration: "stable", // Moved to shared services

	// Advanced Features
	portfolioOptimization: "stable", // New with performance service
	riskAnalysis: "stable", // New comprehensive risk assessment
	performanceBenchmarking: "stable", // New benchmarking capabilities
	correlationAnalysis: "stable", // New correlation matrix calculations
	aiRecommendations: "experimental",
	advancedFiltering: "beta",
	customDashboards: "planned",

	// API Integration
	externalDataSources: "stable", // Integrated through orchestrator
	thirdPartyIntegrations: "beta", // Available via shared services
	largeDataCaching: "stable", // Integrated caching layer
} as const;

// =============================================================================
// VERSION INFO
// =============================================================================

export const PORTFOLIO_VERSION = {
	major: 2,
	minor: 1,
	patch: 0,
	prerelease: "stable",
	buildDate: "2025-01-24",
	features: [
		"Colocation Architecture",
		"Shared Services Integration",
		"Advanced Grouping Logic",
		"Persistent Pinning System",
		"Risk Monitoring Dashboard",
		"NAICS/PSC Classification",
		"Performance Color Coding",
		"Data Orchestration Service", // New
		"Portfolio Performance Analytics", // New
		"Contractor Metrics Integration", // New
		"Large Data Caching Layer", // New
		"Portfolio Optimization Engine", // New
		"Risk Analysis & Benchmarking", // New
		"Correlation Matrix Calculations", // New
		"Performance Attribution Analysis", // New
		"Multi-source Data Integration", // New
	],
} as const;
