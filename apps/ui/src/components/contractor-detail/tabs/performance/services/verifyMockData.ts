/**
 * Verification script for mock peer data
 * Ensures all percentile scores are whole numbers
 */

import { mockPeerApi } from './mockPeerData';

export async function verifyMockDataScores() {
  console.log('=== Verifying Mock Peer Data Scores ===');

  try {
    // Get the peer group data
    const result = await mockPeerApi.executeQuery({
      sql: `
        SELECT * FROM UNIVERSAL_PEER_COMPARISONS_MONTHLY
        WHERE peer_naics_code = $naicsCode
        ORDER BY composite_score DESC
      `,
      parameters: {
        naicsCode: '541330',
        entityClassification: 'Pure Prime',
        defenseOverlay: true,
        snapshotMonth: '2024-08-01'
      }
    });

    console.log(`Found ${result.data.length} contractors in mock data`);

    let allScoresValid = true;
    const scoreFields = [
      'composite_score',
      'awards_score',
      'revenue_score',
      'pipeline_score',
      'duration_score',
      'growth_score'
    ];

    result.data.forEach((contractor: any, index: number) => {
      console.log(`\n${index + 1}. ${contractor.recipient_name}`);

      scoreFields.forEach(field => {
        const score = contractor[field];
        const isWholeNumber = Number.isInteger(score);

        console.log(`   ${field}: ${score} ${isWholeNumber ? '✅' : '❌'}`);

        if (!isWholeNumber) {
          allScoresValid = false;
          console.log(`   ❌ ERROR: ${field} should be a whole number, got ${score}`);
        }
      });
    });

    if (allScoresValid) {
      console.log('\n✅ All percentile scores are whole numbers!');
    } else {
      console.log('\n❌ Some percentile scores are not whole numbers!');
    }

    return allScoresValid;

  } catch (error) {
    console.error('❌ Error verifying mock data:', error);
    return false;
  }
}

// Auto-run verification in development
if (import.meta.env.MODE === 'development') {
  verifyMockDataScores().then(isValid => {
    if (isValid) {
      console.log('🎉 Mock data validation passed!');
    }
  });
}

export default verifyMockDataScores;