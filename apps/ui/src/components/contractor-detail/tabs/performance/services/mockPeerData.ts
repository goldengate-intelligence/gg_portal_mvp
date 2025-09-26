/**
 * Mock Peer Data for Development
 * Simple mock data source that doesn't require complex imports
 */

// Mock API that matches the interface expected by peerGroupDataService
export const mockPeerApi = {
  async executeQuery(request: { sql: string; parameters?: Record<string, any> }) {
    console.log('Mock API Query:', request.sql);
    console.log('Parameters:', request.parameters);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const sql = request.sql.toLowerCase();

    if (sql.includes('universal_peer_comparisons_monthly')) {
      if (sql.includes('recipient_uei = $uei') && sql.includes('limit 1')) {
        // Subject contractor peer group context query
        return {
          data: [{
            peer_naics_code: '541330',
            peer_entity_classification: 'Pure Prime',
            defense_overlay_flag: true,
            snapshot_month: '2024-08-01'
          }],
          rowCount: 1,
          executionTime: 150,
          queryId: `context_${Date.now()}`
        };
      }

      if (sql.includes('peer_naics_code = $naicscode')) {
        // All peers in group query - return mock peer group
        return {
          data: [
            {
              recipient_name: 'Example Defense Corp',
              recipient_uei: 'ABC123XYZ789',
              composite_score: 87,
              awards_score: 92,
              revenue_score: 88,
              pipeline_score: 85,
              duration_score: 78,
              growth_score: 82,
              awards_ttm_millions: 180.5,
              revenue_ttm_millions: 250.8,
              calculated_pipeline_millions: 95.2,
              avg_contract_duration_months: 18,
              blended_growth_score: 15.8,
              composite_rank: 1
            },
            {
              recipient_name: 'Aerospace Solutions Inc',
              recipient_uei: 'DEF456ABC123',
              composite_score: 83,
              awards_score: 86,
              revenue_score: 85,
              pipeline_score: 88,
              duration_score: 75,
              growth_score: 79,
              awards_ttm_millions: 145.2,
              revenue_ttm_millions: 198.5,
              calculated_pipeline_millions: 112.8,
              avg_contract_duration_months: 16,
              blended_growth_score: 12.3,
              composite_rank: 2
            },
            {
              recipient_name: 'Defense Technology Partners',
              recipient_uei: 'GHI789DEF456',
              composite_score: 78,
              awards_score: 81,
              revenue_score: 80,
              pipeline_score: 76,
              duration_score: 82,
              growth_score: 71,
              awards_ttm_millions: 98.7,
              revenue_ttm_millions: 156.3,
              calculated_pipeline_millions: 68.9,
              avg_contract_duration_months: 22,
              blended_growth_score: 8.9,
              composite_rank: 3
            },
            // Generate additional mock peers for a fuller dataset
            ...Array.from({ length: 22 }, (_, i) => {
              const index = i + 4; // Start from rank 4
              return {
                recipient_name: `Contractor ${index}`,
                recipient_uei: `UEI${index.toString().padStart(3, '0')}XYZ`,
                composite_score: Math.round(Math.max(30, 75 - (index * 2) + Math.random() * 8)),
                awards_score: Math.round(Math.max(25, 80 - (index * 2.2) + Math.random() * 12)),
                revenue_score: Math.round(Math.max(30, 77 - (index * 1.9) + Math.random() * 10)),
                pipeline_score: Math.round(Math.max(20, 73 - (index * 2.1) + Math.random() * 15)),
                duration_score: Math.round(Math.max(15, 70 - (index * 1.7) + Math.random() * 18)),
                growth_score: Math.round(Math.max(10, 65 - (index * 2.3) + Math.random() * 20)),
                awards_ttm_millions: Math.max(5, 160 - (index * 4.5) + Math.random() * 25),
                revenue_ttm_millions: Math.max(10, 220 - (index * 6.8) + Math.random() * 35),
                calculated_pipeline_millions: Math.max(2, 90 - (index * 2.8) + Math.random() * 18),
                avg_contract_duration_months: Math.max(6, 20 - (index * 0.4) + Math.random() * 6),
                blended_growth_score: Math.max(-5, 18 - (index * 0.9) + Math.random() * 8),
                composite_rank: index
              };
            })
          ],
          rowCount: 25,
          executionTime: 300,
          queryId: `peers_${Date.now()}`
        };
      }
    }

    // Default empty response
    return {
      data: [],
      rowCount: 0,
      executionTime: 100,
      queryId: `empty_${Date.now()}`
    };
  }
};