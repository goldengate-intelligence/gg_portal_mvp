#!/usr/bin/env bun
/**
 * Metrics Tables Explorer
 * Deep dive into the metrics tables and their relationship to profiles
 */

import { db } from '../db';
import { 
  contractorProfiles, 
  contractorUeiMappings, 
  contractorsCache,
  peerComparisonsMonthly,
  contractorNetworkMetrics,
  contractorMetricsMonthly,
  contractorUniverse
} from '../db/schema';
import { sql, count, eq, desc, asc, like, and } from 'drizzle-orm';

async function exploreMetricsTables() {
  console.log('📊 Exploring Metrics Tables and Profile Relationships...\n');

  try {
    // 1. Deep dive into metrics tables structure
    console.log('1️⃣ Metrics Tables Data Analysis:');
    console.log('=' .repeat(50));

    // Check contractor_metrics_monthly table
    const monthlyMetricsCount = await db.select({ count: count() }).from(contractorMetricsMonthly);
    console.log(`Contractor Metrics Monthly: ${monthlyMetricsCount[0].count} records`);

    // Sample data from monthly metrics
    const sampleMonthlyMetrics = await db.select()
      .from(contractorMetricsMonthly)
      .orderBy(desc(contractorMetricsMonthly.monthlyRevenue))
      .limit(5);

    console.log('\nSample monthly metrics (top 5 by revenue):');
    for (const metric of sampleMonthlyMetrics) {
      console.log(`  UEI: ${metric.contractorUei}`);
      console.log(`    Name: ${metric.contractorName}`);
      console.log(`    Month: ${metric.monthYear}`);
      console.log(`    Revenue: $${metric.monthlyRevenue}`);
      console.log(`    Profile ID: ${metric.profileId || 'NOT SET'}`);
      console.log('');
    }

    // 2. Check peer comparisons monthly
    console.log('2️⃣ Peer Comparisons Monthly Analysis:');
    console.log('=' .repeat(50));

    // Sample data from peer comparisons
    const samplePeerComparisons = await db.select()
      .from(peerComparisonsMonthly)
      .orderBy(desc(peerComparisonsMonthly.overallPerformanceScore))
      .limit(5);

    console.log('Sample peer comparisons (top 5 by performance score):');
    for (const peer of samplePeerComparisons) {
      console.log(`  UEI: ${peer.contractorUei}`);
      console.log(`    Name: ${peer.contractorName}`);
      console.log(`    Month: ${peer.monthYear}`);
      console.log(`    Performance Score: ${peer.overallPerformanceScore}`);
      console.log(`    Revenue Percentile: ${peer.revenuePercentile}th`);
      console.log(`    Profile ID: ${peer.profileId || 'NOT SET'}`);
      console.log('');
    }

    // 3. Check network metrics
    console.log('3️⃣ Network Metrics Analysis:');
    console.log('=' .repeat(50));

    // Sample data from network metrics
    const sampleNetworkMetrics = await db.select()
      .from(contractorNetworkMetrics)
      .orderBy(desc(contractorNetworkMetrics.monthlySharedRevenue))
      .limit(5);

    console.log('Sample network metrics (top 5 by shared revenue):');
    for (const network of sampleNetworkMetrics) {
      console.log(`  Prime UEI: ${network.primeUei} (${network.primeName})`);
      console.log(`  Sub UEI: ${network.subUei} (${network.subName})`);
      console.log(`  Month: ${network.monthYear}`);
      console.log(`  Shared Revenue: $${network.monthlySharedRevenue}`);
      console.log(`  Prime Profile ID: ${network.primeProfileId || 'NOT SET'}`);
      console.log(`  Sub Profile ID: ${network.subProfileId || 'NOT SET'}`);
      console.log('');
    }

    // 4. Analyze UEI presence across tables
    console.log('4️⃣ UEI Coverage Analysis Across Tables:');
    console.log('=' .repeat(50));

    // Find UEIs that exist in multiple tables
    const ueiCoverage = await db.execute(sql`
      WITH uei_sources AS (
        SELECT 
          contractor_uei as uei,
          'cache' as source
        FROM contractors_cache
        
        UNION ALL
        
        SELECT 
          uei,
          'mappings' as source
        FROM contractor_uei_mappings
        
        UNION ALL
        
        SELECT 
          contractor_uei as uei,
          'monthly_metrics' as source
        FROM contractor_metrics_monthly
        
        UNION ALL
        
        SELECT 
          contractor_uei as uei,
          'peer_comparisons' as source
        FROM peer_comparisons_monthly
        
        UNION ALL
        
        SELECT 
          prime_uei as uei,
          'network_prime' as source
        FROM contractor_network_metrics
        
        UNION ALL
        
        SELECT 
          sub_uei as uei,
          'network_sub' as source
        FROM contractor_network_metrics
      )
      SELECT 
        source,
        COUNT(DISTINCT uei) as unique_ueis
      FROM uei_sources
      GROUP BY source
      ORDER BY unique_ueis DESC
    `);

    console.log('UEI coverage by table:');
    for (const row of ueiCoverage) {
      console.log(`  ${row.source}: ${row.unique_ueis} unique UEIs`);
    }

    // 5. Find a specific company to analyze join patterns
    console.log('\n5️⃣ Join Pattern Analysis (Boeing Example):');
    console.log('=' .repeat(50));

    // Get Boeing profile data with all related metrics
    const boeingAnalysis = await db.execute(sql`
      WITH boeing_profile AS (
        SELECT id, display_name, canonical_name, total_ueis
        FROM contractor_profiles 
        WHERE display_name LIKE '%BOEING%'
        LIMIT 1
      ),
      boeing_ueis AS (
        SELECT m.uei, m.contractor_name, m.profile_id
        FROM contractor_uei_mappings m
        JOIN boeing_profile p ON p.id = m.profile_id
      )
      SELECT 
        bp.display_name as profile_name,
        bp.total_ueis as profile_uei_count,
        bu.uei,
        bu.contractor_name,
        -- Check if UEI exists in metrics tables
        CASE WHEN cm.contractor_uei IS NOT NULL THEN 'YES' ELSE 'NO' END as has_monthly_metrics,
        CASE WHEN pc.contractor_uei IS NOT NULL THEN 'YES' ELSE 'NO' END as has_peer_comparisons,
        CASE WHEN nm.prime_uei IS NOT NULL OR nm.sub_uei IS NOT NULL THEN 'YES' ELSE 'NO' END as has_network_metrics
      FROM boeing_profile bp
      JOIN boeing_ueis bu ON TRUE
      LEFT JOIN contractor_metrics_monthly cm ON cm.contractor_uei = bu.uei
      LEFT JOIN peer_comparisons_monthly pc ON pc.contractor_uei = bu.uei
      LEFT JOIN contractor_network_metrics nm ON nm.prime_uei = bu.uei OR nm.sub_uei = bu.uei
      GROUP BY bp.display_name, bp.total_ueis, bu.uei, bu.contractor_name, 
               CASE WHEN cm.contractor_uei IS NOT NULL THEN 'YES' ELSE 'NO' END,
               CASE WHEN pc.contractor_uei IS NOT NULL THEN 'YES' ELSE 'NO' END,
               CASE WHEN nm.prime_uei IS NOT NULL OR nm.sub_uei IS NOT NULL THEN 'YES' ELSE 'NO' END
    `);

    if (boeingAnalysis.length > 0) {
      console.log(`Profile: ${boeingAnalysis[0].profile_name}`);
      console.log(`Total UEIs in profile: ${boeingAnalysis[0].profile_uei_count}`);
      console.log('\nUEI-level metrics availability:');
      for (const row of boeingAnalysis) {
        console.log(`  UEI: ${row.uei} (${row.contractor_name})`);
        console.log(`    Monthly Metrics: ${row.has_monthly_metrics}`);
        console.log(`    Peer Comparisons: ${row.has_peer_comparisons}`);
        console.log(`    Network Metrics: ${row.has_network_metrics}`);
      }
    }

    // 6. Analyze how to populate profileId fields
    console.log('\n6️⃣ ProfileId Population Strategy:');
    console.log('=' .repeat(50));

    // Show how many UEIs in metrics tables can be mapped to profiles
    const mappableUeis = await db.execute(sql`
      SELECT 
        'monthly_metrics' as table_name,
        COUNT(DISTINCT cm.contractor_uei) as total_ueis,
        COUNT(DISTINCT CASE WHEN m.profile_id IS NOT NULL THEN cm.contractor_uei END) as mappable_ueis
      FROM contractor_metrics_monthly cm
      LEFT JOIN contractor_uei_mappings m ON cm.contractor_uei = m.uei
      
      UNION ALL
      
      SELECT 
        'peer_comparisons' as table_name,
        COUNT(DISTINCT pc.contractor_uei) as total_ueis,
        COUNT(DISTINCT CASE WHEN m.profile_id IS NOT NULL THEN pc.contractor_uei END) as mappable_ueis
      FROM peer_comparisons_monthly pc
      LEFT JOIN contractor_uei_mappings m ON pc.contractor_uei = m.uei
      
      UNION ALL
      
      SELECT 
        'network_prime' as table_name,
        COUNT(DISTINCT nm.prime_uei) as total_ueis,
        COUNT(DISTINCT CASE WHEN m.profile_id IS NOT NULL THEN nm.prime_uei END) as mappable_ueis
      FROM contractor_network_metrics nm
      LEFT JOIN contractor_uei_mappings m ON nm.prime_uei = m.uei
      
      UNION ALL
      
      SELECT 
        'network_sub' as table_name,
        COUNT(DISTINCT nm.sub_uei) as total_ueis,
        COUNT(DISTINCT CASE WHEN m.profile_id IS NOT NULL THEN nm.sub_uei END) as mappable_ueis
      FROM contractor_network_metrics nm
      LEFT JOIN contractor_uei_mappings m ON nm.sub_uei = m.uei
    `);

    console.log('ProfileId mapping potential:');
    for (const row of mappableUeis) {
      const percentage = ((row.mappable_ueis / row.total_ueis) * 100).toFixed(1);
      console.log(`  ${row.table_name}: ${row.mappable_ueis}/${row.total_ueis} (${percentage}%) can be mapped to profiles`);
    }

    // 7. Sample join query showing how to connect UEI to profile
    console.log('\n7️⃣ Sample Join Query Pattern:');
    console.log('=' .repeat(50));

    const sampleJoinQuery = `
    -- Example: Get monthly metrics with profile information
    SELECT 
      cm.contractor_uei,
      cm.contractor_name,
      cm.month_year,
      cm.monthly_revenue,
      p.id as profile_id,
      p.display_name as profile_name,
      p.total_ueis as profile_total_ueis
    FROM contractor_metrics_monthly cm
    LEFT JOIN contractor_uei_mappings m ON cm.contractor_uei = m.uei
    LEFT JOIN contractor_profiles p ON m.profile_id = p.id
    WHERE cm.monthly_revenue > 10000000
    ORDER BY cm.monthly_revenue DESC
    LIMIT 10;
    `;

    console.log('SQL pattern to join metrics to profiles:');
    console.log(sampleJoinQuery);

    // Execute the sample query
    const sampleJoinResults = await db.execute(sql`
      SELECT 
        cm.contractor_uei,
        cm.contractor_name,
        cm.month_year,
        cm.monthly_revenue,
        p.id as profile_id,
        p.display_name as profile_name,
        p.total_ueis as profile_total_ueis
      FROM contractor_metrics_monthly cm
      LEFT JOIN contractor_uei_mappings m ON cm.contractor_uei = m.uei
      LEFT JOIN contractor_profiles p ON m.profile_id = p.id
      WHERE cm.monthly_revenue > 10000000
      ORDER BY cm.monthly_revenue DESC
      LIMIT 10
    `);

    console.log('\nSample results:');
    for (const row of sampleJoinResults) {
      console.log(`  UEI: ${row.contractor_uei}`);
      console.log(`    Metrics Name: ${row.contractor_name}`);
      console.log(`    Revenue: $${row.monthly_revenue} (${row.month_year})`);
      if (row.profile_id) {
        console.log(`    Profile: ${row.profile_name} (${row.profile_total_ueis} UEIs)`);
      } else {
        console.log(`    Profile: NOT MAPPED`);
      }
      console.log('');
    }

    console.log('✨ Metrics tables exploration complete!');
    
  } catch (error) {
    console.error('❌ Exploration failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run exploration
console.log('🚀 Starting Metrics Tables Exploration\n');
exploreMetricsTables();