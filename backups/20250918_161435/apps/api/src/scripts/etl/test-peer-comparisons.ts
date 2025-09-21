#!/usr/bin/env bun

import { createReadStream } from "fs";
import { createGunzip } from "zlib";
import { parse } from "csv-parse";

const file = "data/snowflake-staging/peer_comparisons_monthly/data_0_0_0.csv.gz";

console.log("Testing peer comparisons data...");

let count = 0;
const stream = createReadStream(file)
  .pipe(createGunzip())
  .pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: false,
      to_line: 5, // Just first few rows
    })
  );

stream.on("data", (row) => {
  count++;
  console.log(`\n=== Row ${count} ===`);
  console.log("RECIPIENT_UEI:", row.RECIPIENT_UEI);
  console.log("RECIPIENT_NAME:", row.RECIPIENT_NAME);
  console.log("SNAPSHOT_MONTH:", row.SNAPSHOT_MONTH);
  console.log("PEER_NAICS_CODE:", row.PEER_NAICS_CODE);
  console.log("PEER_GROUP_SIZE:", row.PEER_GROUP_SIZE);
  console.log("REVENUE_SCORE:", row.REVENUE_SCORE);
  console.log("REVENUE_RANK:", row.REVENUE_RANK);
  console.log("GROWTH_SCORE:", row.GROWTH_SCORE);
  console.log("GROWTH_RANK:", row.GROWTH_RANK);
  console.log("COMPOSITE_SCORE:", row.COMPOSITE_SCORE);
  console.log("PERFORMANCE_CLASSIFICATION:", row.PERFORMANCE_CLASSIFICATION);
  console.log("SIZE_QUARTILE:", row.SIZE_QUARTILE);
});

stream.on("end", () => {
  console.log(`\nTotal rows processed: ${count}`);
  process.exit(0);
});

stream.on("error", (error) => {
  console.error("Error:", error);
  process.exit(1);
});