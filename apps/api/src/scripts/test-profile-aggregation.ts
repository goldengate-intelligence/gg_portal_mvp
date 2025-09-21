import { db } from "../db";
import { contractorsCache, contractorProfiles } from "../db/schema";
import { sql, desc, inArray } from "drizzle-orm";

async function main() {
  console.log("🧪 Testing profile aggregation with a few contractors...");
  
  try {
    // Get a few test contractors with different characteristics
    const testContractorNames = [
      'LOCKHEED MARTIN CORPORATION',
      'GENERAL DYNAMICS CORPORATION',
      'RAYTHEON COMPANY',
      'NORTHROP GRUMMAN CORPORATION',
      'BOEING COMPANY'
    ];
    
    // Clear any existing test profiles
    console.log("🧹 Clearing existing test profiles...");
    for (const name of testContractorNames) {
      await db
        .delete(contractorProfiles)
        .where(sql`upper(${contractorProfiles.displayName}) LIKE upper(${'%' + name + '%'})`);
    }
    
    // Process each test contractor
    for (const contractorName of testContractorNames) {
      console.log(`\n📊 Processing ${contractorName}...`);
      
      // Get all records for this contractor (fuzzy match)
      const records = await db
        .select()
        .from(contractorsCache)
        .where(sql`upper(${contractorsCache.contractorName}) LIKE upper(${'%' + contractorName + '%'})`)
        .limit(100); // Limit to avoid too many variations
      
      if (records.length === 0) {
        console.log(`  ⚠️  No records found for ${contractorName}`);
        continue;
      }
      
      // Group by exact name
      const nameGroups = new Map<string, typeof records>();
      records.forEach(record => {
        const existing = nameGroups.get(record.contractorName) || [];
        existing.push(record);
        nameGroups.set(record.contractorName, existing);
      });
      
      console.log(`  Found ${nameGroups.size} name variations with ${records.length} total UEIs`);
      
      // Process the largest group
      const largestGroup = Array.from(nameGroups.entries())
        .sort((a, b) => b[1].length - a[1].length)[0];
      
      const [exactName, groupRecords] = largestGroup;
      console.log(`  Processing "${exactName}" with ${groupRecords.length} UEIs`);
      
      // Calculate aggregates
      const totalContracts = groupRecords.reduce((sum, r) => sum + r.totalContracts, 0);
      const totalObligated = groupRecords.reduce((sum, r) => {
        const val = parseFloat(r.totalObligated || "0");
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
      
      // Get unique agencies and states
      const agencies = new Set(groupRecords.map(r => r.primaryAgency).filter(Boolean));
      const states = new Set(groupRecords.map(r => r.state).filter(Boolean));
      
      console.log(`  Total Contracts: ${totalContracts.toLocaleString()}`);
      console.log(`  Total Obligated: $${(totalObligated / 1e9).toFixed(2)}B`);
      console.log(`  Agencies: ${agencies.size}`);
      console.log(`  States: ${states.size}`);
      
      // Create profile
      const canonicalName = exactName.toUpperCase().trim()
        .replace(/\s+/g, ' ')
        .replace(/[,\.]?\s*(INC|LLC|CORP|CORPORATION|LTD|LIMITED|CO|COMPANY)\.?$/i, '')
        .trim();
      
      const profile = {
        canonicalName,
        displayName: exactName,
        totalUeis: groupRecords.length,
        totalContracts,
        totalObligated: totalObligated.toFixed(2),
        avgContractValue: (totalContracts > 0 ? totalObligated / totalContracts : 0).toFixed(2),
        primaryAgency: Array.from(agencies)[0] || null,
        totalAgencies: agencies.size,
        agencyDiversity: agencies.size,
        headquartersState: Array.from(states)[0] || null,
        totalStates: states.size,
        statesList: Array.from(states),
        performanceScore: Math.min(100, 50 + agencies.size * 5),
        isActive: true,
      };
      
      const [inserted] = await db
        .insert(contractorProfiles)
        .values(profile)
        .onConflictDoUpdate({
          target: contractorProfiles.canonicalName,
          set: {
            ...profile,
            profileUpdatedAt: new Date(),
          }
        })
        .returning({ id: contractorProfiles.id, name: contractorProfiles.displayName });
      
      console.log(`  ✅ Created/Updated profile: ${inserted.id}`);
    }
    
    // Show results
    console.log("\n📊 Test Profiles Created:");
    const profiles = await db
      .select({
        name: contractorProfiles.displayName,
        totalObligated: contractorProfiles.totalObligated,
        totalUeis: contractorProfiles.totalUeis,
        totalContracts: contractorProfiles.totalContracts,
      })
      .from(contractorProfiles)
      .orderBy(desc(contractorProfiles.totalObligated))
      .limit(10);
    
    profiles.forEach((p, i) => {
      const value = parseFloat(p.totalObligated);
      const formatted = value >= 1e9 ? `$${(value / 1e9).toFixed(1)}B` : `$${(value / 1e6).toFixed(1)}M`;
      console.log(`  ${i + 1}. ${p.name}: ${formatted} (${p.totalUeis} UEIs, ${p.totalContracts} contracts)`);
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

main().catch(console.error);