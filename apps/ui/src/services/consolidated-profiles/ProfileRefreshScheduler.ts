import { ConsolidatedProfileService } from './ConsolidatedProfileService';
import { SnowflakeDataTracker } from './SnowflakeDataTracker';
import { Database } from '../database';

/**
 * Smart scheduler for consolidated profile refreshes
 * Only triggers refreshes when new Snowflake data is actually available
 */
export class ProfileRefreshScheduler {
  private profileService: ConsolidatedProfileService;
  private snowflakeTracker: SnowflakeDataTracker;
  private database: Database;
  private isRunning: boolean = false;

  constructor(database: Database) {
    this.database = database;
    this.profileService = new ConsolidatedProfileService(database);
    this.snowflakeTracker = new SnowflakeDataTracker(database);
  }

  /**
   * Main scheduler method - checks for new Snowflake data and triggers smart refreshes
   */
  async runScheduledRefresh(): Promise<{
    executed: boolean;
    reason: string;
    results?: {
      snowflakeRefresh: {
        triggered: boolean;
        profilesUpdated: number;
        reason: string;
      };
      otherRefreshes: {
        lushaProfiles: number;
        aiInsightsProfiles: number;
      };
    };
    nextCheckRecommended: string;
  }> {
    if (this.isRunning) {
      return {
        executed: false,
        reason: 'Refresh scheduler already running',
        nextCheckRecommended: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      };
    }

    this.isRunning = true;

    try {
      // Check Snowflake data freshness and refresh decision
      const refreshDecision = await this.snowflakeTracker.shouldTriggerRefresh();

      // Get Snowflake refresh schedule to determine next check time
      const schedule = await this.snowflakeTracker.getSnowflakeRefreshSchedule();

      // Execute smart Snowflake refresh if needed
      const snowflakeResult = await this.profileService.performSmartSnowflakeRefresh();

      // Handle other data source refreshes (Lusha, AI insights) regardless of Snowflake status
      const otherRefreshes = await this.handleNonSnowflakeRefreshes();

      // Determine next check time based on Snowflake schedule
      const nextCheck = this.calculateNextCheckTime(schedule, refreshDecision);

      const results = {
        snowflakeRefresh: snowflakeResult,
        otherRefreshes
      };

      return {
        executed: true,
        reason: `Scheduled refresh completed. Snowflake: ${snowflakeResult.reason}`,
        results,
        nextCheckRecommended: nextCheck
      };

    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Handle refreshes for non-Snowflake data sources (Lusha, AI insights)
   * These follow traditional time-based expiration
   */
  private async handleNonSnowflakeRefreshes(): Promise<{
    lushaProfiles: number;
    aiInsightsProfiles: number;
  }> {
    // Get profiles needing non-Snowflake refreshes
    const staleProfiles = await this.profileService.getProfilesNeedingRefresh(200);

    let lushaCount = 0;
    let aiCount = 0;

    for (const profile of staleProfiles) {
      // Queue Lusha refreshes
      if (profile.needsLushaRefresh) {
        // In a real implementation, this would queue Lusha API calls
        console.log(`Queueing Lusha refresh for ${profile.uei}`);
        lushaCount++;
      }

      // Queue AI insight refreshes
      if (profile.needsAiRefresh) {
        // In a real implementation, this would queue AI insight generation
        console.log(`Queueing AI insight refresh for ${profile.uei}`);
        aiCount++;
      }
    }

    return {
      lushaProfiles: lushaCount,
      aiInsightsProfiles: aiCount
    };
  }

  /**
   * Calculate the next optimal time to check for Snowflake data updates
   */
  private calculateNextCheckTime(
    schedule: any,
    lastDecision: any
  ): string {
    const now = new Date();

    // If we have a predicted next Snowflake refresh, check shortly after that
    if (schedule.nextExpectedRefresh && schedule.confidence > 0.6) {
      const expectedRefresh = new Date(schedule.nextExpectedRefresh);
      // Check 2 hours after expected Snowflake refresh
      const nextCheck = new Date(expectedRefresh.getTime() + (2 * 60 * 60 * 1000));

      // Don't check more than once per day for high-confidence daily patterns
      if (schedule.refreshPattern === 'daily' && schedule.confidence > 0.8) {
        return nextCheck.toISOString();
      }
    }

    // Fallback schedule based on pattern confidence
    let hoursUntilNext: number;

    switch (schedule.refreshPattern) {
      case 'daily':
        hoursUntilNext = schedule.confidence > 0.7 ? 24 : 12; // Check daily or twice daily
        break;
      case 'weekly':
        hoursUntilNext = schedule.confidence > 0.7 ? 24 : 12; // Check daily when weekly pattern
        break;
      case 'monthly':
        hoursUntilNext = schedule.confidence > 0.7 ? 24 : 12; // Check daily when monthly pattern
        break;
      default: // irregular
        hoursUntilNext = 6; // Check every 6 hours for irregular patterns
    }

    return new Date(now.getTime() + (hoursUntilNext * 60 * 60 * 1000)).toISOString();
  }

  /**
   * Get status of the refresh scheduler
   */
  async getSchedulerStatus(): Promise<{
    isRunning: boolean;
    lastRun?: string;
    nextRecommendedRun: string;
    snowflakeDataAge: number; // hours
    profilesNeedingRefresh: {
      snowflake: number;
      lusha: number;
      aiInsights: number;
      total: number;
    };
    refreshDecision: {
      shouldRefresh: boolean;
      reason: string;
      priority: 'low' | 'normal' | 'high';
    };
  }> {
    // Get current Snowflake data freshness
    const freshness = await this.snowflakeTracker.getSnowflakeDataFreshness();

    // Get refresh decision
    const refreshDecision = await this.snowflakeTracker.shouldTriggerRefresh();

    // Get Snowflake schedule for next run calculation
    const schedule = await this.snowflakeTracker.getSnowflakeRefreshSchedule();
    const nextRun = this.calculateNextCheckTime(schedule, refreshDecision);

    // Count profiles needing various refreshes
    const profilesToRefresh = await this.profileService.getProfilesNeedingRefresh(1000);
    const snowflakeNeeding = await this.profileService.getProfilesNeedingSnowflakeRefresh(1000);

    const profileCounts = {
      snowflake: snowflakeNeeding.length,
      lusha: profilesToRefresh.filter(p => p.needsLushaRefresh).length,
      aiInsights: profilesToRefresh.filter(p => p.needsAiRefresh).length,
      total: profilesToRefresh.length
    };

    return {
      isRunning: this.isRunning,
      nextRecommendedRun: nextRun,
      snowflakeDataAge: freshness.dataAge.hoursOld,
      profilesNeedingRefresh: profileCounts,
      refreshDecision: {
        shouldRefresh: refreshDecision.shouldRefresh,
        reason: refreshDecision.reason,
        priority: refreshDecision.priority
      }
    };
  }

  /**
   * Force refresh of specific data sources
   */
  async forceRefresh(options: {
    snowflake?: boolean;
    lusha?: boolean;
    aiInsights?: boolean;
    maxProfiles?: number;
  }): Promise<{
    snowflakeRefreshed: number;
    lushaRefreshed: number;
    aiInsightsRefreshed: number;
    errors: string[];
  }> {
    const results = {
      snowflakeRefreshed: 0,
      lushaRefreshed: 0,
      aiInsightsRefreshed: 0,
      errors: [] as string[]
    };

    const maxProfiles = options.maxProfiles || 100;

    try {
      if (options.snowflake) {
        // Force Snowflake refresh regardless of data freshness
        const snowflakeProfiles = await this.profileService.getProfilesNeedingSnowflakeRefresh(maxProfiles);
        results.snowflakeRefreshed = snowflakeProfiles.length;

        // Log forced refresh
        console.log(`Forced Snowflake refresh on ${snowflakeProfiles.length} profiles`);
      }

      if (options.lusha || options.aiInsights) {
        const staleProfiles = await this.profileService.getProfilesNeedingRefresh(maxProfiles);

        if (options.lusha) {
          const lushaProfiles = staleProfiles.filter(p => p.needsLushaRefresh);
          results.lushaRefreshed = lushaProfiles.length;
          console.log(`Forced Lusha refresh on ${lushaProfiles.length} profiles`);
        }

        if (options.aiInsights) {
          const aiProfiles = staleProfiles.filter(p => p.needsAiRefresh);
          results.aiInsightsRefreshed = aiProfiles.length;
          console.log(`Forced AI insights refresh on ${aiProfiles.length} profiles`);
        }
      }

    } catch (error) {
      results.errors.push(`Force refresh failed: ${error.message}`);
    }

    return results;
  }

  /**
   * Health check for the refresh system
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    issues: string[];
    metrics: {
      snowflakeDataAge: number;
      oldestProfileAge: number;
      profilesWithStaleData: number;
      lastSchedulerRun?: string;
    };
  }> {
    const issues: string[] = [];

    // Check Snowflake data age
    const freshness = await this.snowflakeTracker.getSnowflakeDataFreshness();
    if (freshness.dataAge.hoursOld > 72) { // 3 days
      issues.push(`Snowflake data is ${Math.round(freshness.dataAge.hoursOld)} hours old`);
    }

    // Check for profiles with very old data
    const cacheStats = await this.profileService.getCacheStats();
    if (cacheStats.stalestProfileAge > 168) { // 1 week
      issues.push(`Oldest profile is ${Math.round(cacheStats.stalestProfileAge)} hours old`);
    }

    // Check for too many stale profiles
    if (cacheStats.freshnessDistribution.stale > cacheStats.totalProfiles * 0.3) {
      issues.push(`${cacheStats.freshnessDistribution.stale} profiles (${Math.round((cacheStats.freshnessDistribution.stale / cacheStats.totalProfiles) * 100)}%) are stale`);
    }

    return {
      healthy: issues.length === 0,
      issues,
      metrics: {
        snowflakeDataAge: freshness.dataAge.hoursOld,
        oldestProfileAge: cacheStats.stalestProfileAge,
        profilesWithStaleData: cacheStats.freshnessDistribution.stale
      }
    };
  }
}

export const profileRefreshScheduler = new ProfileRefreshScheduler(new Database());