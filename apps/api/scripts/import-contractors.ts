#!/usr/bin/env bun

import { contractorImportService } from '../src/services/contractors/import';
import path from 'path';

async function importContractors() {
  console.log('🚀 Starting contractor data import...');
  
  const csvPath = path.join(
    process.cwd(),
    '..',
    '..',
    'sample_data',
    'contractors.csv'
  );
  
  console.log(`📁 CSV file path: ${csvPath}`);
  
  const startTime = Date.now();
  
  try {
    const result = await contractorImportService.importFromCSV(csvPath, {
      truncate: true, // Clear existing data first
      batchSize: 1000,
      onProgress: (processed, total) => {
        const percentage = ((processed / total) * 100).toFixed(2);
        console.log(`📊 Progress: ${processed}/${total} (${percentage}%)`);
      },
    });
    
    const duration = (Date.now() - startTime) / 1000;
    
    if (result.success) {
      console.log('✅ Import completed successfully!');
      console.log(`📈 Total processed: ${result.totalProcessed}`);
      console.log(`❌ Total errors: ${result.totalErrors}`);
      console.log(`⏱️ Duration: ${duration.toFixed(2)} seconds`);
      console.log(`🚄 Speed: ${(result.totalProcessed / duration).toFixed(0)} records/second`);
    } else {
      console.error('❌ Import failed:', result.error);
    }
  } catch (error) {
    console.error('💥 Fatal error during import:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the import
importContractors().catch(console.error);