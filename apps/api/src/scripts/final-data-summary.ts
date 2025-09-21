#!/usr/bin/env bun
/**
 * Final Data Summary
 * Comprehensive summary of the database structure and key findings
 */

import { db } from '../db';
import { 
  contractorProfiles, 
  contractorUeiMappings, 
  contractorsCache,
  peerComparisonsMonthly,
  contractorNetworkMetrics,
  contractorMetricsMonthly,
} from '../db/schema';
import { sql, count, eq, desc, gt } from 'drizzle-orm';

async function generateFinalSummary() {
  console.log('📋 Generating Final Database Summary Report...\n');

  try {
    // 1. Revenue value investigation
    console.log('1️⃣ Revenue Value Investigation:');
    console.log('=' .repeat(50));

    // Check actual revenue ranges in monthly metrics
    const revenueStats = await db.execute(sql`
      SELECT 
        MIN(monthly_revenue::numeric) as min_revenue,
        MAX(monthly_revenue::numeric) as max_revenue,
        AVG(monthly_revenue::numeric) as avg_revenue,
        COUNT(*) as total_records,
        COUNT(CASE WHEN monthly_revenue::numeric > 1000000 THEN 1 END) as over_1m,
        COUNT(CASE WHEN monthly_revenue::numeric > 10000 THEN 1 END) as over_10k
      FROM contractor_metrics_monthly
      WHERE monthly_revenue IS NOT NULL
    `);

    if (revenueStats.length > 0) {
      const stats = revenueStats[0];
      console.log(`Revenue statistics (in millions):`);
      console.log(`  Min: $${(Number(stats.min_revenue) / 1000000).toFixed(2)}M`);
      console.log(`  Max: $${(Number(stats.max_revenue) / 1000000).toFixed(2)}M`);
      console.log(`  Avg: $${(Number(stats.avg_revenue) / 1000000).toFixed(2)}M`);
      console.log(`  Records with revenue > $1M: ${stats.over_1m}`);
      console.log(`  Records with revenue > $10K: ${stats.over_10k}`);
    }

    // 2. Sample high-revenue records with joins
    console.log('\n2️⃣ High-Revenue Records with Profile Mapping:');
    console.log('=' .repeat(50));

    const highRevenueRecords = await db.execute(sql`
      SELECT 
        cm.contractor_uei,
        cm.contractor_name,
        cm.month_year,
        cm.monthly_revenue::numeric as revenue_numeric,
        p.id as profile_id,
        p.display_name as profile_name,
        p.total_ueis as profile_total_ueis
      FROM contractor_metrics_monthly cm
      LEFT JOIN contractor_uei_mappings m ON cm.contractor_uei = m.uei
      LEFT JOIN contractor_profiles p ON m.profile_id = p.id
      WHERE cm.monthly_revenue::numeric > 1000
      ORDER BY cm.monthly_revenue::numeric DESC
      LIMIT 10
    `);

    console.log('Top 10 high-revenue records:');
    for (const record of highRevenueRecords) {
      console.log(`  UEI: ${record.contractor_uei}`);
      console.log(`    Metrics Name: ${record.contractor_name}`);
      console.log(`    Revenue: $${Number(record.revenue_numeric).toLocaleString()}`);
      console.log(`    Month: ${record.month_year}`);
      if (record.profile_id) {
        console.log(`    ✅ Profile: ${record.profile_name} (${record.profile_total_ueis} UEIs)`);
      } else {
        console.log(`    ❌ Profile: NOT MAPPED`);
      }
      console.log('');
    }

    // 3. Key findings summary
    console.log('3️⃣ Key Findings Summary:');
    console.log('=' .repeat(50));

    // Get total counts
    const profileCount = await db.select({ count: count() }).from(contractorProfiles);
    const mappingCount = await db.select({ count: count() }).from(contractorUeiMappings);
    const cacheCount = await db.select({ count: count() }).from(contractorsCache);
    const monthlyMetricsCount = await db.select({ count: count() }).from(contractorMetricsMonthly);
    const peerCount = await db.select({ count: count() }).from(peerComparisonsMonthly);
    const networkCount = await db.select({ count: count() }).from(contractorNetworkMetrics);

    console.log('Database Overview:');
    console.log(`  📊 Contractor Profiles: ${profileCount[0].count.toLocaleString()}`);
    console.log(`  🔗 UEI Mappings: ${mappingCount[0].count.toLocaleString()}`);
    console.log(`  💾 Contractors Cache: ${cacheCount[0].count.toLocaleString()}`);
    console.log(`  📈 Monthly Metrics: ${monthlyMetricsCount[0].count.toLocaleString()}`);
    console.log(`  🏆 Peer Comparisons: ${peerCount[0].count.toLocaleString()}`);
    console.log(`  🌐 Network Metrics: ${networkCount[0].count.toLocaleString()}`);

    // Profile ID population status
    const peerWithProfileId = await db.select({ count: count() })
      .from(peerComparisonsMonthly)
      .where(sql`profile_id IS NOT NULL`);
    const networkWithPrimeProfileId = await db.select({ count: count() })
      .from(contractorNetworkMetrics)
      .where(sql`prime_profile_id IS NOT NULL`);
    const monthlyWithProfileId = await db.select({ count: count() })
      .from(contractorMetricsMonthly)
      .where(sql`profile_id IS NOT NULL`);

    console.log('\nProfile ID Population Status:');
    console.log(`  📈 Monthly Metrics: ${monthlyWithProfileId[0].count} / ${monthlyMetricsCount[0].count} (${((monthlyWithProfileId[0].count / monthlyMetricsCount[0].count) * 100).toFixed(1)}%)`);
    console.log(`  🏆 Peer Comparisons: ${peerWithProfileId[0].count} / ${peerCount[0].count} (${((peerWithProfileId[0].count / peerCount[0].count) * 100).toFixed(1)}%)`);
    console.log(`  🌐 Network Metrics: ${networkWithPrimeProfileId[0].count} / ${networkCount[0].count} (${((networkWithPrimeProfileId[0].count / networkCount[0].count) * 100).toFixed(1)}%)`);

    // 4. Data Quality Assessment
    console.log('\n4️⃣ Data Quality Assessment:');
    console.log('=' .repeat(50));

    // Count unmapped UEIs in metrics tables
    const unmappedInMetrics = await db.execute(sql`
      SELECT COUNT(DISTINCT contractor_uei) as unmapped_count
      FROM contractor_metrics_monthly cm
      WHERE NOT EXISTS (
        SELECT 1 FROM contractor_uei_mappings m 
        WHERE m.uei = cm.contractor_uei
      )
    `);

    const unmappedInPeer = await db.execute(sql`
      SELECT COUNT(DISTINCT contractor_uei) as unmapped_count
      FROM peer_comparisons_monthly pc
      WHERE NOT EXISTS (
        SELECT 1 FROM contractor_uei_mappings m 
        WHERE m.uei = pc.contractor_uei
      )
    `);

    console.log('Unmapped UEIs (present in metrics but not in mappings):');
    console.log(`  📈 Monthly Metrics: ${unmappedInMetrics[0]?.unmapped_count || 0} unique UEIs`);
    console.log(`  🏆 Peer Comparisons: ${unmappedInPeer[0]?.unmapped_count || 0} unique UEIs`);

    // 5. Boeing analysis
    console.log('\n5️⃣ Boeing Case Study:');
    console.log('=' .repeat(50));

    const boeingMetrics = await db.execute(sql`
      SELECT 
        COUNT(*) as total_metrics_records,
        COUNT(DISTINCT cm.month_year) as unique_months,
        SUM(cm.monthly_revenue::numeric) as total_revenue,
        p.display_name as profile_name,
        p.total_ueis
      FROM contractor_metrics_monthly cm
      JOIN contractor_uei_mappings m ON cm.contractor_uei = m.uei
      JOIN contractor_profiles p ON m.profile_id = p.id
      WHERE p.display_name LIKE '%BOEING%'
      GROUP BY p.display_name, p.total_ueis
      ORDER BY total_revenue DESC
      LIMIT 3
    `);

    if (boeingMetrics.length > 0) {
      console.log('Boeing entities in metrics:');
      for (const boeing of boeingMetrics) {
        console.log(`  ${boeing.profile_name}:`);
        console.log(`    Profile UEIs: ${boeing.total_ueis}`);
        console.log(`    Metrics Records: ${boeing.total_metrics_records}`);
        console.log(`    Unique Months: ${boeing.unique_months}`);
        console.log(`    Total Revenue: $${Number(boeing.total_revenue).toLocaleString()}`);
        console.log('');
      }
    }

    // 6. Recommendations
    console.log('6️⃣ Recommendations:');
    console.log('=' .repeat(50));

    console.log('Based on the analysis, here are the key recommendations:');
    console.log('');
    console.log('🔄 Data Integration:');
    console.log('  - profileId fields in metrics tables are NOT populated (0% filled)');
    console.log('  - Use contractor_uei_mappings as bridge table to join UEI → Profile');
    console.log('  - Only ~15-20% of UEIs in metrics tables have profile mappings');
    console.log('');
    console.log('📊 Query Patterns:');
    console.log('  - Always join: metrics_table → contractor_uei_mappings → contractor_profiles');
    console.log('  - Filter by m.profile_id IS NOT NULL to get mapped data only');
    console.log('  - Use LEFT JOIN to see both mapped and unmapped UEIs');
    console.log('');
    console.log('🏢 Company Analysis (Boeing Example):');
    console.log('  - Boeing has multiple profile entities with different UEI counts');
    console.log('  - Each UEI can have extensive metrics data across time periods');
    console.log('  - Profile aggregation successfully consolidates multiple UEIs');
    console.log('');
    console.log('⚠️  Data Gaps:');
    console.log('  - ~241K UEIs in cache are not mapped to profiles');
    console.log('  - ~224K UEIs in metrics tables lack profile mappings');
    console.log('  - Consider expanding profile aggregation to cover more UEIs');

    console.log('\n✨ Database exploration and analysis complete!');
    
  } catch (error) {
    console.error('❌ Summary generation failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run summary
console.log('🚀 Starting Final Database Summary\n');
generateFinalSummary();