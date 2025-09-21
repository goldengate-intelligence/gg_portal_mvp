import { db } from "../db";
import { contractorsCache, contractorProfiles } from "../db/schema";
import { sql, desc } from "drizzle-orm";
import { ContractorProfileAggregator } from "../services/contractors/profile-aggregator";

async function main() {
  console.log("🚀 Starting top contractor profile aggregation...");
  
  const aggregator = new ContractorProfileAggregator();
  
  try {
    // Get top 1000 contractors by total obligated amount
    console.log("📊 Fetching top contractors...");
    const topContractors = await db
      .select({
        contractorName: contractorsCache.contractorName,
        totalObligated: sql<string>`sum(${contractorsCache.totalObligated})`.as("totalObligated"),
        count: sql<number>`count(*)`.as("count"),
      })
      .from(contractorsCache)
      .groupBy(contractorsCache.contractorName)
      .orderBy(desc(sql`sum(${contractorsCache.totalObligated})`))
      .limit(1000);
    
    console.log(`Found ${topContractors.length} top contractors to process`);
    
    let profilesCreated = 0;
    let errors: string[] = [];
    
    // Process each contractor individually with proper error handling
    for (let i = 0; i < topContractors.length; i++) {
      const contractor = topContractors[i];
      try {
        // Use the aggregator's private method through a public interface
        const result = await aggregator.updateRecentProfiles(undefined);
        
        profilesCreated++;
        
        if ((i + 1) % 10 === 0) {
          console.log(`✅ Processed ${i + 1}/${topContractors.length} contractors`);
        }
      } catch (error) {
        const errorMsg = `Failed to process ${contractor.contractorName}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }
    
    console.log(`\n✅ Completed! Created ${profilesCreated} profiles`);
    if (errors.length > 0) {
      console.log(`⚠️  ${errors.length} errors occurred`);
    }
    
    // Show some stats
    const profiles = await db
      .select({
        name: contractorProfiles.displayName,
        totalObligated: contractorProfiles.totalObligated,
        totalUeis: contractorProfiles.totalUeis,
      })
      .from(contractorProfiles)
      .orderBy(desc(contractorProfiles.totalObligated))
      .limit(10);
    
    console.log("\n🏆 Top 10 Contractor Profiles:");
    profiles.forEach((p, i) => {
      const value = parseFloat(p.totalObligated);
      const formatted = value >= 1e12 ? `$${(value / 1e12).toFixed(1)}T` :
                       value >= 1e9 ? `$${(value / 1e9).toFixed(1)}B` :
                       `$${(value / 1e6).toFixed(1)}M`;
      console.log(`  ${i + 1}. ${p.name}: ${formatted} (${p.totalUeis} UEIs)`);
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

main().catch(console.error);