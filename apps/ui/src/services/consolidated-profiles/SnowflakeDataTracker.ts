import { Database } from '../database';

/**
 * Service that tracks Snowflake data freshness and determines when profiles need updates
 * Only triggers profile refreshes when new Snowflake data is actually available
 */
export class SnowflakeDataTracker {
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  /**
   * Check when Snowflake tables were last updated
   */
  async getSnowflakeDataFreshness(): Promise<{
    universalContractorMetrics: {
      lastUpdated: string;
      recordCount: number;
      latestSnapshotMonth: string;
    };
    universalPeerComparisons: {
      lastUpdated: string;
      recordCount: number;
      latestSnapshotMonth: string;
    };
    dataAge: {
      hoursOld: number;
      isStale: boolean;
    };
  }> {
    // Query Snowflake information schema and table metadata
    const queries = [
      // Check universal contractor metrics table
      `SELECT
        MAX(created_at) as last_updated,
        COUNT(*) as record_count,
        MAX(snapshot_month) as latest_snapshot_month
       FROM USAS_V1.UI_CD_ACTIVITY.UNIVERSAL_CONTRACTOR_METRICS_MONTHLY`,

      // Check universal peer comparisons table
      `SELECT
        MAX(created_at) as last_updated,
        COUNT(*) as record_count,
        MAX(snapshot_month) as latest_snapshot_month
       FROM USAS_V1.UI_CD_PERFORMANCE.UNIVERSAL_PEER_COMPARISONS_MONTHLY`
    ];

    try {
      const [metricsResult, peerResult] = await Promise.all([
        this.executeSnowflakeQuery(queries[0]),
        this.executeSnowflakeQuery(queries[1])
      ]);

      const metricsData = metricsResult[0];
      const peerData = peerResult[0];

      // Calculate data age from the most recent update
      const mostRecentUpdate = new Date(Math.max(
        new Date(metricsData.last_updated).getTime(),
        new Date(peerData.last_updated).getTime()
      ));

      const hoursOld = (Date.now() - mostRecentUpdate.getTime()) / (1000 * 60 * 60);

      return {
        universalContractorMetrics: {
          lastUpdated: metricsData.last_updated,
          recordCount: metricsData.record_count,
          latestSnapshotMonth: metricsData.latest_snapshot_month
        },
        universalPeerComparisons: {
          lastUpdated: peerData.last_updated,
          recordCount: peerData.record_count,
          latestSnapshotMonth: peerData.latest_snapshot_month
        },
        dataAge: {
          hoursOld,
          isStale: hoursOld > 48 // Consider stale if no updates in 2+ days
        }
      };
    } catch (error) {
      console.error('Failed to check Snowflake data freshness:', error);

      // Return fallback data indicating unknown freshness
      return {
        universalContractorMetrics: {
          lastUpdated: new Date().toISOString(),
          recordCount: 0,
          latestSnapshotMonth: new Date().toISOString().substring(0, 7) + '-01'
        },
        universalPeerComparisons: {
          lastUpdated: new Date().toISOString(),
          recordCount: 0,
          latestSnapshotMonth: new Date().toISOString().substring(0, 7) + '-01'
        },
        dataAge: {
          hoursOld: 0,
          isStale: false
        }
      };
    }
  }

  /**
   * Check if new Snowflake data is available since last profile update
   */
  async hasNewSnowflakeData(lastProfileUpdate: string): Promise<{
    hasNewData: boolean;
    newDataAvailableAt: string | null;
    affectedTables: string[];
    shouldRefresh: boolean;
  }> {
    const freshness = await this.getSnowflakeDataFreshness();
    const lastUpdate = new Date(lastProfileUpdate);

    const metricsUpdate = new Date(freshness.universalContractorMetrics.lastUpdated);
    const peerUpdate = new Date(freshness.universalPeerComparisons.lastUpdated);

    const affectedTables: string[] = [];
    let newDataAvailableAt: string | null = null;

    // Check if metrics table has new data
    if (metricsUpdate > lastUpdate) {
      affectedTables.push('UNIVERSAL_CONTRACTOR_METRICS_MONTHLY');
      if (!newDataAvailableAt || metricsUpdate.toISOString() > newDataAvailableAt) {
        newDataAvailableAt = metricsUpdate.toISOString();
      }
    }

    // Check if peer comparisons table has new data
    if (peerUpdate > lastUpdate) {
      affectedTables.push('UNIVERSAL_PEER_COMPARISONS_MONTHLY');
      if (!newDataAvailableAt || peerUpdate.toISOString() > newDataAvailableAt) {
        newDataAvailableAt = peerUpdate.toISOString();
      }
    }

    const hasNewData = affectedTables.length > 0;

    return {
      hasNewData,
      newDataAvailableAt,
      affectedTables,
      shouldRefresh: hasNewData && !freshness.dataAge.isStale
    };
  }

