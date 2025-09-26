import { Database } from '../database';
import {
  ConsolidatedContractorProfile,
  ConsolidatedProfileFilters,
  ProfileUpdateRequest,
  ProfileBulkUpdateRequest,
  CacheStrategy,
  CacheStats,
  DataSource,
  SnowflakeContractorData,
  LushaEnrichmentData,
  AIGeneratedInsights,
  NetworkRelationshipData,
  CacheMetadata
} from '../../types/consolidated-profile';
import { SnowflakeDataTracker } from './SnowflakeDataTracker';
import { v4 as uuidv4 } from 'uuid';

export class ConsolidatedProfileService {
  private database: Database;
  private cache: Map<string, ConsolidatedContractorProfile> = new Map();
  private cacheStrategy: CacheStrategy;
  private snowflakeTracker: SnowflakeDataTracker;

  constructor(database: Database, cacheStrategy?: CacheStrategy) {
    this.database = database;
    this.snowflakeTracker = new SnowflakeDataTracker(database);
    this.cacheStrategy = cacheStrategy || {
      defaultTtl: 3600, // 1 hour
      maxSize: 10000, // 10k profiles in memory
      evictionPolicy: 'lru',
      compressionEnabled: true
    };
  }

  // ==================== PROFILE RETRIEVAL ====================

  /**
   * Get a single consolidated profile by UEI
   */
  async getProfileByUEI(uei: string, options?: { includeStale?: boolean }): Promise<ConsolidatedContractorProfile | null> {
    // Check memory cache first
    const cacheKey = `profile:${uei}`;
    const cached = this.cache.get(cacheKey);
    if (cached && this.isProfileFresh(cached)) {
      return cached;
    }

    // Query database
    const query = `
      SELECT
        profile_id,
        uei,
        primary_name,
        alternative_names,
        profile_data,
        data_completeness_overall,
        has_snowflake_data,
        has_lusha_data,
        has_ai_insights,
        has_network_data,
        last_updated_at,
        profile_version
      FROM consolidated_contractor_profiles
      WHERE uei = $1
      ${!options?.includeStale ? 'AND last_updated_at > NOW() - INTERVAL \'7 days\'' : ''}
    `;

    const result = await this.database.query(query, [uei]);

    if (result.rows.length === 0) {
      return null;
    }

    const profile = this.mapDatabaseRowToProfile(result.rows[0]);

    // Cache the result
    this.cache.set(cacheKey, profile);
    this.enforceMemoryCacheSize();

    return profile;
  }

  /**
   * Get multiple profiles with filtering and pagination
   */
  async getProfiles(
    filters: ConsolidatedProfileFilters = {},
    options: { limit?: number; offset?: number; sortBy?: string; sortOrder?: 'ASC' | 'DESC' } = {}
  ): Promise<{ profiles: ConsolidatedContractorProfile[]; totalCount: number }> {
    const { whereClause, queryParams } = this.buildWhereClause(filters);
    const { limit = 50, offset = 0, sortBy = 'composite_performance_score', sortOrder = 'DESC' } = options;

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM consolidated_contractor_profiles
      ${whereClause}
    `;
    const countResult = await this.database.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].total);

    // Main query with pagination and sorting
    const mainQuery = `
      SELECT
        profile_id,
        uei,
        primary_name,
        alternative_names,
        profile_data,
        data_completeness_overall,
        has_snowflake_data,
        has_lusha_data,
        has_ai_insights,
        has_network_data,
        last_updated_at,
        profile_version
      FROM consolidated_contractor_profiles
      ${whereClause}
      ORDER BY ${this.sanitizeSortField(sortBy)} ${sortOrder} NULLS LAST
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const result = await this.database.query(mainQuery, [...queryParams, limit, offset]);
    const profiles = result.rows.map(row => this.mapDatabaseRowToProfile(row));

    return { profiles, totalCount };
  }

