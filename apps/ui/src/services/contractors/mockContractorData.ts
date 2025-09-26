/**
 * Mock Contractor Data for Development
 * Simple mock data for contractor metrics service
 */

// Mock API for contractor metrics service
export const mockContractorApi = {
  async getContractorIntelligence(uei: string, analysisType: string) {
    console.log(`Mock Contractor Intelligence: ${uei} - ${analysisType}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 250));

    // Return mock contractor intelligence data
    return {
      data: [{
        uei: uei,
        company_name: 'Example Defense Corp',
        total_awards: 180.5,
        active_awards_value: 95.2,
        revenue: 250.8,
        pipeline: 95.2,
        primary_agency: 'Department of Defense',
        naics_code: '541330',
        naics_description: 'Engineering Services',
        performance_score: 87
      }],
      rowCount: 1,
      executionTime: 250,
      queryId: `contractor_${Date.now()}`
    };
  },

  async executeQuery(request: { sql: string; parameters?: Record<string, any> }) {
    console.log('Mock Contractor API Query:', request.sql);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Return mock data based on query
    return {
      data: [{
        uei: request.parameters?.uei || 'ABC123XYZ789',
        company_name: 'Example Defense Corp',
        total_contract_value: 180500000,
        active_contract_value: 95200000,
        contract_count: 15,
        primary_agency: 'Department of Defense'
      }],
      rowCount: 1,
      executionTime: 200,
      queryId: `query_${Date.now()}`
    };
  },

  async discoverySearch(request: any) {
    console.log('Mock Discovery Search:', request);

    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      data: [{
        uei: 'ABC123XYZ789',
        company_name: 'Example Defense Corp',
        naics_code: '541330',
        naics_description: 'Engineering Services',
        total_awards: 180.5,
        performance_score: 87
      }],
      rowCount: 1,
      executionTime: 300,
      queryId: `discovery_${Date.now()}`
    };
  },

  async getNetworkAnalysis(centerUei: string, depth: number = 2) {
    console.log(`Mock Network Analysis: ${centerUei} - depth ${depth}`);

    await new Promise(resolve => setTimeout(resolve, 400));

    return {
      data: [{
        contractor_uei: centerUei,
        related_contractor_uei: 'REL001ABC',
        relationship_type: 'prime-sub',
        relationship_strength: 0.85,
        depth: 1
      }],
      rowCount: 1,
      executionTime: 400,
      queryId: `network_${Date.now()}`
    };
  },

  async getMarketOpportunities(filters: any) {
    console.log('Mock Market Opportunities:', filters);

    await new Promise(resolve => setTimeout(resolve, 350));

    return {
      data: [{
        opportunity_id: 'OPP001',
        agency_name: 'Department of Defense',
        estimated_value: 50000000,
        competition_level: 'moderate'
      }],
      rowCount: 1,
      executionTime: 350,
      queryId: `opportunities_${Date.now()}`
    };
  },

  async getMarketInsights(timeframe: string) {
    console.log(`Mock Market Insights: ${timeframe}`);

    await new Promise(resolve => setTimeout(resolve, 250));

    return {
      data: [{
        award_date: '2024-09-25',
        agency_name: 'Department of Defense',
        total_awards: 125000000,
        award_count: 15
      }],
      rowCount: 1,
      executionTime: 250,
      queryId: `insights_${Date.now()}`
    };
  }
};