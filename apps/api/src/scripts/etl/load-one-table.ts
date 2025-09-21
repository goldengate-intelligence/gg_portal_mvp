#!/usr/bin/env bun

import {
  loadPeerComparisonsMonthly,
  loadPortfolioBreakdownsMonthly,
  loadSubcontractorMetricsMonthly,
  loadContractorNetworkMetrics,
  loadIcebergOpportunities,
  loadHybridEntities
} from "./snowflake-loader-v2";

const loaders: Record<string, () => Promise<any>> = {
  peer: loadPeerComparisonsMonthly,
  portfolio: loadPortfolioBreakdownsMonthly,
  sub: loadSubcontractorMetricsMonthly,
  network: loadContractorNetworkMetrics,
  iceberg: loadIcebergOpportunities,
  hybrid: loadHybridEntities,
};

async function main() {
  const tableName = process.argv[2];
  
  if (!tableName || !loaders[tableName]) {
    console.log("Usage: bun run load-one-table.ts [peer|portfolio|sub|network|iceberg|hybrid]");
    console.log("\nAvailable tables:");
    console.log("  peer     - Peer Comparisons Monthly");
    console.log("  portfolio - Portfolio Breakdowns Monthly");
    console.log("  sub      - Subcontractor Metrics Monthly");
    console.log("  network  - Contractor Network Metrics");
    console.log("  iceberg  - Iceberg Opportunities (Hidden Revenue Analysis)");
    console.log("  hybrid   - Hybrid Entities");
    process.exit(1);
  }
  
  console.log(`Loading ${tableName} table...`);
  console.log("=".repeat(50));
  
  const startTime = Date.now();
  
  try {
    const loader = loaders[tableName];
    const progress = await loader();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`\n✅ Table loaded successfully in ${duration}s!`);
    if (progress) {
      console.log(`   Processed: ${progress.totalProcessed || 0}`);
      console.log(`   Inserted: ${progress.totalInserted || 0}`);
      console.log(`   Failed: ${progress.totalFailed || 0}`);
      
      if (progress.errors && progress.errors.length > 0) {
        console.log(`\n⚠️ Errors encountered:`);
        progress.errors.forEach((error: string) => {
          console.log(`   - ${error}`);
        });
      }
    }
  } catch (error: any) {
    console.error(`\n❌ Failed to load table:`, error);
    process.exit(1);
  }
  
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});