  /**
   * Get list of UEIs that have new data available in Snowflake
   */
  async getUEIsWithNewData(sinceTimestamp: string): Promise<{
    ueis: string[];
    updateTypes: Array<{
      uei: string;
      hasNewMetrics: boolean;
      hasNewPeerData: boolean;
      latestSnapshotMonth: string;
    }>;
  }> {
    const query = `
      WITH updated_metrics AS (
        SELECT DISTINCT
          recipient_uei,
          snapshot_month,
          'metrics' as update_type
        FROM USAS_V1.UI_CD_ACTIVITY.UNIVERSAL_CONTRACTOR_METRICS_MONTHLY
        WHERE created_at > '${sinceTimestamp}'
      ),
      updated_peers AS (
        SELECT DISTINCT
          recipient_uei,
          snapshot_month,
          'peers' as update_type
        FROM USAS_V1.UI_CD_PERFORMANCE.UNIVERSAL_PEER_COMPARISONS_MONTHLY
        WHERE created_at > '${sinceTimestamp}'
      ),
      all_updates AS (
        SELECT * FROM updated_metrics
        UNION ALL
        SELECT * FROM updated_peers
      )
      SELECT
        recipient_uei,
        MAX(snapshot_month) as latest_snapshot_month,
        BOOL_OR(CASE WHEN update_type = 'metrics' THEN TRUE ELSE FALSE END) as has_new_metrics,
        BOOL_OR(CASE WHEN update_type = 'peers' THEN TRUE ELSE FALSE END) as has_new_peer_data
      FROM all_updates
      GROUP BY recipient_uei
      ORDER BY latest_snapshot_month DESC, recipient_uei
    `;

    try {
      const result = await this.executeSnowflakeQuery(query);

      const updateTypes = result.map(row => ({
        uei: row.recipient_uei,
        hasNewMetrics: row.has_new_metrics,
        hasNewPeerData: row.has_new_peer_data,
        latestSnapshotMonth: row.latest_snapshot_month
      }));

      const ueis = [...new Set(updateTypes.map(item => item.uei))];

      return {
        ueis,
        updateTypes
      };
    } catch (error) {
      console.error('Failed to get UEIs with new data:', error);
      return {
        ueis: [],
        updateTypes: []
      };
    }
  }

  /**
   * Track the last time we checked Snowflake data freshness
   */
  async recordDataCheck(): Promise<void> {
    const query = `
      INSERT INTO snowflake_data_checks (
        check_id,
        checked_at,
        metrics_last_updated,
        peers_last_updated
      )
      SELECT
        $1 as check_id,
        CURRENT_TIMESTAMP as checked_at,
        (SELECT MAX(created_at) FROM USAS_V1.UI_CD_ACTIVITY.UNIVERSAL_CONTRACTOR_METRICS_MONTHLY) as metrics_last_updated,
        (SELECT MAX(created_at) FROM USAS_V1.UI_CD_PERFORMANCE.UNIVERSAL_PEER_COMPARISONS_MONTHLY) as peers_last_updated
      ON CONFLICT (check_date) DO UPDATE SET
        checked_at = EXCLUDED.checked_at,
        metrics_last_updated = EXCLUDED.metrics_last_updated,
        peers_last_updated = EXCLUDED.peers_last_updated
    `;

    const checkId = `check_${Date.now()}`;

    try {
      await this.database.query(query, [checkId]);
    } catch (error) {
      console.error('Failed to record data check:', error);
    }
  }

