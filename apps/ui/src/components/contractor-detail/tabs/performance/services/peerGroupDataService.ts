/**
 * Peer Group Data Service
 *
 * Fetches all peer contractors and their performance metrics for competitive analysis
 * Integrates with UNIVERSAL_PEER_COMPARISONS_MONTHLY table
 */

import { snowflakeApi } from "../../../../../services/data-sources/snowflake-api";
import { mockPeerApi } from "./mockPeerData";

// Use mock API in development, real API in production
const isDevelopment = import.meta.env.MODE === 'development' || !import.meta.env.VITE_SNOWFLAKE_API_URL;
const apiService = isDevelopment ? mockPeerApi : snowflakeApi;

export interface PeerContractor {
  name: string;
  uei: string;

  // Performance scores (0-100 percentiles)
  compositeScore: number;
  awardsScore: number;
  revenueScore: number;
  pipelineScore: number;
  durationScore: number;
  growthScore: number;

  // Actual values for Y-axis
  awardsTtmMillions: number;
  revenueTtmMillions: number;
  calculatedPipelineMillions: number;
  avgContractDurationMonths: number;
  blendedGrowthScore: number;

  // Rankings
  compositeRank: number;

  // Subject contractor flag
  isSubject: boolean;
}

export interface PeerGroupData {
  subject: PeerContractor;
  peers: PeerContractor[];
  groupSize: number;
  peerGroupContext: {
    naicsCode: string;
    entityClassification: string;
    defenseOverlay: boolean;
    snapshotMonth: string;
  };
}

class PeerGroupDataService {

  /**
   * Fetch complete peer group data for competitive analysis
   */
  async fetchPeerGroupData(subjectUEI: string): Promise<PeerGroupData> {
    try {
      // First, get the subject contractor's peer group context
      const peerContext = await this.fetchSubjectPeerContext(subjectUEI);

      if (!peerContext) {
        throw new Error(`No peer group data found for contractor ${subjectUEI}`);
      }

      // Then fetch all contractors in that peer group
      const allPeers = await this.fetchAllPeersInGroup(peerContext);

      // Find subject contractor in the results
      const subject = allPeers.find(peer => peer.uei === subjectUEI);
      if (!subject) {
        throw new Error(`Subject contractor ${subjectUEI} not found in peer group results`);
      }

      // Mark subject contractor
      subject.isSubject = true;

      return {
        subject,
        peers: allPeers,
        groupSize: allPeers.length,
        peerGroupContext: peerContext
      };

    } catch (error) {
      console.error('Failed to fetch peer group data:', error);
      throw error;
    }
  }

  /**
   * Get subject contractor's peer group context
   */
  private async fetchSubjectPeerContext(subjectUEI: string) {
    const query = `
      SELECT
        peer_naics_code,
        peer_entity_classification,
        defense_overlay_flag,
        snapshot_month
      FROM USAS_V1.UI_CD_PERFORMANCE.UNIVERSAL_PEER_COMPARISONS_MONTHLY
      WHERE recipient_uei = $uei
      ORDER BY snapshot_month DESC
      LIMIT 1
    `;

    const result = await apiService.executeQuery({
      sql: query,
      parameters: { uei: subjectUEI }
    });
    const data = result.data?.[0];

    if (!data) return null;

    return {
      naicsCode: data.peer_naics_code,
      entityClassification: data.peer_entity_classification,
      defenseOverlay: data.defense_overlay_flag,
      snapshotMonth: data.snapshot_month
    };
  }

  /**
   * Fetch all peer contractors in the same group
   */
  private async fetchAllPeersInGroup(peerContext: any): Promise<PeerContractor[]> {
    const query = `
      SELECT
        recipient_name,
        recipient_uei,
        -- Performance scores (0-100 percentiles)
        composite_score,
        awards_score,
        revenue_score,
        pipeline_score,
        duration_score,
        growth_score,
        -- Actual values
        awards_ttm_millions,
        revenue_ttm_millions,
        calculated_pipeline_millions,
        avg_contract_duration_months,
        blended_growth_score,
        -- Rankings
        composite_rank
      FROM USAS_V1.UI_CD_PERFORMANCE.UNIVERSAL_PEER_COMPARISONS_MONTHLY
      WHERE peer_naics_code = $naicsCode
        AND peer_entity_classification = $entityClassification
        AND defense_overlay_flag = $defenseOverlay
        AND snapshot_month = $snapshotMonth
      ORDER BY composite_score DESC
    `;

    const result = await apiService.executeQuery({
      sql: query,
      parameters: {
        naicsCode: peerContext.naicsCode,
        entityClassification: peerContext.entityClassification,
        defenseOverlay: peerContext.defenseOverlay,
        snapshotMonth: peerContext.snapshotMonth
      }
    });

    return (result.data || []).map((row: any) => ({
      name: row.recipient_name || 'Unknown Contractor',
      uei: row.recipient_uei || '',

      // Performance scores
      compositeScore: row.composite_score || 0,
      awardsScore: row.awards_score || 0,
      revenueScore: row.revenue_score || 0,
      pipelineScore: row.pipeline_score || 0,
      durationScore: row.duration_score || 0,
      growthScore: row.growth_score || 0,

      // Actual values
      awardsTtmMillions: row.awards_ttm_millions || 0,
      revenueTtmMillions: row.revenue_ttm_millions || 0,
      calculatedPipelineMillions: row.calculated_pipeline_millions || 0,
      avgContractDurationMonths: row.avg_contract_duration_months || 0,
      blendedGrowthScore: row.blended_growth_score || 0,

      // Rankings
      compositeRank: row.composite_rank || 0,

      // Will be set to true for subject contractor
      isSubject: false
    }));
  }

  /**
   * Get X-axis value based on selected metric
   */
  getXAxisValue(contractor: PeerContractor, metric: string): number {
    switch (metric) {
      case 'composite_score':
        return contractor.compositeScore;
      case 'awards_captured':
        return contractor.awardsScore;
      case 'revenue':
        return contractor.revenueScore;
      case 'pipeline_value':
        return contractor.pipelineScore;
      case 'portfolio_duration':
        return contractor.durationScore;
      case 'blended_growth':
        return contractor.growthScore;
      default:
        return contractor.compositeScore;
    }
  }

  /**
   * Get Y-axis value based on selected metric
   */
  getYAxisValue(contractor: PeerContractor, metric: string): number {
    switch (metric) {
      case 'ttm_awards':
        return contractor.awardsTtmMillions;
      case 'ttm_revenue':
        return contractor.revenueTtmMillions;
      case 'calculated_pipeline':
        return contractor.calculatedPipelineMillions;
      case 'portfolio_duration':
        return contractor.avgContractDurationMonths / 12; // Convert to years
      case 'blended_growth':
        return contractor.blendedGrowthScore;
      case 'lifetime_awards':
      case 'lifetime_revenue':
        // These would need additional fields from the SQL query
        return contractor.awardsTtmMillions * 2; // Placeholder estimate
      default:
        return contractor.revenueTtmMillions;
    }
  }

  /**
   * Format Y-axis value for display
   */
  formatYAxisValue(value: number, metric: string): string {
    switch (metric) {
      case 'portfolio_duration':
        return `${value.toFixed(1)} yrs`;
      case 'blended_growth':
        return `${value.toFixed(1)}%`;
      case 'ttm_awards':
      case 'ttm_revenue':
      case 'calculated_pipeline':
      case 'lifetime_awards':
      case 'lifetime_revenue':
        return `$${Math.round(value)}M`;
      default:
        return value.toString();
    }
  }
}

// Export singleton instance
export const peerGroupDataService = new PeerGroupDataService();