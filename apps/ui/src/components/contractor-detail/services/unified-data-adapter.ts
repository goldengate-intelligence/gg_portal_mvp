/**
 * Unified Data Adapter
 *
 * Colocated service for contractor-detail feature that bridges legacy UI components
 * with our new unified data architecture (Activity + Universal Metrics + Peer Comparisons)
 *
 * Follows colocation strategy: contractor-detail specific service in contractor-detail/services/
 */

import { snowflakeApi } from "../../../services/data-sources/snowflake-api";
import type { ActivityEvent } from "../tabs/network/types";

export interface MonthlyMetricsData {
  snapshot_month: string;
  awards_monthly_millions: number;
  revenue_monthly_millions: number;
}

export interface UnifiedContractorData {
  // Core contractor info
  contractor: {
    uei: string;
    name: string;
    location: {
      state?: string;
      city?: string;
    };
    primaryNaics: string;
    primaryNaicsDescription: string;
  };

  // Activity events (raw data for all tabs)
  activityEvents: ActivityEvent[];

  // Universal metrics (aggregated monthly data)
  metrics: UniversalMetrics;

  // Historical monthly data for charts
  monthlyHistory: MonthlyMetricsData[];

  // Peer comparison data
  peerData?: PeerComparisonData;

  // Loading states
  isLoading: boolean;
  error?: string;
}

export interface UniversalMetrics {
  // Current snapshot (most recent month)
  current: {
    awardsMonthly: number;
    revenueMonthly: number;
    subcontractingMonthly: number;
    pipelineMonthly: number;
  };

  // TTM totals
  ttm: {
    awards: number;
    revenue: number;
    subcontracting: number;
    awardsCount: number;
  };

  // Lifetime totals (aggregate obligation amounts)
  lifetime: {
    awards: number;
    revenue: number;
    calculatedPipeline: number;
    awardsCount: number;
  };

  // Active awards (currently performing, aggregate obligation amounts)
  active: {
    awards: number;
    awardsCount: number;
  };

  // Growth rates
  growth: {
    awardsYoY: number;
    revenueYoY: number;
  };

  // Portfolio metrics
  portfolio: {
    activeContracts: number;
    pipelineContracts: number;
    avgContractDuration: number;
    inflowRelationships: number;
    outflowRelationships: number;
  };

  // Entity classification
  entityClassification: 'PRIMARY_PRIME' | 'PRIMARY_SUB' | 'HYBRID' | 'PRIME_WITH_SUBS' | 'SUBSIDIARY';

  // Time in system
  monthsInSystem: number;
  isPerforming: boolean;
}

export interface PeerComparisonData {
  // Performance scores (0-100)
  scores: {
    composite: number;
    awards: number;
    revenue: number;
    pipeline: number;
    duration: number;
    networkActivity: number;
    growth: number;
  };

  // Rankings within peer group (1 = best)
  rankings: {
    composite: number;
    awards: number;
    revenue: number;
    pipeline: number;
    growth: number;
  };

  // Peer group context
  peerGroup: {
    naicsCode: string;
    entityClassification: string;
    groupSize: number;
    defenseOverlay: boolean;
  };

  // Market position
  marketShare: number;
  sizeQuartile: number;
  performanceTier: 'Top 10%' | 'Top 25%' | 'Top 50%' | 'Bottom 50%';
  performanceClassification: 'Elite' | 'Strong' | 'Stable' | 'Emerging' | 'Insufficient Data';
}

/**
 * Adapter class to fetch and transform unified contractor data
 * Colocated within contractor-detail feature for clear ownership
 */
