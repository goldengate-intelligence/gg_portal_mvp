/**
 * Shared Services Index
 *
 * Central export point for all shared services across the application.
 * Organized by service category for easy discovery and maintenance.
 */

// Data Sources
export * from './data-sources/iceberg-reader';
export * from './data-sources/snowflake-api';
export * from './data-sources/lusha-api';

// Classification Services
export * from './classification/naics-psc-service';

// Visualization Services
export * from './visualization/performance-colors';
export * from './visualization/utilization-colors';

// Contractor Services
export * from './contractors/contractor-logo-service';

// Caching Services
export * from './caching/large-data-cache';

// Service Instances (for direct import)
export { icebergReader } from './data-sources/iceberg-reader';
export { snowflakeApi } from './data-sources/snowflake-api';
export { lushaApi } from './data-sources/lusha-api';
export { naicsPscService } from './classification/naics-psc-service';
export { performanceColors } from './visualization/performance-colors';
export { utilizationColors } from './visualization/utilization-colors';
export { contractorLogoService } from './contractors/contractor-logo-service';