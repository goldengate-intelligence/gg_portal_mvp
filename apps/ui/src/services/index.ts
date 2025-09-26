/**
 * Shared Services Index
 *
 * Central export point for all shared services across the application.
 * Organized by service category for easy discovery and maintenance.
 */

// Data Sources
export * from "./data-sources/iceberg-reader";
export * from "./data-sources/snowflake-api";
export * from "./data-sources/lusha-api";

// Consolidated Services - New unified APIs
export * from "./contractors"; // Unified contractor services
export * from "./visualization"; // Unified visualization services
export * from "./data-classification"; // Unified classification services
export * from "./industry-image-matching"; // Industry image matching service

// Individual Services - For backward compatibility
export * from "./classification/naics-psc-service";
export * from "./visualization/performance-colors";
export * from "./visualization/utilization-colors";
export * from "./contractors/contractor-logo-service";
export * from "./contractors/contractor-metrics-service";
export * from "./contractors/lusha-enrichment-service";
export * from "./reference-data";

// Caching Services
export * from "./caching/large-data-cache";

// Service Instances (for direct import)
export { icebergReader } from "./data-sources/iceberg-reader";
export { snowflakeApi } from "./data-sources/snowflake-api";
export { lushaApi } from "./data-sources/lusha-api";
export { naicsPscService } from "./classification/naics-psc-service";
export { performanceColors } from "./visualization/performance-colors";
export { utilizationColors } from "./visualization/utilization-colors";
export { contractorLogoService } from "./contractors/contractor-logo-service";
export { contractorMetricsService } from "./contractors/contractor-metrics-service";
export { lushaEnrichmentService } from "./contractors/lusha-enrichment-service";

// Unified Service Instances - New consolidated APIs
export { unifiedContractorService } from "./contractors";
export { unifiedVisualizationService } from "./visualization";
export { unifiedDataClassificationService } from "./data-classification";
