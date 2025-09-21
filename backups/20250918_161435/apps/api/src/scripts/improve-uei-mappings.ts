#!/usr/bin/env bun

import { fuzzyMatcher } from '../services/contractors/fuzzy-matcher';

async function main() {
  console.log('🔧 UEI Mapping Improvement Script');
  console.log('==================================');

  try {
    // Get initial stats
    console.log('\n📊 Current Mapping Statistics:');
    const initialStats = await fuzzyMatcher.getMappingStats();
    console.log(`Total UEIs: ${initialStats.totalUeis.toLocaleString()}`);
    console.log(`Mapped UEIs: ${initialStats.mappedUeis.toLocaleString()}`);
    console.log(`Unmapped UEIs: ${initialStats.unmappedUeis.toLocaleString()}`);
    console.log(`Coverage: ${initialStats.mappingPercentage}%`);

    // Show sample matches first
    console.log('\n🔍 Sample Potential Matches:');
    const sampleMatches = await fuzzyMatcher.getSampleMatches(10);
    
    for (const match of sampleMatches.slice(0, 5)) {
      console.log(`  ${match.uei}: "${match.contractorName}" → "${match.profileName}" (${match.confidence}%)`);
    }

    if (sampleMatches.length > 5) {
      console.log(`  ... and ${sampleMatches.length - 5} more potential matches`);
    }

    // Ask for confirmation in production, auto-proceed in development
    const shouldProceed = process.env.NODE_ENV === 'production' ? false : true;
    
    if (!shouldProceed) {
      console.log('\n⚠️  Set NODE_ENV=development to auto-proceed with fuzzy matching');
      process.exit(0);
    }

    // Run fuzzy matching process
    console.log('\n🚀 Running Fuzzy Matching Process...');
    const results = await fuzzyMatcher.runFuzzyMatchingProcess(
      0.7,  // minSimilarity: 70%
      75,   // minConfidence: 75%
      10000 // limit: process up to 10k unmapped UEIs
    );

    console.log('\n✅ Fuzzy Matching Complete!');
    console.log(`Found Matches: ${results.foundMatches}`);
    console.log(`Applied Matches: ${results.appliedMatches}`);
    console.log(`Average Confidence: ${results.averageConfidence}%`);

    // Get final stats
    console.log('\n📊 Final Mapping Statistics:');
    const finalStats = await fuzzyMatcher.getMappingStats();
    console.log(`Total UEIs: ${finalStats.totalUeis.toLocaleString()}`);
    console.log(`Mapped UEIs: ${finalStats.mappedUeis.toLocaleString()}`);
    console.log(`Unmapped UEIs: ${finalStats.unmappedUeis.toLocaleString()}`);
    console.log(`Coverage: ${finalStats.mappingPercentage}%`);
    
    const improvement = finalStats.mappingPercentage - initialStats.mappingPercentage;
    console.log(`📈 Coverage Improvement: +${improvement.toFixed(1)}%`);

    if (results.appliedMatches > 0) {
      console.log('\n🎉 Analytics endpoints should now have more data available!');
      console.log('Try testing the API endpoints again to see improved coverage.');
    }

  } catch (error) {
    console.error('❌ Error running UEI mapping improvement:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}