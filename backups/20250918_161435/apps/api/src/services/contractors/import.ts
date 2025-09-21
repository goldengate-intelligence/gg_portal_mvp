import { db } from '../../db';
import { contractorsCache, contractorsCacheStats, type NewContractorCache } from '../../db/schema/contractors-cache';
import { eq, sql } from 'drizzle-orm';
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { Transform } from 'stream';

interface ContractorCSVRow {
  CONTRACTOR_UEI: string;
  CONTRACTOR_NAME: string;
  PRIMARY_AGENCY: string;
  PRIMARY_SUB_AGENCY_CODE: string;
  COUNTRY: string;
  STATE: string;
  CITY: string;
  ZIP_CODE: string;
  PRIMARY_NAICS_CODE: string;
  PRIMARY_NAICS_DESCRIPTION: string;
  INDUSTRY_CLUSTER: string;
  LIFECYCLE_STAGE: string;
  SIZE_TIER: string;
  SIZE_QUARTILE: string;
  PEER_GROUP_REFINED: string;
  TOTAL_CONTRACTS: string;
  TOTAL_OBLIGATED: string;
  AGENCY_DIVERSITY: string;
  LAST_UPDATED: string;
}

export class ContractorImportService {
  private batchSize = 1000;
  private totalProcessed = 0;
  private totalErrors = 0;

