#!/usr/bin/env bun
/**
 * Database Schema Explorer
 * Examines database structure and data to understand contractor profiles and UEI mappings
 */

import { db } from '../db';
import { 
  contractorProfiles, 
  contractorUeiMappings, 
  contractorsCache,
  peerComparisonsMonthly,
  contractorNetworkMetrics,
  contractorUniverse
} from '../db/schema';
import { sql, count, eq, desc, asc, like } from 'drizzle-orm';

async function exploreDatabase() {
  console.log('🔍 Exploring Database Schema and Data...\n');

  try {
    // 1. Check table existence and record counts
    console.log('1️⃣ Table Overview and Record Counts:');
    console.log('=' .repeat(50));

    // Contractor Profiles
    const profileCount = await db.select({ count: count() }).from(contractorProfiles);
    console.log(`Contractor Profiles: ${profileCount[0].count} records`);

    // UEI Mappings
    const mappingCount = await db.select({ count: count() }).from(contractorUeiMappings);
    console.log(`UEI Mappings: ${mappingCount[0].count} records`);

    // Contractors Cache (base UEI data)
    const cacheCount = await db.select({ count: count() }).from(contractorsCache);
    console.log(`Contractors Cache: ${cacheCount[0].count} records`);

    // Peer Comparisons Monthly
    const peerCount = await db.select({ count: count() }).from(peerComparisonsMonthly);
    console.log(`Peer Comparisons Monthly: ${peerCount[0].count} records`);

    // Network Metrics
    const networkCount = await db.select({ count: count() }).from(contractorNetworkMetrics);
    console.log(`Contractor Network Metrics: ${networkCount[0].count} records`);

    // Universe
    const universeCount = await db.select({ count: count() }).from(contractorUniverse);
    console.log(`Contractor Universe: ${universeCount[0].count} records`);

    // 2. Check for populated profileId fields in metrics tables
    console.log('\n2️⃣ ProfileId Population Analysis:');
    console.log('=' .repeat(50));

    // Peer Comparisons with profileId
    const peerWithProfileId = await db.select({ count: count() })
      .from(peerComparisonsMonthly)
      .where(sql`profile_id IS NOT NULL`);
    console.log(`Peer Comparisons with profileId: ${peerWithProfileId[0].count} / ${peerCount[0].count}`);

    // Network Metrics with profileId
    const networkWithPrimeProfileId = await db.select({ count: count() })
      .from(contractorNetworkMetrics)
      .where(sql`prime_profile_id IS NOT NULL`);
    const networkWithSubProfileId = await db.select({ count: count() })
      .from(contractorNetworkMetrics)
      .where(sql`sub_profile_id IS NOT NULL`);
    console.log(`Network Metrics with prime_profile_id: ${networkWithPrimeProfileId[0].count} / ${networkCount[0].count}`);
    console.log(`Network Metrics with sub_profile_id: ${networkWithSubProfileId[0].count} / ${networkCount[0].count}`);

    // 3. Sample contractor profile analysis (Boeing if exists)
    console.log('\n3️⃣ Sample Contractor Analysis (Boeing-like companies):');
    console.log('=' .repeat(50));

    // Look for Boeing or other large contractors
    const boeingProfiles = await db.select()
      .from(contractorProfiles)
      .where(like(contractorProfiles.displayName, '%BOEING%'))
      .limit(3);

    if (boeingProfiles.length > 0) {
      for (const profile of boeingProfiles) {
        console.log(`\nProfile: ${profile.displayName}`);
        console.log(`  ID: ${profile.id}`);
        console.log(`  Canonical Name: ${profile.canonicalName}`);
        console.log(`  Total UEIs: ${profile.totalUeis}`);
        console.log(`  Total Contracts: ${profile.totalContracts}`);
        console.log(`  Total Obligated: $${profile.totalObligated}`);
        console.log(`  Primary Agency: ${profile.primaryAgency}`);
        console.log(`  Headquarters State: ${profile.headquartersState}`);

        // Get UEI mappings for this profile
        const ueiMappings = await db.select()
          .from(contractorUeiMappings)
          .where(eq(contractorUeiMappings.profileId, profile.id))
          .limit(5);

        console.log(`  UEI Mappings (showing first 5):`);
        for (const mapping of ueiMappings) {
          console.log(`    - UEI: ${mapping.uei}, Name: ${mapping.contractorName}`);
          console.log(`      Contracts: ${mapping.totalContracts}, Obligated: $${mapping.totalObligated}`);
        }
      }
    } else {
      // If no Boeing, look for top contractors by revenue
      console.log('No Boeing found, showing top contractors by revenue:');
      const topContractors = await db.select()
        .from(contractorProfiles)
        .orderBy(desc(contractorProfiles.totalObligated))
        .limit(3);

      for (const profile of topContractors) {
        console.log(`\nProfile: ${profile.displayName}`);
        console.log(`  Total UEIs: ${profile.totalUeis}`);
        console.log(`  Total Obligated: $${profile.totalObligated}`);

        // Get UEI mappings
        const ueiMappings = await db.select()
          .from(contractorUeiMappings)
          .where(eq(contractorUeiMappings.profileId, profile.id))
          .limit(3);

        console.log(`  UEI Mappings (first 3):`);
        for (const mapping of ueiMappings) {
          console.log(`    - UEI: ${mapping.uei}, Name: ${mapping.contractorName}`);
        }
      }
    }

    // 4. UEI to Profile relationship analysis
    console.log('\n4️⃣ UEI to Profile Relationship Analysis:');
    console.log('=' .repeat(50));

    // Count unmapped UEIs (in cache but not in mappings)
    const unmappedUeis = await db.execute(sql`
      SELECT COUNT(*) as unmapped_count
      FROM contractors_cache c
      WHERE NOT EXISTS (
        SELECT 1 FROM contractor_uei_mappings m 
        WHERE m.uei = c.contractor_uei
      )
    `);
    console.log(`Unmapped UEIs (in cache but not mapped to profiles): ${unmappedUeis[0]?.unmapped_count || 0}`);

    // Profile distribution by UEI count
    const profileUeiDistribution = await db.execute(sql`
      SELECT 
        total_ueis,
        COUNT(*) as profile_count
      FROM contractor_profiles 
      WHERE total_ueis > 0
      GROUP BY total_ueis 
      ORDER BY total_ueis DESC
      LIMIT 10
    `);

    console.log('\nProfile distribution by UEI count (top 10):');
    for (const row of profileUeiDistribution) {
      console.log(`  ${row.total_ueis} UEIs: ${row.profile_count} profiles`);
    }

    // 5. Data quality checks
    console.log('\n5️⃣ Data Quality Checks:');
    console.log('=' .repeat(50));

    // Check for profiles with 0 total contracts but UEI mappings
    const profilesWithZeroContracts = await db.select({ count: count() })
      .from(contractorProfiles)
      .where(eq(contractorProfiles.totalContracts, 0));
    console.log(`Profiles with 0 total contracts: ${profilesWithZeroContracts[0].count}`);

    // Check for UEI mappings without corresponding cache entries
    const orphanMappings = await db.execute(sql`
      SELECT COUNT(*) as orphan_count
      FROM contractor_uei_mappings m
      WHERE NOT EXISTS (
        SELECT 1 FROM contractors_cache c 
        WHERE c.contractor_uei = m.uei
      )
    `);
    console.log(`UEI mappings without cache entries: ${orphanMappings[0]?.orphan_count || 0}`);

    // 6. Sample UEI-to-Profile join example
    console.log('\n6️⃣ Sample UEI-to-Profile Join Pattern:');
    console.log('=' .repeat(50));

    const sampleJoin = await db.execute(sql`
      SELECT 
        c.contractor_uei,
        c.contractor_name as cache_name,
        c.total_obligated as cache_obligated,
        p.display_name as profile_name,
        p.total_obligated as profile_obligated,
        m.mapping_confidence
      FROM contractors_cache c
      LEFT JOIN contractor_uei_mappings m ON c.contractor_uei = m.uei
      LEFT JOIN contractor_profiles p ON m.profile_id = p.id
      WHERE c.total_obligated > 1000000
      ORDER BY c.total_obligated DESC
      LIMIT 5
    `);

    console.log('Sample UEI-to-Profile relationships (top 5 by cache obligated):');
    for (const row of sampleJoin) {
      console.log(`  UEI: ${row.contractor_uei}`);
      console.log(`    Cache: ${row.cache_name} ($${row.cache_obligated})`);
      if (row.profile_name) {
        console.log(`    Profile: ${row.profile_name} ($${row.profile_obligated})`);
        console.log(`    Mapping Confidence: ${row.mapping_confidence}%`);
      } else {
        console.log(`    Profile: NOT MAPPED`);
      }
      console.log('');
    }

    console.log('✨ Database exploration complete!');
    
  } catch (error) {
    console.error('❌ Exploration failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run exploration
console.log('🚀 Starting Database Schema Exploration\n');
exploreDatabase();