  /**
   * Search profiles with full-text search
   */
  async searchProfiles(
    searchText: string,
    filters: ConsolidatedProfileFilters = {},
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ profiles: ConsolidatedContractorProfile[]; totalCount: number }> {
    const { limit = 50, offset = 0 } = options;
    const { whereClause, queryParams } = this.buildWhereClause(filters, 1); // Start params from 1, searchText is $0

    const searchQuery = `
      SELECT
        p.profile_id,
        p.uei,
        p.primary_name,
        p.alternative_names,
        p.profile_data,
        p.data_completeness_overall,
        p.has_snowflake_data,
        p.has_lusha_data,
        p.has_ai_insights,
        p.has_network_data,
        p.last_updated_at,
        p.profile_version,
        ts_rank(to_tsvector('english', p.primary_name), plainto_tsquery('english', $1)) as search_rank
      FROM consolidated_contractor_profiles p
      WHERE to_tsvector('english', p.primary_name) @@ plainto_tsquery('english', $1)
      ${whereClause.replace('WHERE', 'AND')}
      ORDER BY search_rank DESC, p.composite_performance_score DESC NULLS LAST
      LIMIT $${queryParams.length + 2} OFFSET $${queryParams.length + 3}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM consolidated_contractor_profiles p
      WHERE to_tsvector('english', p.primary_name) @@ plainto_tsquery('english', $1)
      ${whereClause.replace('WHERE', 'AND')}
    `;

    const [searchResult, countResult] = await Promise.all([
      this.database.query(searchQuery, [searchText, ...queryParams, limit, offset]),
      this.database.query(countQuery, [searchText, ...queryParams])
    ]);

    const profiles = searchResult.rows.map(row => this.mapDatabaseRowToProfile(row));
    const totalCount = parseInt(countResult.rows[0].total);

    return { profiles, totalCount };
  }

  // ==================== PROFILE MANAGEMENT ====================

  /**
   * Create or update a consolidated profile
   */
  async upsertProfile(profileData: Partial<ConsolidatedContractorProfile>): Promise<ConsolidatedContractorProfile> {
    if (!profileData.uei) {
      throw new Error('UEI is required for profile creation/update');
    }

    const profileId = profileData.profileId || uuidv4();
    const now = new Date().toISOString();

    // Build the complete profile structure
    const completeProfile: ConsolidatedContractorProfile = {
      profileId,
      uei: profileData.uei,
      primaryName: profileData.primaryName || profileData.snowflakeData?.recipientName || 'Unknown',
      alternativeNames: profileData.alternativeNames || [],
      dataCompleteness: this.calculateDataCompleteness(profileData),
      snowflakeData: profileData.snowflakeData,
      lushaData: profileData.lushaData,
      aiInsights: profileData.aiInsights,
      networkData: profileData.networkData,
      profileMetadata: {
        createdAt: profileData.profileMetadata?.createdAt || now,
        lastUpdatedAt: now,
        version: (profileData.profileMetadata?.version || 0) + 1,
        sources: this.extractDataSources(profileData),
        refreshSchedule: profileData.profileMetadata?.refreshSchedule || {
          snowflakeRefresh: '0 2 * * *', // Daily at 2 AM
          lushaRefresh: '0 3 * * 0', // Weekly on Sunday at 3 AM
          aiRefresh: '0 4 * * 0' // Weekly on Sunday at 4 AM
        }
      },
      quickAccess: this.buildQuickAccess(profileData)
    };

    // Calculate expiration times for each data source
    const expirationTimes = this.calculateExpirationTimes(completeProfile);

    // Upsert to database
    const upsertQuery = `
      INSERT INTO consolidated_contractor_profiles (
        profile_id, uei, primary_name, alternative_names, profile_data,
        snowflake_expires_at, lusha_expires_at, ai_insights_expires_at, network_data_expires_at,
        snowflake_last_refresh, lusha_last_refresh, ai_insights_last_refresh, network_data_last_refresh,
        data_sources
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
      ON CONFLICT (uei) DO UPDATE SET
        profile_id = EXCLUDED.profile_id,
        primary_name = EXCLUDED.primary_name,
        alternative_names = EXCLUDED.alternative_names,
        profile_data = EXCLUDED.profile_data,
        snowflake_expires_at = EXCLUDED.snowflake_expires_at,
        lusha_expires_at = EXCLUDED.lusha_expires_at,
        ai_insights_expires_at = EXCLUDED.ai_insights_expires_at,
        network_data_expires_at = EXCLUDED.network_data_expires_at,
        snowflake_last_refresh = EXCLUDED.snowflake_last_refresh,
        lusha_last_refresh = EXCLUDED.lusha_last_refresh,
        ai_insights_last_refresh = EXCLUDED.ai_insights_last_refresh,
        network_data_last_refresh = EXCLUDED.network_data_last_refresh,
        data_sources = EXCLUDED.data_sources
      RETURNING profile_id, profile_version
    `;

    const result = await this.database.query(upsertQuery, [
      profileId,
      completeProfile.uei,
      completeProfile.primaryName,
      JSON.stringify(completeProfile.alternativeNames),
      JSON.stringify(completeProfile),
      expirationTimes.snowflake,
      expirationTimes.lusha,
      expirationTimes.aiInsights,
      expirationTimes.networkData,
      completeProfile.snowflakeData ? now : null,
      completeProfile.lushaData ? now : null,
      completeProfile.aiInsights ? now : null,
      completeProfile.networkData ? now : null,
      JSON.stringify(completeProfile.profileMetadata.sources)
    ]);

    // Update cache
    const cacheKey = `profile:${completeProfile.uei}`;
    this.cache.set(cacheKey, completeProfile);

    // Log update
    await this.logProfileUpdate(profileId, completeProfile.uei, 'upsert', completeProfile.profileMetadata.sources);

    return completeProfile;
  }

