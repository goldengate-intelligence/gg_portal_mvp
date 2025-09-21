#!/usr/bin/env bun

import { createReadStream } from "fs";
import { createGunzip } from "zlib";
import { parse } from "csv-parse";

const file = "data/snowflake-staging/full_contractor_metrics_monthly/data_0_0_0.csv.gz";

console.log("Testing single row parsing...");

const stream = createReadStream(file)
  .pipe(createGunzip())
  .pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: false,
      to_line: 3, // Just first 2 data rows
    })
  );

stream.on("data", (row) => {
  console.log("\n=== RAW ROW ===");
  console.log("SNAPSHOT_MONTH:", row.SNAPSHOT_MONTH);
  console.log("RECIPIENT_UEI:", row.RECIPIENT_UEI);
  console.log("RECIPIENT_NAME:", row.RECIPIENT_NAME);
  console.log("REVENUE_MONTHLY_MILLIONS:", row.REVENUE_MONTHLY_MILLIONS);
  console.log("AWARDS_MONTHLY_MILLIONS:", row.AWARDS_MONTHLY_MILLIONS);
  console.log("ACTIVE_CONTRACT_COUNT:", row.ACTIVE_CONTRACT_COUNT);
  console.log("GROWTH_YOY_REVENUE_TTM_PCT:", row.GROWTH_YOY_REVENUE_TTM_PCT);
  console.log("ACTIVITY_CLASSIFICATION:", row.ACTIVITY_CLASSIFICATION);
  console.log("DAYS_SINCE_LAST_CONTRACT_START:", row.DAYS_SINCE_LAST_CONTRACT_START);
  
  // Test parsing
  console.log("\n=== PARSED VALUES ===");
  const monthYear = new Date(row.SNAPSHOT_MONTH);
  console.log("monthYear:", monthYear, "Valid:", !isNaN(monthYear.getTime()));
  
  // Handle Snowflake NULL values
  const parseDecimal = (val: string) => {
    if (!val || val === "\\N" || val === "\\\\N") return "0";
    return val;
  };
  
  const parseInteger = (val: string) => {
    if (!val || val === "\\N" || val === "\\\\N") return 0;
    return parseInt(val) || 0;
  };
  
  const parseNullableDecimal = (val: string) => {
    if (!val || val === "\\N" || val === "\\\\N") return null;
    return val;
  };
  
  console.log("monthlyRevenue:", parseDecimal(row.REVENUE_MONTHLY_MILLIONS));
  console.log("monthlyAwards:", parseDecimal(row.AWARDS_MONTHLY_MILLIONS));
  console.log("activeContracts:", parseInteger(row.ACTIVE_CONTRACT_COUNT));
  console.log("revenueGrowthYoy:", parseNullableDecimal(row.GROWTH_YOY_REVENUE_TTM_PCT));
  console.log("daysInactive:", row.DAYS_SINCE_LAST_CONTRACT_START === "\\N" ? null : parseInteger(row.DAYS_SINCE_LAST_CONTRACT_START));
});

stream.on("end", () => {
  console.log("\nTest complete");
  process.exit(0);
});

stream.on("error", (error) => {
  console.error("Error:", error);
  process.exit(1);
});