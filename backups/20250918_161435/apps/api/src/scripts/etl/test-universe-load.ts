#!/usr/bin/env bun

import { createReadStream } from "fs";
import { createGunzip } from "zlib";
import { parse } from "csv-parse";
import { db } from "../../db";
import { contractorUniverse } from "../../db/schema/contractor-metrics";
import { sql } from "drizzle-orm";

const file = "data/snowflake-staging/full_contractor_universe.csv.gz";

console.log("Testing contractor universe load...");

let count = 0;
const batch: any[] = [];

const stream = createReadStream(file)
  .pipe(createGunzip())
  .pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: false,
      to_line: 10, // Just test first 10 rows
    })
  );

stream.on("data", async (row) => {
  count++;
  console.log(`\nRow ${count}:`);
  console.log("UEI:", row.RECIPIENT_UEI);
  console.log("Name:", row.RECIPIENT_NAME);
  console.log("LAST_UPDATED:", row.LAST_UPDATED);
  console.log("HAS_PRIME_ACTIVITY:", row.HAS_PRIME_ACTIVITY, typeof row.HAS_PRIME_ACTIVITY);
  
  const record = {
    uei: row.RECIPIENT_UEI,
    legalBusinessName: row.RECIPIENT_NAME,
    dbaName: null,
    registrationStatus: row.DATA_QUALITY_FLAG === "REVENUE_ANOMALY" ? "needs_review" : "active",
    registrationDate: null,
    expirationDate: null,
    lastUpdatedDate: row.LAST_UPDATED ? new Date(row.LAST_UPDATED) : null,
    entityType: row.ENTITY_TYPE || null,
    organizationStructure: null,
    stateOfIncorporation: null,
    countryOfIncorporation: null,
    physicalAddress: null,
    mailingAddress: null,
    businessTypes: null,
    primaryNaics: null,
    allNaicsCodes: null,
    cageCode: null,
    dunsBumber: null,
    samRegistered: null,
    samExpirationDate: null,
    firstContractDate: null,
    lastContractDate: null,
    lifetimeContracts: null,
    lifetimeRevenue: row.TOTAL_REVENUE_LIFETIME_MILLIONS || "0",
    isActive: row.HAS_PRIME_ACTIVITY === "true" || row.HAS_SUB_ACTIVITY === "true",
    isPrime: row.HAS_PRIME_ACTIVITY === "true",
    isSubcontractor: row.HAS_SUB_ACTIVITY === "true",
    isHybrid: row.ENTITY_TYPE === "HYBRID",
  };
  
  batch.push(record);
});

stream.on("end", async () => {
  console.log("\nInserting batch of", batch.length, "records...");
  
  try {
    await db
      .insert(contractorUniverse)
      .values(batch)
      .onConflictDoUpdate({
        target: contractorUniverse.uei,
        set: {
          legalBusinessName: sql`EXCLUDED.legal_business_name`,
          registrationStatus: sql`EXCLUDED.registration_status`,
          lastUpdatedDate: sql`EXCLUDED.last_updated_date`,
          entityType: sql`EXCLUDED.entity_type`,
          lifetimeRevenue: sql`EXCLUDED.lifetime_revenue`,
          isActive: sql`EXCLUDED.is_active`,
          isPrime: sql`EXCLUDED.is_prime`,
          isSubcontractor: sql`EXCLUDED.is_subcontractor`,
          isHybrid: sql`EXCLUDED.is_hybrid`,
          updatedAt: sql`NOW()`,
        },
      });
    
    console.log("✅ Success! Inserted/updated", batch.length, "records");
  } catch (error) {
    console.error("❌ Error:", error);
  }
  
  process.exit(0);
});

stream.on("error", (error) => {
  console.error("Stream error:", error);
  process.exit(1);
});