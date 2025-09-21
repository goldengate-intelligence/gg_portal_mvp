#!/usr/bin/env bun

import { createReadStream } from "fs";
import { createGunzip } from "zlib";
import { parse } from "csv-parse";
import { db } from "../../db";
import {
  contractorUniverse,
  contractorMetricsMonthly,
} from "../../db/schema/contractor-metrics";
import { sql } from "drizzle-orm";

// Simple load of contractor universe
async function loadUniverse() {
  console.log("Loading contractor universe...");
  
  const file = "data/snowflake-staging/full_contractor_universe.csv.gz";
  let count = 0;
  let batch: any[] = [];
  const BATCH_SIZE = 500;
  
  return new Promise((resolve, reject) => {
    const stream = createReadStream(file)
      .pipe(createGunzip())
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
          cast: false,
        })
      );

    stream.on("data", async (row) => {
      const record = {
        uei: row.RECIPIENT_UEI,
        legalBusinessName: row.RECIPIENT_NAME,
        entityType: row.ENTITY_TYPE || null,
        lifetimeRevenue: row.TOTAL_REVENUE_LIFETIME_MILLIONS || "0",
        isActive: row.HAS_PRIME_ACTIVITY === "true" || row.HAS_SUB_ACTIVITY === "true",
        isPrime: row.HAS_PRIME_ACTIVITY === "true",
        isSubcontractor: row.HAS_SUB_ACTIVITY === "true",
        isHybrid: row.ENTITY_TYPE === "HYBRID",
        lastUpdatedDate: row.LAST_UPDATED ? new Date(row.LAST_UPDATED) : null,
      };
      
      batch.push(record);
      
      if (batch.length >= BATCH_SIZE) {
        stream.pause();
        
        try {
          await db
            .insert(contractorUniverse)
            .values(batch)
            .onConflictDoNothing();
          
          count += batch.length;
          console.log(`  Loaded ${count} records...`);
          batch = [];
        } catch (error) {
          console.error("Batch error:", error);
        }
        
        stream.resume();
      }
    });

    stream.on("end", async () => {
      if (batch.length > 0) {
        try {
          await db
            .insert(contractorUniverse)
            .values(batch)
            .onConflictDoNothing();
          
          count += batch.length;
        } catch (error) {
          console.error("Final batch error:", error);
        }
      }
      
      console.log(`✅ Loaded ${count} universe records`);
      resolve(count);
    });

    stream.on("error", reject);
  });
}

// Simple load of one metrics file
async function loadOneMetricsFile(filePath: string) {
  console.log(`Loading ${filePath}...`);
  
  let count = 0;
  let batch: any[] = [];
  const BATCH_SIZE = 500;
  
  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath)
      .pipe(createGunzip())
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
          cast: false,
        })
      );

    stream.on("data", async (row) => {
      // Skip invalid dates
      if (!row.SNAPSHOT_MONTH || row.SNAPSHOT_MONTH === "\\N") return;
      
      const record = {
        contractorUei: row.RECIPIENT_UEI,
        contractorName: row.RECIPIENT_NAME,
        monthYear: new Date(row.SNAPSHOT_MONTH),
        monthlyRevenue: (!row.REVENUE_MONTHLY_MILLIONS || row.REVENUE_MONTHLY_MILLIONS === "\\N") ? "0" : row.REVENUE_MONTHLY_MILLIONS,
        monthlyAwards: (!row.AWARDS_MONTHLY_MILLIONS || row.AWARDS_MONTHLY_MILLIONS === "\\N") ? "0" : row.AWARDS_MONTHLY_MILLIONS,
        activeContracts: parseInt(row.ACTIVE_CONTRACT_COUNT) || 0,
        pipelineValue: (!row.ACTIVE_PIPELINE_MILLIONS || row.ACTIVE_PIPELINE_MILLIONS === "\\N") ? "0" : row.ACTIVE_PIPELINE_MILLIONS,
        activityStatus: (!row.ACTIVITY_CLASSIFICATION || row.ACTIVITY_CLASSIFICATION === "\\N") ? null : row.ACTIVITY_CLASSIFICATION,
        primaryAgency: (!row.AWARDING_AGENCY_NAME || row.AWARDING_AGENCY_NAME === "\\N") ? null : row.AWARDING_AGENCY_NAME,
      };
      
      batch.push(record);
      
      if (batch.length >= BATCH_SIZE) {
        stream.pause();
        
        try {
          await db
            .insert(contractorMetricsMonthly)
            .values(batch)
            .onConflictDoNothing();
          
          count += batch.length;
          if (count % 5000 === 0) {
            console.log(`    ${count} records...`);
          }
          batch = [];
        } catch (error) {
          console.error("Batch error:", error);
        }
        
        stream.resume();
      }
    });

    stream.on("end", async () => {
      if (batch.length > 0) {
        try {
          await db
            .insert(contractorMetricsMonthly)
            .values(batch)
            .onConflictDoNothing();
          
          count += batch.length;
        } catch (error) {
          console.error("Final batch error:", error);
        }
      }
      
      console.log(`  ✅ Loaded ${count} records from this file`);
      resolve(count);
    });

    stream.on("error", reject);
  });
}

async function main() {
  console.log("Simple ETL Loader");
  console.log("=================\n");
  
  // Load universe first
  console.log("Step 1: Loading contractor universe");
  try {
    await loadUniverse();
  } catch (error) {
    console.error("Failed to load universe:", error);
  }
  
  // Load one metrics file as a test
  console.log("\nStep 2: Loading contractor metrics (test with one file)");
  try {
    await loadOneMetricsFile("data/snowflake-staging/full_contractor_metrics_monthly/data_0_0_0.csv.gz");
  } catch (error) {
    console.error("Failed to load metrics:", error);
  }
  
  // Check results
  console.log("\n=== Results ===");
  const universeCount = await db.select({ count: sql<number>`count(*)` })
    .from(contractorUniverse);
  const metricsCount = await db.select({ count: sql<number>`count(*)` })
    .from(contractorMetricsMonthly);
  
  console.log("Contractor Universe:", universeCount[0].count);
  console.log("Contractor Metrics Monthly:", metricsCount[0].count);
  
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});