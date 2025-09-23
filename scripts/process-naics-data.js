#!/usr/bin/env node

/**
 * Convert NAICS/PSC CSV data to JSON format for frontend consumption
 */

const fs = require('fs');
const path = require('path');

const csvFilePath = path.join(__dirname, '../business_logic_documents/psc_naics_list.csv');
const outputPath = path.join(__dirname, '../apps/ui/src/data/naics-psc-mappings.json');

function csvToJson(csvFilePath) {
  try {
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');

    const jsonData = [];

    for (let i = 1; i < lines.length; i++) {
      const values = [];
      let currentValue = '';
      let insideQuotes = false;

      // Parse CSV handling quoted fields
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];

        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim()); // Add last value

      if (values.length === headers.length) {
        const record = {};
        headers.forEach((header, index) => {
          record[header.trim()] = values[index];
        });
        jsonData.push(record);
      }
    }

    return jsonData;
  } catch (error) {
    console.error('Error reading CSV file:', error);
    return [];
  }
}

function createNAICSMappings(data) {
  const naicsMappings = new Map();
  const pscMappings = new Map();

  data.forEach(record => {
    // Create NAICS mapping entries for all specificity levels
    for (let level = 2; level <= 6; level++) {
      const naicsCode = record[`naics_${level}_char`];
      if (naicsCode && naicsCode.trim()) {
        if (!naicsMappings.has(naicsCode)) {
          naicsMappings.set(naicsCode, {
            naics_2_char: record.naics_2_char,
            naics_2_description: record.naics_2_description,
            naics_3_char: record.naics_3_char,
            naics_3_description: record.naics_3_description,
            naics_4_char: record.naics_4_char,
            naics_4_description: record.naics_4_description,
            naics_5_char: record.naics_5_char,
            naics_5_description: record.naics_5_description,
            naics_6_char: record.naics_6_char,
            naics_6_description: record.naics_6_description,
            keywords: record.keywords ? record.keywords.split(',').map(k => k.trim()) : [],
            pscMappings: []
          });
        }

        // Add PSC mapping to NAICS entry
        const pscMapping = {
          psc_2_char: record.psc_2_char,
          psc_2_char_description: record.psc_2_char_description,
          psc_3_char: record.psc_3_char,
          psc_3_char_description: record.psc_3_char_description,
          psc_4_char: record.psc_4_char,
          psc_4_char_description: record.psc_4_char_description
        };

        naicsMappings.get(naicsCode).pscMappings.push(pscMapping);
      }
    }

    // Create PSC mapping entries
    for (let level = 2; level <= 4; level++) {
      const pscCode = record[`psc_${level}_char`];
      if (pscCode && pscCode.trim()) {
        if (!pscMappings.has(pscCode)) {
          pscMappings.set(pscCode, {
            psc_2_char: record.psc_2_char,
            psc_2_char_description: record.psc_2_char_description,
            psc_3_char: record.psc_3_char,
            psc_3_char_description: record.psc_3_char_description,
            psc_4_char: record.psc_4_char,
            psc_4_char_description: record.psc_4_char_description,
            naicsCode: record.naics_6_char || record.naics_5_char || record.naics_4_char,
            keywords: record.keywords ? record.keywords.split(',').map(k => k.trim()) : []
          });
        }
      }
    }
  });

  return {
    naicsMappings: Object.fromEntries(naicsMappings),
    pscMappings: Object.fromEntries(pscMappings)
  };
}

function main() {
  console.log('Processing NAICS/PSC CSV data...');

  // Create output directory if it doesn't exist
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Convert CSV to JSON
  const rawData = csvToJson(csvFilePath);
  console.log(`Loaded ${rawData.length} records from CSV`);

  // Create structured mappings
  const mappings = createNAICSMappings(rawData);
  console.log(`Created ${Object.keys(mappings.naicsMappings).length} NAICS mappings`);
  console.log(`Created ${Object.keys(mappings.pscMappings).length} PSC mappings`);

  // Write to output file
  fs.writeFileSync(outputPath, JSON.stringify(mappings, null, 2));
  console.log(`✅ Data written to: ${outputPath}`);

  // Generate summary statistics
  console.log('\n📊 Summary Statistics:');
  console.log(`- Total NAICS codes: ${Object.keys(mappings.naicsMappings).length}`);
  console.log(`- Total PSC codes: ${Object.keys(mappings.pscMappings).length}`);
  console.log(`- Original CSV records: ${rawData.length}`);
}

if (require.main === module) {
  main();
}

module.exports = { csvToJson, createNAICSMappings };