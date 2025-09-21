#!/usr/bin/env bun

import { loadContractorMetricsMonthly } from "./snowflake-loader-v2";

async function main() {
  console.log("Testing contractor metrics monthly load...");
  
  try {
    const progress = await loadContractorMetricsMonthly();
    console.log("\n✅ Load completed!");
    console.log("Processed:", progress.totalProcessed);
    console.log("Inserted:", progress.totalInserted);
    console.log("Failed:", progress.totalFailed);
    
    if (progress.errors.length > 0) {
      console.log("\nErrors:");
      progress.errors.forEach(err => console.log("  -", err));
    }
  } catch (error) {
    console.error("❌ Fatal error:", error);
  }
  
  process.exit(0);
}

main();