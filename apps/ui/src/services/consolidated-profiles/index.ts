// Consolidated Profile System - Main Exports
// Unified caching and data management for all contractor data sources

export { ConsolidatedProfileService } from './ConsolidatedProfileService';
export { ProfileDataMerger, profileDataMerger } from './ProfileDataMerger';
export { ConsolidatedProfileAdapter, consolidatedProfileAdapter } from './ConsolidatedProfileAdapter';
export { SnowflakeDataTracker, snowflakeDataTracker } from './SnowflakeDataTracker';
export { ProfileRefreshScheduler, profileRefreshScheduler } from './ProfileRefreshScheduler';

// Re-export types for convenience
export {
  ConsolidatedContractorProfile,
  SnowflakeContractorData,
  LushaEnrichmentData,
  AIGeneratedInsights,
  NetworkRelationshipData,
  ConsolidatedProfileFilters,
  ProfileUpdateRequest,
  ProfileBulkUpdateRequest,
  CacheStrategy,
  CacheStats,
  DataSource,
  CacheMetadata
} from '../../types/consolidated-profile';

// Quick start utilities
export const createConsolidatedProfileSystem = (database: any) => {
  const service = new ConsolidatedProfileService(database);
  const merger = new ProfileDataMerger();
  const adapter = new ConsolidatedProfileAdapter(database);
  const tracker = new SnowflakeDataTracker(database);
  const scheduler = new ProfileRefreshScheduler(database);

  return {
    service,
    merger,
    adapter,
    tracker,
    scheduler,
    // High-level operations
    async getProfile(uei: string) {
      return service.getProfileByUEI(uei);
    },
    async searchProfiles(query: string, filters = {}) {
      return service.searchProfiles(query, filters);
    },
    async updateFromSnowflake(uei: string, data: any) {
      return adapter.integrateSnowflakeData(uei, data);
    },
    async updateFromLusha(uei: string, data: any) {
      return adapter.integrateLushaData(uei, data);
    },
    async generateInsights(uei: string) {
      return adapter.generateAIInsights(uei);
    },
    // Smart refresh operations
    async checkSnowflakeDataFreshness() {
      return tracker.getSnowflakeDataFreshness();
    },
    async runSmartRefresh() {
      return scheduler.runScheduledRefresh();
    },
    async getRefreshStatus() {
      return scheduler.getSchedulerStatus();
    },
    async forceRefresh(options: any) {
      return scheduler.forceRefresh(options);
    }
  };
};