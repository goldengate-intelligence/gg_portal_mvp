#!/usr/bin/env bun

import { createReadStream } from "fs";
import { createGunzip } from "zlib";
import { parse } from "csv-parse";

const testFile = "data/snowflake-staging/full_contractor_metrics_monthly/data_0_0_0.csv.gz";

console.log("Testing date parsing from CSV...");

const stream = createReadStream(testFile)
  .pipe(createGunzip())
  .pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: false, // Don't auto-cast
      to_line: 5, // Just read first 5 lines
    })
  );

stream.on("data", (row) => {
  console.log("\n--- Row ---");
  console.log("SNAPSHOT_MONTH raw:", row.SNAPSHOT_MONTH);
  console.log("Type:", typeof row.SNAPSHOT_MONTH);
  
  // Try different parsing approaches
  try {
    const date1 = new Date(row.SNAPSHOT_MONTH);
    console.log("new Date():", date1, "Valid:", !isNaN(date1.getTime()));
  } catch (e) {
    console.log("new Date() error:", e.message);
  }
  
  // Check if it's a string that needs trimming
  if (row.SNAPSHOT_MONTH) {
    const trimmed = row.SNAPSHOT_MONTH.trim();
    console.log("Trimmed:", trimmed, "Length:", trimmed.length);
    
    // Check for quotes
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      const unquoted = trimmed.slice(1, -1);
      console.log("Unquoted:", unquoted);
      const date2 = new Date(unquoted);
      console.log("Date from unquoted:", date2, "Valid:", !isNaN(date2.getTime()));
    }
  }
});

stream.on("end", () => {
  console.log("\nTest complete");
  process.exit(0);
});

stream.on("error", (error) => {
  console.error("Error:", error);
  process.exit(1);
});