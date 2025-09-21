#!/usr/bin/env bun

import {
  loadPeerComparisonsMonthly,
  loadPortfolioBreakdownsMonthly,
  loadSubcontractorMetricsMonthly,
  loadContractorNetworkMetrics,
  loadSearchIndex,
  loadHybridEntities
} from "./snowflake-loader-v2";
import { db } from "../../db";
import { sql } from "drizzle-orm";

async function checkTableStatus() {
  const query = sql`
    SELECT 
      'contractor_universe' as table_name, 
      COUNT(*) as count 
    FROM contractor_universe
    UNION ALL
    SELECT 'contractor_metrics_monthly', COUNT(*) FROM contractor_metrics_monthly
    UNION ALL
    SELECT 'peer_comparisons_monthly', COUNT(*) FROM peer_comparisons_monthly
    UNION ALL
    SELECT 'portfolio_breakdowns_monthly', COUNT(*) FROM portfolio_breakdowns_monthly
    UNION ALL
    SELECT 'subcontractor_metrics_monthly', COUNT(*) FROM subcontractor_metrics_monthly
    UNION ALL
    SELECT 'contractor_network_metrics', COUNT(*) FROM contractor_network_metrics
    UNION ALL
    SELECT 'contractor_search_index', COUNT(*) FROM contractor_search_index
  `;
  
  const results = await db.execute(query);
  console.log("\n=== Current Table Status ===");
  if (Array.isArray(results)) {
    results.forEach((row: any) => {
      console.log(`${row.table_name}: ${row.count.toString().padStart(10)} records`);
    });
  } else if (results && Array.isArray(results.rows)) {
    results.rows.forEach((row: any) => {
      console.log(`${row.table_name}: ${row.count.toString().padStart(10)} records`);
    });
  }
  console.log("");
}

async function main() {
  console.log("Loading Remaining Snowflake Tables");
  console.log("===================================\n");
  
  // Check current status
  await checkTableStatus();
  
  // Tables to load (in dependency order)
  const tablesToLoad = [
    { 
      name: "Peer Comparisons Monthly",
      loader: loadPeerComparisonsMonthly
    },
    {
      name: "Portfolio Breakdowns Monthly", 
      loader: loadPortfolioBreakdownsMonthly
    },
    {
      name: "Subcontractor Metrics Monthly",
      loader: loadSubcontractorMetricsMonthly
    },
    {
      name: "Contractor Network Metrics",
      loader: loadContractorNetworkMetrics
    },
    {
      name: "Search Index",
      loader: loadSearchIndex
    },
    {
      name: "Hybrid Entities",
      loader: loadHybridEntities
    }
  ];
  
  console.log(`Will load ${tablesToLoad.length} tables...`);
  
  for (const table of tablesToLoad) {
    console.log(`\nLoading ${table.name}...`);
    console.log("=".repeat(50));
    
    const startTime = Date.now();
    
    try {
      const progress = await table.loader();
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      console.log(`✅ ${table.name} loaded successfully in ${duration}s!`);
      if (progress) {
        console.log(`   Processed: ${progress.totalProcessed || 0}`);
        console.log(`   Inserted: ${progress.totalInserted || 0}`);
        console.log(`   Failed: ${progress.totalFailed || 0}`);
        
        if (progress.errors && progress.errors.length > 0) {
          console.log(`   ⚠️ Errors encountered:`);
          progress.errors.slice(0, 3).forEach((error: string) => {
            console.log(`      - ${error.substring(0, 100)}...`);
          });
        }
      }
    } catch (error: any) {
      console.error(`❌ Failed to load ${table.name}:`, error?.message || error);
    }
  }
  
  // Final status check
  console.log("\n" + "=".repeat(50));
  console.log("FINAL STATUS:");
  await checkTableStatus();
  
  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("✅ ETL Process Complete!");
  console.log("\nNext steps:");
  console.log("1. Verify data quality with sample queries");
  console.log("2. Create analytics views for common queries");
  console.log("3. Build indexes for performance optimization");
  console.log("4. Set up incremental load processes");
  
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});