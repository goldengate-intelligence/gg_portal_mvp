/**
 * Mock Unified Data for Development
 * Simple mock data for unified data adapter
 */

// Mock API for unified data adapter
export const mockUnifiedApi = {
  async executeQuery(request: { sql: string; parameters?: Record<string, any> }) {
    console.log('Mock Unified API Query:', request.sql);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const sql = request.sql.toLowerCase();

    // Mock activity events data
    if (sql.includes('fact_contractor_activity_events')) {
      return {
        data: [
          {
            CONTRACTOR_UEI: 'ABC123XYZ789',
            CONTRACTOR_NAME: 'Example Defense Corp',
            RELATED_ENTITY_UEI: 'DOD001',
            RELATED_ENTITY_NAME: 'Department of Defense',
            FLOW_DIRECTION: 'INFLOW',
            RELATED_ENTITY_TYPE: 'GOVERNMENT',
            EVENT_TYPE: 'AWARD',
            EVENT_AMOUNT: 25000000,
            AWARD_KEY: 'AWD001',
            AWARD_TOTAL_VALUE: 100000000,
            AWARD_START_DATE: '2024-01-01',
            AWARD_END_DATE: '2025-12-31',
            CONTRACTOR_STATE: 'VA',
            CONTRACTOR_CITY: 'Arlington',
            CONTRACTOR_ZIP: '22202',
            PERFORMANCE_STATE: 'VA',
            PERFORMANCE_CITY: 'Arlington',
            PERFORMANCE_ZIP: '22202',
            EVENT_DATE: '2024-08-15',
            FISCAL_YEAR: 2024,
            NAICS_CODE: '541330',
            NAICS_DESCRIPTION: 'Engineering Services'
          }
        ],
        rowCount: 1,
        executionTime: 200,
        queryId: `activity_${Date.now()}`
      };
    }

    // Mock universal contractor metrics
    if (sql.includes('universal_contractor_metrics_monthly')) {
      return {
        data: [{
          recipient_uei: 'ABC123XYZ789',
          recipient_name: 'Example Defense Corp',
          snapshot_month: '2024-08-01',
          // Monthly metrics
          awards_monthly_millions: 15.2,
          revenue_monthly_millions: 18.8,
          subcontracting_monthly_millions: 5.4,
          pipeline_monthly_millions: 12.3,
          // TTM metrics
          awards_ttm_millions: 180.5,
          revenue_ttm_millions: 250.8,
          subcontracting_ttm_millions: 65.3,
          calculated_pipeline_millions: 95.2,
          // Lifetime metrics
          lifetime_awards_millions: 850.7,
          revenue_lifetime_millions: 920.4,
          ttm_awards_count: 12,
          lifetime_awards_count: 47,
          // Active awards
          active_awards_count: 6,
          active_awards_millions: 425.3,
          // Growth metrics
          awards_ttm_yoy_growth_pct: 15.2,
          revenue_ttm_yoy_growth_pct: 18.7,
          // Portfolio metrics
          active_contracts: 8,
          pipeline_contracts: 3,
          avg_contract_duration_months: 24,
          inflow_relationship_count: 5,
          outflow_relationship_count: 12,
          // Classification
          entity_classification: 'Pure Prime',
          is_defense: true,
          months_in_system: 156,
          is_performing: true,
          // Additional fields for context
          agency_focus: 'Defense',
          primary_naics_code: '541330',
          primary_naics_description: 'Engineering Services'
        }],
        rowCount: 1,
        executionTime: 150,
        queryId: `metrics_${Date.now()}`
      };
    }

    // Mock peer comparisons data
    if (sql.includes('universal_peer_comparisons_monthly')) {
      return {
        data: [{
          recipient_uei: 'ABC123XYZ789',
          recipient_name: 'Example Defense Corp',
          composite_score: 87,
          awards_score: 92,
          revenue_score: 88,
          peer_naics_code: '541330',
          peer_entity_classification: 'Pure Prime',
          defense_overlay_flag: true
        }],
        rowCount: 1,
        executionTime: 180,
        queryId: `peer_${Date.now()}`
      };
    }

    // Default response
    return {
      data: [],
      rowCount: 0,
      executionTime: 100,
      queryId: `default_${Date.now()}`
    };
  }
};