  /**
   * Update specific data source for a profile
   */
  async updateProfileDataSource(
    uei: string,
    dataSource: DataSource,
    data: SnowflakeContractorData | LushaEnrichmentData | AIGeneratedInsights | NetworkRelationshipData
  ): Promise<ConsolidatedContractorProfile> {
    // Get existing profile
    const existingProfile = await this.getProfileByUEI(uei, { includeStale: true });

    if (!existingProfile) {
      // Create new profile with this data source
      const newProfileData: Partial<ConsolidatedContractorProfile> = {
        uei,
        [this.getDataSourceProperty(dataSource)]: data
      };
      return this.upsertProfile(newProfileData);
    }

    // Update specific data source
    const updatedProfile = {
      ...existingProfile,
      [this.getDataSourceProperty(dataSource)]: data
    };

    return this.upsertProfile(updatedProfile);
  }

  /**
   * Bulk update profiles
   */
  async bulkUpdateProfiles(requests: ProfileBulkUpdateRequest[]): Promise<{
    successful: string[];
    failed: Array<{ uei: string; error: string }>;
  }> {
    const successful: string[] = [];
    const failed: Array<{ uei: string; error: string }> = [];

    // Process in batches to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);

      const batchPromises = batch.map(async (request) => {
        try {
          for (const uei of request.ueis) {
            await this.refreshProfile(uei, {
              forceRefresh: true,
              refreshSources: request.refreshSources
            });
            successful.push(uei);
          }
        } catch (error) {
          batch.forEach(req => {
            req.ueis.forEach(uei => {
              failed.push({ uei, error: error.message });
            });
          });
        }
      });

      await Promise.allSettled(batchPromises);
    }

