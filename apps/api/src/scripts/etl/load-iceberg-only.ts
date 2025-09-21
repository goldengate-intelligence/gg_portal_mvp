#!/usr/bin/env bun

import { loadIcebergOpportunities } from "./snowflake-loader-lib";
import { db } from "../../db";
import { sql } from "drizzle-orm";

async function loadIcebergOnly() {
  console.log("🧊 Loading Iceberg Opportunities Only");
  console.log("=====================================\n");
  
  try {
    const result = await loadIcebergOpportunities();
    console.log("\n✅ Iceberg opportunities loaded successfully!");
    console.log(result);
    
    // Verify the data
    console.log("\nVerifying loaded data...");
    
    const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM contractor_iceberg_opportunities`);
    const count = countResult.rows?.[0]?.count || 0;
    console.log(`Total iceberg opportunities in database: ${count}`);
    
  } catch (error) {
    console.error("❌ Failed to load iceberg opportunities:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

loadIcebergOnly();