// Example: Smart Snowflake-Aware Profile Refresh System
// Only refreshes profiles when new Snowflake data is actually available

import { createConsolidatedProfileSystem } from '../index';
import { Database } from '../../database';

async function demonstrateSmartRefresh() {
  const database = new Database();
  const profiles = createConsolidatedProfileSystem(database);

  console.log('=== Smart Snowflake-Aware Profile Refresh Demo ===\n');

  // 1. Check current Snowflake data freshness
  console.log('1. Checking Snowflake data freshness...');
  const freshness = await profiles.checkSnowflakeDataFreshness();

  console.log(`   - Universal Contractor Metrics last updated: ${freshness.universalContractorMetrics.lastUpdated}`);
  console.log(`   - Universal Peer Comparisons last updated: ${freshness.universalPeerComparisons.lastUpdated}`);
  console.log(`   - Data age: ${freshness.dataAge.hoursOld.toFixed(1)} hours`);
  console.log(`   - Is stale: ${freshness.dataAge.isStale ? 'YES' : 'NO'}`);

  if (freshness.dataAge.isStale) {
    console.log('   ⚠️  Snowflake data is stale - profile refreshes will be skipped');
  } else {
    console.log('   ✅ Snowflake data is fresh - profiles can be refreshed');
  }

  // 2. Get current refresh status
  console.log('\n2. Getting refresh scheduler status...');
  const status = await profiles.getRefreshStatus();

  console.log(`   - Scheduler running: ${status.isRunning}`);
  console.log(`   - Snowflake data age: ${status.snowflakeDataAge.toFixed(1)} hours`);
  console.log(`   - Profiles needing refresh:`);
  console.log(`     • Snowflake: ${status.profilesNeedingRefresh.snowflake}`);
  console.log(`     • Lusha: ${status.profilesNeedingRefresh.lusha}`);
  console.log(`     • AI Insights: ${status.profilesNeedingRefresh.aiInsights}`);
  console.log(`   - Refresh decision: ${status.refreshDecision.shouldRefresh ? 'REFRESH' : 'SKIP'}`);
  console.log(`   - Reason: ${status.refreshDecision.reason}`);
  console.log(`   - Next recommended run: ${status.nextRecommendedRun}`);

  // 3. Run smart refresh
  console.log('\n3. Running smart refresh...');
  const refreshResult = await profiles.runSmartRefresh();

  if (refreshResult.executed) {
    console.log(`   ✅ Refresh executed: ${refreshResult.reason}`);

    if (refreshResult.results) {
      const { snowflakeRefresh, otherRefreshes } = refreshResult.results;

      console.log(`   - Snowflake refresh:`);
      console.log(`     • Triggered: ${snowflakeRefresh.triggered}`);
      console.log(`     • Profiles updated: ${snowflakeRefresh.profilesUpdated}`);
      console.log(`     • Reason: ${snowflakeRefresh.reason}`);

      console.log(`   - Other refreshes:`);
      console.log(`     • Lusha profiles: ${otherRefreshes.lushaProfiles}`);
      console.log(`     • AI insight profiles: ${otherRefreshes.aiInsightsProfiles}`);
    }

    console.log(`   - Next check recommended: ${refreshResult.nextCheckRecommended}`);
  } else {
    console.log(`   ⏭️  Refresh skipped: ${refreshResult.reason}`);
  }

  // 4. Demonstrate different scenarios
  console.log('\n4. Scenario demonstrations...');

  // Scenario A: Force refresh regardless of Snowflake data freshness
  console.log('\n   Scenario A: Force refresh all data sources');
  const forceResult = await profiles.forceRefresh({
    snowflake: true,
    lusha: true,
    aiInsights: true,
    maxProfiles: 50
  });

  console.log(`   - Snowflake profiles refreshed: ${forceResult.snowflakeRefreshed}`);
  console.log(`   - Lusha profiles refreshed: ${forceResult.lushaRefreshed}`);
  console.log(`   - AI insights profiles refreshed: ${forceResult.aiInsightsRefreshed}`);
  if (forceResult.errors.length > 0) {
    console.log(`   - Errors: ${forceResult.errors.join(', ')}`);
  }

  // Scenario B: Get specific profiles that have new Snowflake data
  console.log('\n   Scenario B: Check which profiles have new Snowflake data');
  const profilesWithNewData = await profiles.service.getProfilesNeedingSnowflakeRefresh(10);

  if (profilesWithNewData.length > 0) {
    console.log(`   Found ${profilesWithNewData.length} profiles with new Snowflake data:`);
    profilesWithNewData.forEach((profile, index) => {
      console.log(`     ${index + 1}. ${profile.uei}`);
      console.log(`        - Last Snowflake update: ${profile.lastSnowflakeUpdate}`);
      console.log(`        - Has new metrics: ${profile.hasNewMetrics}`);
      console.log(`        - Has new peer data: ${profile.hasNewPeerData}`);
      console.log(`        - Priority: ${profile.priority}`);
    });
  } else {
    console.log('   No profiles found with new Snowflake data');
  }

  // 5. Health check
  console.log('\n5. System health check...');
  const health = await profiles.scheduler.healthCheck();

  if (health.healthy) {
    console.log('   ✅ System is healthy');
  } else {
    console.log('   ⚠️  Health issues detected:');
    health.issues.forEach(issue => {
      console.log(`     - ${issue}`);
    });
  }

  console.log('   Metrics:');
  console.log(`     - Snowflake data age: ${health.metrics.snowflakeDataAge.toFixed(1)} hours`);
  console.log(`     - Oldest profile age: ${health.metrics.oldestProfileAge.toFixed(1)} hours`);
  console.log(`     - Profiles with stale data: ${health.metrics.profilesWithStaleData}`);

  console.log('\n=== Smart Refresh Demo Complete ===');
}

// Usage in a cron job or scheduled task
async function scheduledRefreshJob() {
  console.log('Starting scheduled refresh job...');

  const profiles = createConsolidatedProfileSystem(new Database());

  try {
    const result = await profiles.runSmartRefresh();

    if (result.executed && result.results?.snowflakeRefresh.triggered) {
      console.log(`✅ Refreshed ${result.results.snowflakeRefresh.profilesUpdated} profiles with new Snowflake data`);
    } else {
      console.log(`⏭️  Skipped refresh: ${result.reason}`);
    }

  } catch (error) {
    console.error('Scheduled refresh failed:', error);

    // Could send alerts or notifications here
    // await sendSlackAlert('Profile refresh failed', error.message);
  }
}

// Usage in a monitoring dashboard
async function getDashboardMetrics() {
  const profiles = createConsolidatedProfileSystem(new Database());

  return {
    // Current system status
    status: await profiles.getRefreshStatus(),

    // Data freshness
    snowflakeFreshness: await profiles.checkSnowflakeDataFreshness(),

    // System health
    health: await profiles.scheduler.healthCheck(),

    // Cache performance
    cacheStats: await profiles.service.getCacheStats()
  };
}

export {
  demonstrateSmartRefresh,
  scheduledRefreshJob,
  getDashboardMetrics
};