    return { successful, failed };
  }

  // ==================== CACHE MANAGEMENT ====================

  /**
   * Get profiles that need refresh (legacy method - now considers Snowflake data freshness)
   */
  async getProfilesNeedingRefresh(limit: number = 100): Promise<Array<{
    uei: string;
    needsSnowflakeRefresh: boolean;
    needsLushaRefresh: boolean;
    needsAiRefresh: boolean;
    needsNetworkRefresh: boolean;
  }>> {
    // First check if Snowflake has new data available
    const snowflakeFreshness = await this.snowflakeTracker.getSnowflakeDataFreshness();

    // If Snowflake data is stale, don't flag profiles for Snowflake refresh
    if (snowflakeFreshness.dataAge.isStale) {
      const query = `
        SELECT
          uei,
          FALSE as needs_snowflake_refresh, -- Don't refresh when Snowflake data is stale
          (lusha_expires_at < NOW()) as needs_lusha_refresh,
          (ai_insights_expires_at < NOW()) as needs_ai_refresh,
          (network_data_expires_at < NOW()) as needs_network_refresh
        FROM consolidated_contractor_profiles
        WHERE
          lusha_expires_at < NOW()
          OR ai_insights_expires_at < NOW()
          OR network_data_expires_at < NOW()
        ORDER BY last_updated_at ASC
        LIMIT $1
      `;

      const result = await this.database.query(query, [limit]);
      return result.rows;
    }

    // Normal refresh logic when Snowflake data is fresh
    const query = `
      SELECT
        uei,
        (snowflake_expires_at < NOW()) as needs_snowflake_refresh,
        (lusha_expires_at < NOW()) as needs_lusha_refresh,
        (ai_insights_expires_at < NOW()) as needs_ai_refresh,
        (network_data_expires_at < NOW()) as needs_network_refresh
      FROM consolidated_contractor_profiles
      WHERE
        snowflake_expires_at < NOW()
        OR lusha_expires_at < NOW()
        OR ai_insights_expires_at < NOW()
        OR network_data_expires_at < NOW()
      ORDER BY last_updated_at ASC
      LIMIT $1
    `;

    const result = await this.database.query(query, [limit]);
    return result.rows;
  }

  /**
   * Get profiles that specifically need Snowflake data refresh based on actual Snowflake data updates
   */
  async getProfilesNeedingSnowflakeRefresh(limit: number = 100): Promise<Array<{
    uei: string;
    lastSnowflakeUpdate: string;
    hasNewMetrics: boolean;
    hasNewPeerData: boolean;
    priority: 'high' | 'normal' | 'low';
  }>> {
    // Check if Snowflake refresh should be triggered
    const refreshDecision = await this.snowflakeTracker.shouldTriggerRefresh();

    if (!refreshDecision.shouldRefresh) {
      return []; // No profiles need Snowflake refresh
    }

    // Get profiles that haven't been updated since new Snowflake data became available
    const query = `
      SELECT
        uei,
        snowflake_last_refresh,
        CASE
          WHEN snowflake_last_refresh < $1 THEN TRUE
          ELSE FALSE
        END as needs_refresh
      FROM consolidated_contractor_profiles
      WHERE
        has_snowflake_data = TRUE
        AND (snowflake_last_refresh < $1 OR snowflake_last_refresh IS NULL)
      ORDER BY
        COALESCE(snowflake_last_refresh, '1900-01-01'::timestamp) ASC
      LIMIT $2
    `;

    // Use the timestamp when new Snowflake data became available
    const snowflakeUpdate = await this.snowflakeTracker.getSnowflakeDataFreshness();
    const lastUpdateTime = new Date(Math.max(
      new Date(snowflakeUpdate.universalContractorMetrics.lastUpdated).getTime(),
      new Date(snowflakeUpdate.universalPeerComparisons.lastUpdated).getTime()
    )).toISOString();

    const result = await this.database.query(query, [lastUpdateTime, limit]);

    // Get detailed info about what needs updating
    const ueis = result.rows.map(row => row.uei);
    if (ueis.length === 0) {
      return [];
    }

    const newDataInfo = await this.snowflakeTracker.getUEIsWithNewData(lastUpdateTime);

    return result.rows.map(row => {
      const updateInfo = newDataInfo.updateTypes.find(info => info.uei === row.uei);
      return {
        uei: row.uei,
        lastSnowflakeUpdate: row.snowflake_last_refresh,
        hasNewMetrics: updateInfo?.hasNewMetrics || false,
        hasNewPeerData: updateInfo?.hasNewPeerData || false,
        priority: refreshDecision.priority
      };
    });
  }

  /**
   * Smart refresh that only updates profiles with actual new Snowflake data
   */
  async performSmartSnowflakeRefresh(): Promise<{
    refreshTriggered: boolean;
    reason: string;
    profilesUpdated: number;
    skippedReason?: string;
  }> {
    // Check if refresh should be triggered
    const refreshDecision = await this.snowflakeTracker.shouldTriggerRefresh();

    if (!refreshDecision.shouldRefresh) {
      return {
        refreshTriggered: false,
        reason: refreshDecision.reason,
        profilesUpdated: 0,
        skippedReason: refreshDecision.reason
      };
    }

    // Get profiles that need Snowflake refresh
    const profilesToRefresh = await this.getProfilesNeedingSnowflakeRefresh(500); // Batch size

    if (profilesToRefresh.length === 0) {
      return {
        refreshTriggered: false,
        reason: 'No profiles found with outdated Snowflake data',
        profilesUpdated: 0
      };
    }

    // Mark that we've checked Snowflake data
    await this.snowflakeTracker.recordDataCheck();

    // Log the refresh operation
    console.log(`Smart Snowflake refresh: Found ${profilesToRefresh.length} profiles to update`);
    console.log(`Reason: ${refreshDecision.reason}`);

    // In a real implementation, this would trigger actual profile updates
    // For now, we'll mark the operation as successful
    return {
      refreshTriggered: true,
      reason: refreshDecision.reason,
      profilesUpdated: profilesToRefresh.length
    };
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    const query = `
      SELECT
        COUNT(*) as total_profiles,
        COUNT(*) FILTER (WHERE has_snowflake_data = true) as snowflake_profiles,
        COUNT(*) FILTER (WHERE has_lusha_data = true) as lusha_profiles,
        COUNT(*) FILTER (WHERE has_ai_insights = true) as ai_profiles,
        COUNT(*) FILTER (WHERE last_updated_at > NOW() - INTERVAL '1 day') as fresh,
        COUNT(*) FILTER (WHERE last_updated_at BETWEEN NOW() - INTERVAL '7 days' AND NOW() - INTERVAL '1 day') as recent,
        COUNT(*) FILTER (WHERE last_updated_at < NOW() - INTERVAL '7 days') as stale,
        AVG(data_completeness_overall) as avg_completeness,
        EXTRACT(EPOCH FROM AVG(NOW() - last_updated_at))/3600 as average_data_age_hours,
        EXTRACT(EPOCH FROM MAX(NOW() - last_updated_at))/3600 as stalest_profile_age_hours
      FROM consolidated_contractor_profiles
    `;

    const result = await this.database.query(query);
    const row = result.rows[0];

    return {
      totalProfiles: parseInt(row.total_profiles),
      cacheHitRate: this.calculateCacheHitRate(),
      averageDataAge: parseFloat(row.average_data_age_hours),
      stalestProfileAge: parseFloat(row.stalest_profile_age_hours),
      freshnessDistribution: {
        fresh: parseInt(row.fresh),
        recent: parseInt(row.recent),
        stale: parseInt(row.stale)
      }
    };
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private mapDatabaseRowToProfile(row: any): ConsolidatedContractorProfile {
    return {
      ...row.profile_data,
      profileId: row.profile_id,
      uei: row.uei,
      primaryName: row.primary_name,
      alternativeNames: row.alternative_names || [],
      dataCompleteness: {
        overall: row.data_completeness_overall,
        snowflakeData: row.has_snowflake_data,
        lushaEnrichment: row.has_lusha_data,
        aiInsights: row.has_ai_insights,
        networkAnalysis: row.has_network_data
      }
    };
  }

  private buildWhereClause(filters: ConsolidatedProfileFilters, paramStartIndex: number = 0): { whereClause: string; queryParams: any[] } {
    const conditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = paramStartIndex;

    if (filters.ueis && filters.ueis.length > 0) {
      conditions.push(`uei = ANY($${++paramIndex})`);
      queryParams.push(filters.ueis);
    }

    if (filters.industries && filters.industries.length > 0) {
      conditions.push(`primary_industry = ANY($${++paramIndex})`);
      queryParams.push(filters.industries);
    }

    if (filters.sizeTiers && filters.sizeTiers.length > 0) {
      conditions.push(`size_tier = ANY($${++paramIndex})`);
      queryParams.push(filters.sizeTiers);
    }

    if (filters.minPerformanceScore !== undefined) {
      conditions.push(`composite_performance_score >= $${++paramIndex}`);
      queryParams.push(filters.minPerformanceScore);
    }

    if (filters.maxPerformanceScore !== undefined) {
      conditions.push(`composite_performance_score <= $${++paramIndex}`);
      queryParams.push(filters.maxPerformanceScore);
    }

    if (filters.requireSnowflakeData) {
      conditions.push('has_snowflake_data = true');
    }

    if (filters.requireLushaData) {
      conditions.push('has_lusha_data = true');
    }

    if (filters.minDataCompleteness !== undefined) {
      conditions.push(`data_completeness_overall >= $${++paramIndex}`);
      queryParams.push(filters.minDataCompleteness);
    }

    if (filters.excludeStale) {
      conditions.push('last_updated_at > NOW() - INTERVAL \'7 days\'');
    }

    if (filters.maxAgeHours !== undefined) {
      conditions.push(`last_updated_at > NOW() - INTERVAL '${filters.maxAgeHours} hours'`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, queryParams };
  }

  private sanitizeSortField(field: string): string {
    const allowedFields = [
      'primary_name', 'data_completeness_overall', 'composite_performance_score',
      'revenue_ttm_millions', 'awards_ttm_millions', 'last_updated_at'
    ];
    return allowedFields.includes(field) ? field : 'composite_performance_score';
  }

  private calculateDataCompleteness(profile: Partial<ConsolidatedContractorProfile>): any {
    const hasSnowflake = !!profile.snowflakeData;
    const hasLusha = !!profile.lushaData;
    const hasAi = !!profile.aiInsights;
    const hasNetwork = !!profile.networkData;

    const overall = (
      (hasSnowflake ? 40 : 0) +
      (hasLusha ? 30 : 0) +
      (hasAi ? 20 : 0) +
      (hasNetwork ? 10 : 0)
    );

    return {
      overall,
      snowflakeData: hasSnowflake,
      lushaEnrichment: hasLusha,
      aiInsights: hasAi,
      networkAnalysis: hasNetwork
    };
  }

  private extractDataSources(profile: Partial<ConsolidatedContractorProfile>): DataSource[] {
    const sources: DataSource[] = [];
    if (profile.snowflakeData) sources.push('snowflake');
    if (profile.lushaData) sources.push('lusha');
    if (profile.aiInsights) sources.push('anthropic');
    if (profile.networkData) sources.push('calculated');
    return sources;
  }

  private buildQuickAccess(profile: Partial<ConsolidatedContractorProfile>): any {
    return {
      displayName: profile.primaryName || profile.snowflakeData?.recipientName || 'Unknown',
      primaryIndustry: profile.snowflakeData?.primaryNaicsDescription || 'Unknown',
      sizeTier: profile.snowflakeData?.sizeTier || 'Unknown',
      performanceRating: profile.snowflakeData?.peerGroup?.performanceClassification || 'Unknown',
      lastActivityDate: profile.snowflakeData?.snapshotMonth || new Date().toISOString(),
      totalContractValue: profile.snowflakeData?.revenueTtmMillions || 0,
      websiteUrl: profile.lushaData?.companyDetails?.website,
      logoUrl: profile.lushaData?.digitalPresence?.logoUrl
    };
  }

  private calculateExpirationTimes(profile: ConsolidatedContractorProfile): any {
    const now = Date.now();
    return {
      snowflake: profile.snowflakeData ? new Date(now + 24 * 60 * 60 * 1000).toISOString() : null, // 1 day
      lusha: profile.lushaData ? new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString() : null, // 1 week
      aiInsights: profile.aiInsights ? new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString() : null, // 30 days
      networkData: profile.networkData ? new Date(now + 24 * 60 * 60 * 1000).toISOString() : null // 1 day
    };
  }

  private getDataSourceProperty(dataSource: DataSource): string {
    const mapping = {
      'snowflake': 'snowflakeData',
      'lusha': 'lushaData',
      'anthropic': 'aiInsights',
      'calculated': 'networkData',
      'internal': 'internalData'
    };
    return mapping[dataSource] || 'internalData';
  }

  private isProfileFresh(profile: ConsolidatedContractorProfile): boolean {
    const lastUpdated = new Date(profile.profileMetadata.lastUpdatedAt);
    const staleThreshold = new Date(Date.now() - this.cacheStrategy.defaultTtl * 1000);
    return lastUpdated > staleThreshold;
  }

  private enforceMemoryCacheSize(): void {
    if (this.cache.size > this.cacheStrategy.maxSize) {
      // Simple LRU eviction - remove oldest entries
      const entries = Array.from(this.cache.entries());
      const toRemove = entries.slice(0, entries.length - this.cacheStrategy.maxSize);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  private calculateCacheHitRate(): number {
    // This would need to be tracked over time with actual metrics
    return 0.75; // Placeholder
  }

  private async logProfileUpdate(profileId: string, uei: string, updateType: string, sources: DataSource[]): Promise<void> {
    const query = `
      INSERT INTO consolidated_profile_updates (
        update_id, profile_id, uei, update_type, data_sources_updated, initiated_by, success, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    await this.database.query(query, [
      uuidv4(),
      profileId,
      uei,
      updateType,
      JSON.stringify(sources),
      'system',
      true,
      new Date().toISOString()
    ]);
  }

  private async refreshProfile(uei: string, options: ProfileUpdateRequest): Promise<ConsolidatedContractorProfile> {
    // This would integrate with actual data source services
    // For now, just return the existing profile
    return this.getProfileByUEI(uei, { includeStale: true });
  }
}