class UnifiedDataAdapter {
  private cache = new Map<string, UnifiedContractorData>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Main method to get all contractor data for contractor-detail UI
   */
  async getContractorData(contractorUEI: string): Promise<UnifiedContractorData> {
    // Check cache first
    if (this.isCached(contractorUEI)) {
      return this.cache.get(contractorUEI)!;
    }

    try {
      // Fetch all data in parallel - optimized for contractor detail single-page loading
      const [activityEvents, metrics, monthlyHistory, peerData] = await Promise.all([
        this.fetchActivityEvents(contractorUEI),
        this.fetchUniversalMetrics(contractorUEI),
        this.fetchMonthlyHistory(contractorUEI),
        this.fetchPeerComparison(contractorUEI)
      ]);

      // Extract contractor info from activity events
      const contractor = this.extractContractorInfo(activityEvents);

      const unifiedData: UnifiedContractorData = {
        contractor,
        activityEvents,
        metrics,
        monthlyHistory,
        peerData,
        isLoading: false
      };

      // Cache the result for performance
      this.cache.set(contractorUEI, unifiedData);
      this.cacheExpiry.set(contractorUEI, Date.now() + this.CACHE_DURATION);

      return unifiedData;

    } catch (error) {
      console.error('Failed to fetch contractor data:', error);

      return {
        contractor: { uei: contractorUEI, name: '', location: {}, primaryNaics: '', primaryNaicsDescription: '' },
        activityEvents: [],
        metrics: this.getEmptyMetrics(),
        monthlyHistory: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Fetch activity events from unified activity table
   */
  private async fetchActivityEvents(contractorUEI: string): Promise<ActivityEvent[]> {
    const query = `
      SELECT
        EVENT_ID,
        CONTRACTOR_UEI,
        CONTRACTOR_NAME,
        RELATED_ENTITY_UEI,
        RELATED_ENTITY_NAME,
        RELATED_ENTITY_TYPE,
        FLOW_DIRECTION,
        EVENT_TYPE,
        EVENT_AMOUNT,
        AWARD_KEY,
        AWARD_TOTAL_VALUE,
        AWARD_START_DATE,
        AWARD_END_DATE,
        AWARD_POTENTIAL_END_DATE,
        CONTRACTOR_STATE,
        CONTRACTOR_CITY,
        PERFORMANCE_STATE,
        PERFORMANCE_CITY,
        EVENT_DATE,
        FISCAL_YEAR,
        NAICS_CODE,
        NAICS_DESCRIPTION,
        PSC_CODE,
        AWARD_TYPE
      FROM USAS_V1.UI_CD_ACTIVITY.FACT_CONTRACTOR_ACTIVITY_EVENTS
      WHERE CONTRACTOR_UEI = ?
      ORDER BY EVENT_DATE DESC
      LIMIT 10000
    `;

    const result = await snowflakeApi.executeQuery(query, [contractorUEI]);
    return result.data || [];
  }

  /**
   * Fetch universal metrics from monthly aggregation table
   */
  private async fetchUniversalMetrics(contractorUEI: string): Promise<UniversalMetrics> {
    const query = `
      SELECT
        awards_monthly_millions,
        revenue_monthly_millions,
        subcontracting_monthly_millions,
        pipeline_monthly_millions,
        awards_ttm_millions,
        revenue_ttm_millions,
        subcontracting_ttm_millions,
        calculated_pipeline_ttm_millions,
        lifetime_awards_millions,
        revenue_lifetime_millions,
        ttm_awards_count,
        lifetime_awards_count,
        active_awards_count,
        active_awards_millions,
        awards_ttm_yoy_growth_pct,
        revenue_ttm_yoy_growth_pct,
        active_contracts,
        pipeline_contracts,
        avg_contract_duration_months,
        inflow_relationship_count,
        outflow_relationship_count,
        entity_classification,
        months_in_system,
        is_performing
      FROM USAS_V1.UI_CD_ACTIVITY.UNIVERSAL_CONTRACTOR_METRICS_MONTHLY
      WHERE recipient_uei = ?
      ORDER BY snapshot_month DESC
      LIMIT 1
    `;

    const result = await snowflakeApi.executeQuery(query, [contractorUEI]);
    const data = result.data?.[0];

    if (!data) {
      return this.getEmptyMetrics();
    }

    return {
      current: {
        awardsMonthly: data.awards_monthly_millions || 0,
        revenueMonthly: data.revenue_monthly_millions || 0,
        subcontractingMonthly: data.subcontracting_monthly_millions || 0,
        pipelineMonthly: data.pipeline_monthly_millions || 0
      },
      ttm: {
        awards: data.awards_ttm_millions || 0,
        revenue: data.revenue_ttm_millions || 0,
        subcontracting: data.subcontracting_ttm_millions || 0,
        awardsCount: data.ttm_awards_count || 0
      },
      lifetime: {
        awards: data.lifetime_awards_millions || 0,
        revenue: data.revenue_lifetime_millions || 0,
        calculatedPipeline: data.calculated_pipeline_ttm_millions || 0,
        awardsCount: data.lifetime_awards_count || 0
      },
      active: {
        awards: data.active_awards_millions || 0,
        awardsCount: data.active_awards_count || 0
      },
      growth: {
        awardsYoY: data.awards_ttm_yoy_growth_pct || 0,
        revenueYoY: data.revenue_ttm_yoy_growth_pct || 0
      },
      portfolio: {
        activeContracts: data.active_contracts || 0,
        pipelineContracts: data.pipeline_contracts || 0,
        avgContractDuration: data.avg_contract_duration_months || 0,
        inflowRelationships: data.inflow_relationship_count || 0,
        outflowRelationships: data.outflow_relationship_count || 0
      },
      entityClassification: data.entity_classification || 'PRIMARY_PRIME',
      monthsInSystem: data.months_in_system || 0,
      isPerforming: data.is_performing || false
    };
  }

  /**
   * Fetch historical monthly metrics for charts (all available history from 2015)
   */
  private async fetchMonthlyHistory(contractorUEI: string): Promise<MonthlyMetricsData[]> {
    const query = `
      SELECT
        snapshot_month,
        awards_monthly_millions,
        revenue_monthly_millions
      FROM USAS_V1.UI_CD_ACTIVITY.UNIVERSAL_CONTRACTOR_METRICS_MONTHLY
      WHERE recipient_uei = ?
        AND snapshot_month >= '2015-10-31'
      ORDER BY snapshot_month ASC
    `;

    const result = await snowflakeApi.executeQuery(query, [contractorUEI]);
    return result.data || [];
  }

  /**
   * Fetch peer comparison data from performance schema
   */
  private async fetchPeerComparison(contractorUEI: string): Promise<PeerComparisonData | undefined> {
    const query = `
      SELECT
        awards_score,
        revenue_score,
        pipeline_score,
        duration_score,
        network_activity_score,
        growth_score,
        composite_score,
        awards_rank,
        revenue_rank,
        pipeline_rank,
        growth_rank,
        composite_rank,
        peer_naics_code,
        peer_entity_classification,
        peer_group_size,
        defense_overlay_flag,
        peer_market_share_percent,
        size_quartile,
        peer_performance_tier,
        performance_classification
      FROM USAS_V1.UI_CD_PERFORMANCE.UNIVERSAL_PEER_COMPARISONS_MONTHLY
      WHERE recipient_uei = ?
      ORDER BY snapshot_month DESC
      LIMIT 1
    `;

    const result = await snowflakeApi.executeQuery(query, [contractorUEI]);
    const data = result.data?.[0];

    if (!data) {
      return undefined;
    }

    return {
      scores: {
        composite: data.composite_score || 0,
        awards: data.awards_score || 0,
        revenue: data.revenue_score || 0,
        pipeline: data.pipeline_score || 0,
        duration: data.duration_score || 0,
        networkActivity: data.network_activity_score || 0,
        growth: data.growth_score || 0
      },
      rankings: {
        composite: data.composite_rank || 0,
        awards: data.awards_rank || 0,
        revenue: data.revenue_rank || 0,
        pipeline: data.pipeline_rank || 0,
        growth: data.growth_rank || 0
      },
      peerGroup: {
        naicsCode: data.peer_naics_code || '',
        entityClassification: data.peer_entity_classification || '',
        groupSize: data.peer_group_size || 0,
        defenseOverlay: data.defense_overlay_flag || false
      },
      marketShare: data.peer_market_share_percent || 0,
      sizeQuartile: data.size_quartile || 4,
      performanceTier: data.peer_performance_tier || 'Bottom 50%',
      performanceClassification: data.performance_classification || 'Insufficient Data'
    };
  }

  /**
   * Extract contractor basic info from first activity event
   */
  private extractContractorInfo(activityEvents: ActivityEvent[]) {
    if (activityEvents.length === 0) {
      return { uei: '', name: '', location: {}, primaryNaics: '', primaryNaicsDescription: '' };
    }

    const firstEvent = activityEvents[0];
    return {
      uei: firstEvent.CONTRACTOR_UEI,
      name: firstEvent.CONTRACTOR_NAME,
      location: {
        state: firstEvent.CONTRACTOR_STATE,
        city: firstEvent.CONTRACTOR_CITY
      },
      primaryNaics: firstEvent.NAICS_CODE || '',
      primaryNaicsDescription: firstEvent.NAICS_DESCRIPTION || ''
    };
  }

  /**
   * Default empty metrics structure
   */
  private getEmptyMetrics(): UniversalMetrics {
    return {
      current: { awardsMonthly: 0, revenueMonthly: 0, subcontractingMonthly: 0, pipelineMonthly: 0 },
      ttm: { awards: 0, revenue: 0, subcontracting: 0, awardsCount: 0 },
      lifetime: { awards: 0, revenue: 0, calculatedPipeline: 0, awardsCount: 0 },
      active: { awards: 0, awardsCount: 0 },
      growth: { awardsYoY: 0, revenueYoY: 0 },
      portfolio: {
        activeContracts: 0,
        pipelineContracts: 0,
        avgContractDuration: 0,
        inflowRelationships: 0,
        outflowRelationships: 0
      },
      entityClassification: 'PRIMARY_PRIME',
      monthsInSystem: 0,
      isPerforming: false
    };
  }

  /**
   * Cache management
   */
  private isCached(contractorUEI: string): boolean {
    if (!this.cache.has(contractorUEI)) return false;

    const expiry = this.cacheExpiry.get(contractorUEI);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(contractorUEI);
      this.cacheExpiry.delete(contractorUEI);
      return false;
    }

    return true;
  }

  /**
   * Clear cache for refresh
   */
  clearCache(contractorUEI?: string) {
    if (contractorUEI) {
      this.cache.delete(contractorUEI);
      this.cacheExpiry.delete(contractorUEI);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }
}

// Export singleton instance - colocated within contractor-detail feature
export const unifiedDataAdapter = new UnifiedDataAdapter();