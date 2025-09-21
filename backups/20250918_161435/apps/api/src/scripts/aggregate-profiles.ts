import { ContractorProfileAggregator } from "../services/contractors/profile-aggregator";
import { db } from "../db";
import { contractorProfiles } from "../db/schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🚀 Starting contractor profile aggregation...");
  
  const aggregator = new ContractorProfileAggregator();
  
  try {
    // Check existing profiles
    const [{ count: existingCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contractorProfiles);
    
    if (Number(existingCount) > 0) {
      console.log(`⚠️  Found ${existingCount} existing profiles`);
      console.log("This will rebuild all profiles from scratch.");
      console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Run aggregation
    console.log("📊 Building contractor profiles from cache data...");
    const startTime = Date.now();
    
    const result = await aggregator.buildAllProfiles();
    
    const duration = Date.now() - startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    console.log("\n✅ Profile aggregation completed!");
    console.log(`📈 Created ${result.profilesCreated} contractor profiles`);
    console.log(`🔗 Mapped ${result.ueisMapped} UEIs to profiles`);
    console.log(`⏱️  Duration: ${minutes}m ${seconds}s`);
    
    if (result.errors.length > 0) {
      console.log(`\n⚠️  ${result.errors.length} errors occurred:`);
      result.errors.slice(0, 10).forEach(error => {
        console.log(`  - ${error}`);
      });
      if (result.errors.length > 10) {
        console.log(`  ... and ${result.errors.length - 10} more`);
      }
    }
    
    // Show some statistics
    const [stats] = await db
      .select({
        totalProfiles: sql<number>`count(*)`,
        totalObligated: sql<string>`sum(${contractorProfiles.totalObligated})`,
        avgUeis: sql<number>`avg(${contractorProfiles.totalUeis})`,
        maxUeis: sql<number>`max(${contractorProfiles.totalUeis})`,
      })
      .from(contractorProfiles);
    
    console.log("\n📊 Profile Statistics:");
    console.log(`  Total Profiles: ${stats.totalProfiles}`);
    console.log(`  Total Contract Value: $${(parseFloat(stats.totalObligated) / 1e12).toFixed(2)}T`);
    console.log(`  Average UEIs per Profile: ${Math.round(stats.avgUeis)}`);
    console.log(`  Maximum UEIs for a Profile: ${stats.maxUeis}`);
    
    // Show top 5 contractors by value
    const topContractors = await db
      .select({
        name: contractorProfiles.displayName,
        totalObligated: contractorProfiles.totalObligated,
        totalUeis: contractorProfiles.totalUeis,
      })
      .from(contractorProfiles)
      .orderBy(sql`${contractorProfiles.totalObligated} DESC`)
      .limit(5);
    
    console.log("\n🏆 Top 5 Contractors by Total Contract Value:");
    topContractors.forEach((contractor, i) => {
      const value = parseFloat(contractor.totalObligated);
      const formatted = value >= 1e12 ? `$${(value / 1e12).toFixed(1)}T` :
                       value >= 1e9 ? `$${(value / 1e9).toFixed(1)}B` :
                       `$${(value / 1e6).toFixed(1)}M`;
      console.log(`  ${i + 1}. ${contractor.name}: ${formatted} (${contractor.totalUeis} UEIs)`);
    });
    
  } catch (error) {
    console.error("❌ Error during profile aggregation:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

main().catch(console.error);