  /**
   * Import contractors from CSV file
   */
  async importFromCSV(filePath: string, options?: {
    batchSize?: number;
    truncate?: boolean;
    onProgress?: (processed: number, total: number) => void;
  }): Promise<{
    success: boolean;
    totalProcessed: number;
    totalErrors: number;
    duration: number;
    error?: string;
  }> {
    const startTime = Date.now();
    const batchSize = options?.batchSize || this.batchSize;
    
    try {
      // Update sync status
      await this.updateSyncStatus('syncing');

      // Optionally truncate existing data
      if (options?.truncate) {
        console.log('Truncating existing contractor cache...');
        await db.delete(contractorsCache);
      }

      // Count total rows first (optional, for progress tracking)
      const totalRows = await this.countCSVRows(filePath);
      console.log(`Starting import of ${totalRows} contractors...`);

      // Process CSV in batches
      await this.processCsvInBatches(filePath, batchSize, totalRows, options?.onProgress);

      const duration = Date.now() - startTime;

      // Update statistics
      await this.updateSyncStats({
        totalRecords: this.totalProcessed,
        syncDuration: duration,
        syncStatus: 'completed',
      });

      console.log(`Import completed: ${this.totalProcessed} processed, ${this.totalErrors} errors in ${duration}ms`);

      return {
        success: true,
        totalProcessed: this.totalProcessed,
        totalErrors: this.totalErrors,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      await this.updateSyncStats({
        syncStatus: 'failed',
        syncError: error.message,
        syncDuration: duration,
      });

      console.error('Import failed:', error);
      
      return {
        success: false,
        totalProcessed: this.totalProcessed,
        totalErrors: this.totalErrors,
        duration,
        error: error.message,
      };
    }
  }

  /**
   * Process CSV file in batches
   */
  private async processCsvInBatches(
    filePath: string,
    batchSize: number,
    totalRows: number,
    onProgress?: (processed: number, total: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const batch: NewContractorCache[] = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const processStream = createReadStream(filePath)
        .pipe(parser)
        .pipe(new Transform({
          objectMode: true,
          transform: async (row: ContractorCSVRow, encoding, callback) => {
            try {
              const contractor = this.transformRow(row);
              batch.push(contractor);

              if (batch.length >= batchSize) {
                processStream.pause();
                await this.insertBatch(batch.splice(0));
                
                if (onProgress) {
                  onProgress(this.totalProcessed, totalRows);
                }
                
                processStream.resume();
              }

              callback();
            } catch (error) {
              this.totalErrors++;
              console.error('Error processing row:', error);
              callback();
            }
          },
        }));

      processStream.on('finish', async () => {
        try {
          // Insert remaining batch
          if (batch.length > 0) {
            await this.insertBatch(batch);
          }
          
          if (onProgress) {
            onProgress(this.totalProcessed, totalRows);
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      processStream.on('error', reject);
    });
  }

  /**
   * Transform CSV row to database format
   */
  private transformRow(row: ContractorCSVRow): NewContractorCache {
    return {
      contractorUei: row.CONTRACTOR_UEI,
      contractorName: row.CONTRACTOR_NAME,
      primaryAgency: row.PRIMARY_AGENCY || null,
      primarySubAgencyCode: row.PRIMARY_SUB_AGENCY_CODE || null,
      country: row.COUNTRY || null,
      state: row.STATE || null,
      city: row.CITY || null,
      zipCode: row.ZIP_CODE || null,
      primaryNaicsCode: row.PRIMARY_NAICS_CODE || null,
      primaryNaicsDescription: row.PRIMARY_NAICS_DESCRIPTION || null,
      industryCluster: row.INDUSTRY_CLUSTER || null,
      lifecycleStage: row.LIFECYCLE_STAGE || null,
      sizeTier: row.SIZE_TIER || null,
      sizeQuartile: row.SIZE_QUARTILE || null,
      peerGroupRefined: row.PEER_GROUP_REFINED || null,
      totalContracts: row.TOTAL_CONTRACTS ? parseInt(row.TOTAL_CONTRACTS) : 0,
      totalObligated: row.TOTAL_OBLIGATED || '0',
      agencyDiversity: row.AGENCY_DIVERSITY ? parseInt(row.AGENCY_DIVERSITY) : 0,
      sourceLastUpdated: row.LAST_UPDATED ? new Date(row.LAST_UPDATED) : null,
      isActive: true,
      syncStatus: 'synced',
    };
  }

  /**
   * Insert batch of contractors
   */
  private async insertBatch(batch: NewContractorCache[]): Promise<void> {
    if (batch.length === 0) return;

    try {
      // Use ON CONFLICT to handle duplicates
      await db
        .insert(contractorsCache)
        .values(batch)
        .onConflictDoUpdate({
          target: contractorsCache.contractorUei,
          set: {
            contractorName: sql`EXCLUDED.contractor_name`,
            primaryAgency: sql`EXCLUDED.primary_agency`,
            primarySubAgencyCode: sql`EXCLUDED.primary_sub_agency_code`,
            country: sql`EXCLUDED.country`,
            state: sql`EXCLUDED.state`,
            city: sql`EXCLUDED.city`,
            zipCode: sql`EXCLUDED.zip_code`,
            primaryNaicsCode: sql`EXCLUDED.primary_naics_code`,
            primaryNaicsDescription: sql`EXCLUDED.primary_naics_description`,
            industryCluster: sql`EXCLUDED.industry_cluster`,
            lifecycleStage: sql`EXCLUDED.lifecycle_stage`,
            sizeTier: sql`EXCLUDED.size_tier`,
            sizeQuartile: sql`EXCLUDED.size_quartile`,
            peerGroupRefined: sql`EXCLUDED.peer_group_refined`,
            totalContracts: sql`EXCLUDED.total_contracts`,
            totalObligated: sql`EXCLUDED.total_obligated`,
            agencyDiversity: sql`EXCLUDED.agency_diversity`,
            sourceLastUpdated: sql`EXCLUDED.source_last_updated`,
            cacheUpdatedAt: sql`NOW()`,
          },
        });

      this.totalProcessed += batch.length;
      console.log(`Inserted batch of ${batch.length} contractors. Total: ${this.totalProcessed}`);
    } catch (error) {
      console.error('Error inserting batch:', error);
      this.totalErrors += batch.length;
      throw error;
    }
  }

  /**
   * Count total rows in CSV
   */
  private async countCSVRows(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      let count = 0;
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
      });

      createReadStream(filePath)
        .pipe(parser)
        .on('data', () => count++)
        .on('end', () => resolve(count))
        .on('error', reject);
    });
  }

  /**
   * Update sync status
   */
  private async updateSyncStatus(status: string): Promise<void> {
    await db
      .insert(contractorsCacheStats)
      .values({
        syncStatus: status,
        lastSyncTime: new Date(),
      });
  }

  /**
   * Update sync statistics
   */
  private async updateSyncStats(stats: {
    totalRecords?: number;
    syncDuration?: number;
    syncStatus: string;
    syncError?: string;
  }): Promise<void> {
    await db
      .insert(contractorsCacheStats)
      .values({
        ...stats,
        lastSyncTime: new Date(),
        updatedAt: new Date(),
      });
  }
}

export const contractorImportService = new ContractorImportService();