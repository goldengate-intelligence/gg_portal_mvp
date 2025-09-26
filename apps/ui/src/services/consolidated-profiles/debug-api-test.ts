/**
 * Debug script to test the mock API functionality
 * Run this to verify the mock API is working as expected
 */

import { mockSnowflakeApi } from '../data-sources/snowflake-api-mock';

export async function testMockApi() {
  console.log('=== Testing Mock Snowflake API ===');

  try {
    // Test peer group context query
    console.log('\n1. Testing peer group context query...');
    const contextResult = await mockSnowflakeApi.executeQuery({
      sql: `
        SELECT
          peer_naics_code,
          peer_entity_classification,
          defense_overlay_flag,
          snapshot_month
        FROM USAS_V1.UI_CD_PERFORMANCE.UNIVERSAL_PEER_COMPARISONS_MONTHLY
        WHERE recipient_uei = $uei
        ORDER BY snapshot_month DESC
        LIMIT 1
      `,
      parameters: { uei: 'TEST123UEI' }
    });

    console.log('Context Result:', contextResult);
    console.log(`✅ Context query returned ${contextResult.rowCount} rows`);

    // Test peer group data query
    console.log('\n2. Testing peer group data query...');
    const peerResult = await mockSnowflakeApi.executeQuery({
      sql: `
        SELECT
          recipient_name,
          recipient_uei,
          composite_score,
          awards_score,
          revenue_score
        FROM USAS_V1.UI_CD_PERFORMANCE.UNIVERSAL_PEER_COMPARISONS_MONTHLY
        WHERE peer_naics_code = $naicsCode
          AND peer_entity_classification = $entityClassification
          AND defense_overlay_flag = $defenseOverlay
          AND snapshot_month = $snapshotMonth
        ORDER BY composite_score DESC
      `,
      parameters: {
        naicsCode: '541330',
        entityClassification: 'Pure Prime',
        defenseOverlay: true,
        snapshotMonth: '2024-08-01'
      }
    });

    console.log('Peer Group Result:', peerResult);
    console.log(`✅ Peer group query returned ${peerResult.rowCount} rows`);

    // Test first few contractors
    if (peerResult.data && peerResult.data.length > 0) {
      console.log('\nFirst 3 contractors:');
      peerResult.data.slice(0, 3).forEach((contractor: any, index: number) => {
        console.log(`  ${index + 1}. ${contractor.recipient_name} (${contractor.recipient_uei})`);
        console.log(`     Composite Score: ${contractor.composite_score}`);
        console.log(`     Awards Score: ${contractor.awards_score}`);
        console.log(`     Revenue Score: ${contractor.revenue_score}`);
      });
    }

    console.log('\n=== Mock API Test Complete ✅ ===');
    return true;

  } catch (error) {
    console.error('❌ Mock API Test Failed:', error);
    return false;
  }
}

// Auto-run when imported in development
if (import.meta.env.MODE === 'development') {
  testMockApi().then(success => {
    if (success) {
      console.log('Mock API is ready for use in development! 🎉');
    }
  });
}

export default testMockApi;