import { db } from '../../db';
import { contractorsCache, contractorsCacheStats } from '../../db/schema/contractors-cache';
import { snowflakeService } from '../snowflake';
import { eq, sql, gt } from 'drizzle-orm';

export interface SyncOptions {
  fullSync?: boolean;
  batchSize?: number;
  sinceDate?: Date;
  tableName?: string;
  schemaName?: string;
}

export class ContractorSyncService {
  private readonly defaultBatchSize = 5000;
  private readonly snowflakeTable = 'CONTRACTORS';
  private readonly snowflakeSchema = 'PUBLIC';

  /**
   * Sync contractors from Snowflake to PostgreSQL cache
   */
  async syncFromSnowflake(options?: SyncOptions): Promise<{
    success: boolean;
    recordsSynced: number;
    duration: number;
    error?: string;
  }> {
    const startTime = Date.now();
    let recordsSynced = 0;

    try {
      console.log('Starting Snowflake sync...');
      await this.updateSyncStatus('syncing');

      const batchSize = options?.batchSize || this.defaultBatchSize;
      const tableName = options?.tableName || this.snowflakeTable;
      const schemaName = options?.schemaName || this.snowflakeSchema;

      // Determine sync strategy
      if (options?.fullSync) {
        recordsSynced = await this.performFullSync(tableName, schemaName, batchSize);
      } else {
        recordsSynced = await this.performIncrementalSync(
          tableName,
          schemaName,
          batchSize,
          options?.sinceDate
        );
      }

      const duration = Date.now() - startTime;

      await this.updateSyncStats({
        totalRecords: recordsSynced,
        syncDuration: duration,
        syncStatus: 'completed',
      });

      console.log(`Sync completed: ${recordsSynced} records in ${duration}ms`);

      return {
        success: true,
        recordsSynced,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      await this.updateSyncStats({
        syncStatus: 'failed',
        syncError: error.message,
        syncDuration: duration,
      });

      console.error('Sync failed:', error);
      
      return {
        success: false,
        recordsSynced,
        duration,
        error: error.message,
      };
    }
  }

  /**
   * Perform full sync - replace all data
   */
  private async performFullSync(
    tableName: string,
    schemaName: string,
    batchSize: number
  ): Promise<number> {
    console.log('Performing full sync...');
    
    // Clear existing cache
    await db.delete(contractorsCache);
    
    let offset = 0;
    let totalSynced = 0;
    let hasMore = true;

    while (hasMore) {
      const query = `
        SELECT 
          CONTRACTOR_UEI,
          CONTRACTOR_NAME,
          PRIMARY_AGENCY,
          PRIMARY_SUB_AGENCY_CODE,
          COUNTRY,
          STATE,
          CITY,
          ZIP_CODE,
          PRIMARY_NAICS_CODE,
          PRIMARY_NAICS_DESCRIPTION,
          INDUSTRY_CLUSTER,
          LIFECYCLE_STAGE,
          SIZE_TIER,
          SIZE_QUARTILE,
          PEER_GROUP_REFINED,
          TOTAL_CONTRACTS,
          TOTAL_OBLIGATED,
          AGENCY_DIVERSITY,
          LAST_UPDATED
        FROM ${schemaName}.${tableName}
        ORDER BY CONTRACTOR_UEI
        LIMIT ${batchSize}
        OFFSET ${offset}
      `;

      const result = await snowflakeService.executor.execute({
        query,
        maxRows: batchSize,
      });

      if (!result.success) {
        throw new Error(`Snowflake query failed: ${result.error}`);
      }

      if (result.rows.length === 0) {
        hasMore = false;
        break;
      }

      await this.insertBatch(result.rows);
      totalSynced += result.rows.length;
      offset += batchSize;

      console.log(`Synced ${totalSynced} records...`);

      // Check if we got less than batch size (last batch)
      if (result.rows.length < batchSize) {
        hasMore = false;
      }
    }

    return totalSynced;
  }

  /**
   * Perform incremental sync - only sync changes
   */
  private async performIncrementalSync(
    tableName: string,
    schemaName: string,
    batchSize: number,
    sinceDate?: Date
  ): Promise<number> {
    console.log('Performing incremental sync...');
    
    // Get last sync time if not provided
    const lastSyncTime = sinceDate || await this.getLastSyncTime();
    
    let offset = 0;
    let totalSynced = 0;
    let hasMore = true;

    while (hasMore) {
      const query = lastSyncTime ? `
        SELECT 
          CONTRACTOR_UEI,
          CONTRACTOR_NAME,
          PRIMARY_AGENCY,
          PRIMARY_SUB_AGENCY_CODE,
          COUNTRY,
          STATE,
          CITY,
          ZIP_CODE,
          PRIMARY_NAICS_CODE,
          PRIMARY_NAICS_DESCRIPTION,
          INDUSTRY_CLUSTER,
          LIFECYCLE_STAGE,
          SIZE_TIER,
          SIZE_QUARTILE,
          PEER_GROUP_REFINED,
          TOTAL_CONTRACTS,
          TOTAL_OBLIGATED,
          AGENCY_DIVERSITY,
          LAST_UPDATED
        FROM ${schemaName}.${tableName}
        WHERE LAST_UPDATED > '${lastSyncTime.toISOString()}'
        ORDER BY LAST_UPDATED, CONTRACTOR_UEI
        LIMIT ${batchSize}
        OFFSET ${offset}
      ` : `
        SELECT 
          CONTRACTOR_UEI,
          CONTRACTOR_NAME,
          PRIMARY_AGENCY,
          PRIMARY_SUB_AGENCY_CODE,
          COUNTRY,
          STATE,
          CITY,
          ZIP_CODE,
          PRIMARY_NAICS_CODE,
          PRIMARY_NAICS_DESCRIPTION,
          INDUSTRY_CLUSTER,
          LIFECYCLE_STAGE,
          SIZE_TIER,
          SIZE_QUARTILE,
          PEER_GROUP_REFINED,
          TOTAL_CONTRACTS,
          TOTAL_OBLIGATED,
          AGENCY_DIVERSITY,
          LAST_UPDATED
        FROM ${schemaName}.${tableName}
        ORDER BY CONTRACTOR_UEI
        LIMIT ${batchSize}
        OFFSET ${offset}
      `;

      const result = await snowflakeService.executor.execute({
        query,
        maxRows: batchSize,
      });

      if (!result.success) {
        throw new Error(`Snowflake query failed: ${result.error}`);
      }

      if (result.rows.length === 0) {
        hasMore = false;
        break;
      }

      await this.upsertBatch(result.rows);
      totalSynced += result.rows.length;
      offset += batchSize;

      console.log(`Synced ${totalSynced} records...`);

      if (result.rows.length < batchSize) {
        hasMore = false;
      }
    }

    return totalSynced;
  }

  /**
   * Insert batch for full sync
   */
  private async insertBatch(rows: any[]): Promise<void> {
    const contractors = rows.map(row => ({
      contractorUei: row.CONTRACTOR_UEI,
      contractorName: row.CONTRACTOR_NAME,
      primaryAgency: row.PRIMARY_AGENCY,
      primarySubAgencyCode: row.PRIMARY_SUB_AGENCY_CODE,
      country: row.COUNTRY,
      state: row.STATE,
      city: row.CITY,
      zipCode: row.ZIP_CODE,
      primaryNaicsCode: row.PRIMARY_NAICS_CODE,
      primaryNaicsDescription: row.PRIMARY_NAICS_DESCRIPTION,
      industryCluster: row.INDUSTRY_CLUSTER,
      lifecycleStage: row.LIFECYCLE_STAGE,
      sizeTier: row.SIZE_TIER,
      sizeQuartile: row.SIZE_QUARTILE,
      peerGroupRefined: row.PEER_GROUP_REFINED,
      totalContracts: row.TOTAL_CONTRACTS ? parseInt(row.TOTAL_CONTRACTS) : 0,
      totalObligated: row.TOTAL_OBLIGATED || '0',
      agencyDiversity: row.AGENCY_DIVERSITY ? parseInt(row.AGENCY_DIVERSITY) : 0,
      sourceLastUpdated: row.LAST_UPDATED ? new Date(row.LAST_UPDATED) : null,
      isActive: true,
      syncStatus: 'synced',
    }));

    await db.insert(contractorsCache).values(contractors);
  }

  /**
   * Upsert batch for incremental sync
   */
  private async upsertBatch(rows: any[]): Promise<void> {
    const contractors = rows.map(row => ({
      contractorUei: row.CONTRACTOR_UEI,
      contractorName: row.CONTRACTOR_NAME,
      primaryAgency: row.PRIMARY_AGENCY,
      primarySubAgencyCode: row.PRIMARY_SUB_AGENCY_CODE,
      country: row.COUNTRY,
      state: row.STATE,
      city: row.CITY,
      zipCode: row.ZIP_CODE,
      primaryNaicsCode: row.PRIMARY_NAICS_CODE,
      primaryNaicsDescription: row.PRIMARY_NAICS_DESCRIPTION,
      industryCluster: row.INDUSTRY_CLUSTER,
      lifecycleStage: row.LIFECYCLE_STAGE,
      sizeTier: row.SIZE_TIER,
      sizeQuartile: row.SIZE_QUARTILE,
      peerGroupRefined: row.PEER_GROUP_REFINED,
      totalContracts: row.TOTAL_CONTRACTS ? parseInt(row.TOTAL_CONTRACTS) : 0,
      totalObligated: row.TOTAL_OBLIGATED || '0',
      agencyDiversity: row.AGENCY_DIVERSITY ? parseInt(row.AGENCY_DIVERSITY) : 0,
      sourceLastUpdated: row.LAST_UPDATED ? new Date(row.LAST_UPDATED) : null,
      isActive: true,
      syncStatus: 'synced',
    }));

    await db
      .insert(contractorsCache)
      .values(contractors)
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
          syncStatus: sql`'synced'`,
        },
      });
  }

  /**
   * Get last successful sync time
   */
  private async getLastSyncTime(): Promise<Date | null> {
    const result = await db
      .select({
        lastSyncTime: contractorsCacheStats.lastSyncTime,
      })
      .from(contractorsCacheStats)
      .where(eq(contractorsCacheStats.syncStatus, 'completed'))
      .orderBy(sql`${contractorsCacheStats.lastSyncTime} DESC`)
      .limit(1);

    return result[0]?.lastSyncTime || null;
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

  /**
   * Schedule automatic sync
   */
  scheduleSync(intervalMs: number = 3600000): NodeJS.Timeout {
    return setInterval(async () => {
      console.log('Running scheduled sync...');
      await this.syncFromSnowflake({ fullSync: false });
    }, intervalMs);
  }
}

export const contractorSyncService = new ContractorSyncService();