  /**
   * Get Snowflake refresh schedule and predict next update
   */
  async getSnowflakeRefreshSchedule(): Promise<{
    expectedRefreshDays: number[];
    nextExpectedRefresh: string | null;
    refreshPattern: 'daily' | 'weekly' | 'monthly' | 'irregular';
    confidence: number;
  }> {
    // Query historical update patterns
    const query = `
      SELECT
        DATE(created_at) as update_date,
        COUNT(*) as updates_count
      FROM USAS_V1.UI_CD_ACTIVITY.UNIVERSAL_CONTRACTOR_METRICS_MONTHLY
      WHERE created_at > CURRENT_DATE - INTERVAL '60 days'
      GROUP BY DATE(created_at)
      ORDER BY update_date DESC
      LIMIT 30
    `;

    try {
      const result = await this.executeSnowflakeQuery(query);

      if (result.length === 0) {
        return {
          expectedRefreshDays: [],
          nextExpectedRefresh: null,
          refreshPattern: 'irregular',
          confidence: 0
        };
      }

      // Analyze patterns
      const updateDates = result.map(row => new Date(row.update_date));
      const daysBetweenUpdates: number[] = [];

      for (let i = 1; i < updateDates.length; i++) {
        const daysDiff = Math.abs(
          (updateDates[i - 1].getTime() - updateDates[i].getTime()) / (1000 * 60 * 60 * 24)
        );
        daysBetweenUpdates.push(daysDiff);
      }

      // Determine pattern
      let refreshPattern: 'daily' | 'weekly' | 'monthly' | 'irregular' = 'irregular';
      let confidence = 0;

      const avgDaysBetween = daysBetweenUpdates.reduce((a, b) => a + b, 0) / daysBetweenUpdates.length;

      if (avgDaysBetween <= 1.5) {
        refreshPattern = 'daily';
        confidence = 0.9;
      } else if (avgDaysBetween >= 6 && avgDaysBetween <= 8) {
        refreshPattern = 'weekly';
        confidence = 0.8;
      } else if (avgDaysBetween >= 25 && avgDaysBetween <= 35) {
        refreshPattern = 'monthly';
        confidence = 0.7;
      }

      // Predict next refresh
      const lastUpdate = updateDates[0];
      const nextExpectedRefresh = new Date(lastUpdate.getTime() + (avgDaysBetween * 24 * 60 * 60 * 1000));

      // Get days of week when updates typically happen
      const expectedRefreshDays = [...new Set(updateDates.map(date => date.getDay()))];

      return {
        expectedRefreshDays,
        nextExpectedRefresh: nextExpectedRefresh.toISOString(),
        refreshPattern,
        confidence
      };
    } catch (error) {
      console.error('Failed to analyze refresh schedule:', error);
      return {
        expectedRefreshDays: [],
        nextExpectedRefresh: null,
        refreshPattern: 'irregular',
        confidence: 0
      };
    }
  }

  /**
   * Check if it's a good time to refresh based on Snowflake patterns
   */
  async shouldTriggerRefresh(): Promise<{
    shouldRefresh: boolean;
    reason: string;
    priority: 'low' | 'normal' | 'high';
    estimatedAffectedProfiles: number;
  }> {
    const freshness = await this.getSnowflakeDataFreshness();
    const schedule = await this.getSnowflakeRefreshSchedule();

    // Don't refresh if Snowflake data itself is stale
    if (freshness.dataAge.isStale) {
      return {
        shouldRefresh: false,
        reason: `Snowflake data is ${Math.round(freshness.dataAge.hoursOld)} hours old - no new data available`,
        priority: 'low',
        estimatedAffectedProfiles: 0
      };
    }

    // Check if we're within expected refresh window
    const now = new Date();
    const nextExpected = schedule.nextExpectedRefresh ? new Date(schedule.nextExpectedRefresh) : null;

    if (nextExpected && now < nextExpected) {
      const hoursUntilNext = (nextExpected.getTime() - now.getTime()) / (1000 * 60 * 60);
      return {
        shouldRefresh: false,
        reason: `Next Snowflake refresh expected in ${Math.round(hoursUntilNext)} hours`,
        priority: 'low',
        estimatedAffectedProfiles: 0
      };
    }

    // Check for new data since our last update
    const lastCheck = new Date(Date.now() - (24 * 60 * 60 * 1000)); // 24 hours ago
    const newData = await this.hasNewSnowflakeData(lastCheck.toISOString());

    if (newData.hasNewData) {
      return {
        shouldRefresh: true,
        reason: `New Snowflake data available in: ${newData.affectedTables.join(', ')}`,
        priority: 'high',
        estimatedAffectedProfiles: await this.estimateAffectedProfiles(newData.newDataAvailableAt!)
      };
    }

    return {
      shouldRefresh: false,
      reason: 'No new Snowflake data detected',
      priority: 'low',
      estimatedAffectedProfiles: 0
    };
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private async executeSnowflakeQuery(query: string): Promise<any[]> {
    // In a real implementation, this would connect to Snowflake
    // For now, return mock data structure
    console.log('Executing Snowflake query:', query);

    // Mock response - replace with actual Snowflake connector
    return [
      {
        last_updated: new Date().toISOString(),
        record_count: 50000,
        latest_snapshot_month: new Date().toISOString().substring(0, 7) + '-01'
      }
    ];
  }

  private async estimateAffectedProfiles(sinceTimestamp: string): Promise<number> {
    const newDataInfo = await this.getUEIsWithNewData(sinceTimestamp);
    return newDataInfo.ueis.length;
  }
}

export const snowflakeDataTracker = new SnowflakeDataTracker(new Database());