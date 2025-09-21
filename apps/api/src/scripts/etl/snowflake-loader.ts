#!/usr/bin/env bun

import { createReadStream } from "fs";
import { createGunzip } from "zlib";
import { parse } from "csv-parse";
import { db } from "../../db";
import {
  contractorMetricsMonthly,
  peerComparisonsMonthly,
  portfolioBreakdownsMonthly,
  subcontractorMetricsMonthly,
  contractorNetworkMetrics,
  contractorUniverse,
  contractorSearchIndex,
  contractorEtlMetadata,
} from "../../db/schema/contractor-metrics";
import { sql } from "drizzle-orm";
import path from "path";
import { glob } from "glob";

const BATCH_SIZE = 1000;
const DATA_DIR = path.join(process.cwd(), "data/snowflake-staging");

interface LoadProgress {
  tableName: string;
  totalProcessed: number;
  totalInserted: number;
  totalUpdated: number;
  totalSkipped: number;
  totalFailed: number;
  errors: string[];
}

async function loadCsvFile(
  filePath: string,
  processor: (row: any) => Promise<any>,
  tableName: string
): Promise<LoadProgress> {
  const progress: LoadProgress = {
    tableName,
    totalProcessed: 0,
    totalInserted: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    totalFailed: 0,
    errors: [],
  };

  const batch: any[] = [];
  
  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath)
      .pipe(createGunzip())
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
          cast: true,
          cast_date: true,
        })
      );

    stream.on("data", async (row) => {
      batch.push(row);
      
      if (batch.length >= BATCH_SIZE) {
        stream.pause();
        const processBatch = [...batch];
        batch.length = 0;
        
        try {
          await processor(processBatch);
          progress.totalProcessed += processBatch.length;
          progress.totalInserted += processBatch.length;
        } catch (error) {
          progress.totalFailed += processBatch.length;
          progress.errors.push(`Batch error: ${error}`);
        }
        
        stream.resume();
      }
    });

    stream.on("end", async () => {
      if (batch.length > 0) {
        try {
          await processor(batch);
          progress.totalProcessed += batch.length;
          progress.totalInserted += batch.length;
        } catch (error) {
          progress.totalFailed += batch.length;
          progress.errors.push(`Final batch error: ${error}`);
        }
      }
      resolve(progress);
    });

    stream.on("error", (error) => {
      progress.errors.push(`Stream error: ${error}`);
      reject(error);
    });
  });
}

async function loadContractorMetricsMonthly() {
  console.log("Loading contractor metrics monthly data...");
  
  const files = await glob(`${DATA_DIR}/full_contractor_metrics_monthly/*.csv.gz`);
  let totalProgress: LoadProgress = {
    tableName: "contractor_metrics_monthly",
    totalProcessed: 0,
    totalInserted: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    totalFailed: 0,
    errors: [],
  };

  for (const file of files) {
    console.log(`Processing ${path.basename(file)}...`);
    
    const progress = await loadCsvFile(
      file,
      async (batch) => {
        const records = batch.map((row) => ({
          contractorUei: row.RECIPIENT_UEI,
          contractorName: row.RECIPIENT_NAME,
          monthYear: new Date(row.SNAPSHOT_MONTH),
          fiscalYear: null, // Not in CSV, derive if needed
          fiscalQuarter: null, // Not in CSV, derive if needed
          monthlyRevenue: row.REVENUE_MONTHLY_MILLIONS || "0",
          monthlyAwards: row.AWARDS_MONTHLY_MILLIONS || "0",
          monthlyContracts: parseInt(row.ACTIVE_CONTRACT_COUNT) || 0,
          activeContracts: parseInt(row.ACTIVE_CONTRACT_COUNT) || 0,
          revenueGrowthMom: null, // Calculate from prior month if needed
          revenueGrowthYoy: row.GROWTH_YOY_REVENUE_TTM_PCT || null,
          contractGrowthMom: null, // Calculate from prior month if needed
          activityStatus: row.ACTIVITY_CLASSIFICATION || null,
          lastActivityDate: row.DAYS_SINCE_LAST_CONTRACT_START ? 
            new Date(Date.now() - (parseInt(row.DAYS_SINCE_LAST_CONTRACT_START) * 86400000)) : null,
          daysInactive: parseInt(row.DAYS_SINCE_LAST_CONTRACT_START) || null,
          pipelineValue: row.ACTIVE_PIPELINE_MILLIONS || "0",
          pipelineCount: null, // Not in CSV
          winRate: null, // Not in CSV
          primaryAgency: row.AWARDING_AGENCY_NAME || null,
          topAgencies: null, // Would need to aggregate
          agencyConcentration: null, // Would need to calculate
          avgContractValue: row.DOLLAR_WEIGHTED_DURATION ? 
            (parseFloat(row.REVENUE_TTM_MILLIONS) / parseInt(row.ACTIVE_CONTRACT_COUNT)) || "0" : "0",
          medianContractValue: null, // Not in CSV
          contractSizeDistribution: null, // Not in CSV
        }));

        await db
          .insert(contractorMetricsMonthly)
          .values(records)
          .onConflictDoUpdate({
            target: [contractorMetricsMonthly.contractorUei, contractorMetricsMonthly.monthYear],
            set: {
              monthlyRevenue: sql`EXCLUDED.monthly_revenue`,
              monthlyAwards: sql`EXCLUDED.monthly_awards`,
              monthlyContracts: sql`EXCLUDED.monthly_contracts`,
              activeContracts: sql`EXCLUDED.active_contracts`,
              revenueGrowthMom: sql`EXCLUDED.revenue_growth_mom`,
              revenueGrowthYoy: sql`EXCLUDED.revenue_growth_yoy`,
              activityStatus: sql`EXCLUDED.activity_status`,
              winRate: sql`EXCLUDED.win_rate`,
              avgContractValue: sql`EXCLUDED.avg_contract_value`,
              updatedAt: sql`NOW()`,
            },
          });
      },
      "contractor_metrics_monthly"
    );

    totalProgress.totalProcessed += progress.totalProcessed;
    totalProgress.totalInserted += progress.totalInserted;
    totalProgress.totalFailed += progress.totalFailed;
    totalProgress.errors.push(...progress.errors);
  }

  return totalProgress;
}

async function loadPeerComparisonsMonthly() {
  console.log("Loading peer comparisons monthly data...");
  
  const files = await glob(`${DATA_DIR}/peer_comparisons_monthly/*.csv.gz`);
  let totalProgress: LoadProgress = {
    tableName: "peer_comparisons_monthly",
    totalProcessed: 0,
    totalInserted: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    totalFailed: 0,
    errors: [],
  };

  for (const file of files) {
    console.log(`Processing ${path.basename(file)}...`);
    
    const progress = await loadCsvFile(
      file,
      async (batch) => {
        const records = batch.map((row) => ({
          contractorUei: row.contractor_uei || row.uei,
          contractorName: row.contractor_name || row.legal_business_name,
          monthYear: new Date(row.month_year || row.month),
          peerGroup: row.peer_group || row.peer_group_name || "default",
          peerGroupSize: parseInt(row.peer_group_size) || null,
          peerGroupCriteria: row.peer_group_criteria ? 
            JSON.parse(row.peer_group_criteria) : null,
          revenuePercentile: parseInt(row.revenue_percentile) || null,
          revenueRank: parseInt(row.revenue_rank) || null,
          revenueQuartile: parseInt(row.revenue_quartile) || null,
          growthPercentile: parseInt(row.growth_percentile) || null,
          growthRank: parseInt(row.growth_rank) || null,
          growthQuartile: parseInt(row.growth_quartile) || null,
          contractCountPercentile: parseInt(row.contract_count_percentile) || null,
          contractCountRank: parseInt(row.contract_count_rank) || null,
          winRatePercentile: parseInt(row.win_rate_percentile) || null,
          winRateRank: parseInt(row.win_rate_rank) || null,
          overallPerformanceScore: parseInt(row.overall_performance_score) || 
            parseInt(row.performance_score) || null,
          competitivePositioning: row.competitive_positioning || row.positioning || null,
          peerMedianRevenue: row.peer_median_revenue || "0",
          peerAvgRevenue: row.peer_avg_revenue || "0",
          peerTopQuartileRevenue: row.peer_top_quartile_revenue || "0",
          percentileChange: parseInt(row.percentile_change) || null,
          trendDirection: row.trend_direction || row.trend || null,
          calculatedAt: row.calculated_at ? new Date(row.calculated_at) : null,
        }));

        await db
          .insert(peerComparisonsMonthly)
          .values(records)
          .onConflictDoUpdate({
            target: [
              peerComparisonsMonthly.contractorUei,
              peerComparisonsMonthly.peerGroup,
              peerComparisonsMonthly.monthYear,
            ],
            set: {
              revenuePercentile: sql`EXCLUDED.revenue_percentile`,
              revenueRank: sql`EXCLUDED.revenue_rank`,
              growthPercentile: sql`EXCLUDED.growth_percentile`,
              overallPerformanceScore: sql`EXCLUDED.overall_performance_score`,
              competitivePositioning: sql`EXCLUDED.competitive_positioning`,
              trendDirection: sql`EXCLUDED.trend_direction`,
              importedAt: sql`NOW()`,
            },
          });
      },
      "peer_comparisons_monthly"
    );

    totalProgress.totalProcessed += progress.totalProcessed;
    totalProgress.totalInserted += progress.totalInserted;
    totalProgress.totalFailed += progress.totalFailed;
    totalProgress.errors.push(...progress.errors);
  }

  return totalProgress;
}

async function loadPortfolioBreakdownsMonthly() {
  console.log("Loading portfolio breakdowns monthly data...");
  
  const files = await glob(`${DATA_DIR}/portfolio_breakdowns_monthly/*.csv.gz`);
  let totalProgress: LoadProgress = {
    tableName: "portfolio_breakdowns_monthly",
    totalProcessed: 0,
    totalInserted: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    totalFailed: 0,
    errors: [],
  };

  for (const file of files) {
    console.log(`Processing ${path.basename(file)}...`);
    
    const progress = await loadCsvFile(
      file,
      async (batch) => {
        const records = batch.map((row) => ({
          contractorUei: row.contractor_uei || row.uei,
          contractorName: row.contractor_name || row.legal_business_name,
          monthYear: new Date(row.month_year || row.month),
          topAgencies: row.top_agencies ? JSON.parse(row.top_agencies) : null,
          agencyHhi: row.agency_hhi || row.agency_concentration || null,
          agencyCount: parseInt(row.agency_count) || null,
          primaryAgencyRevenue: row.primary_agency_revenue || "0",
          primaryAgencyPercentage: row.primary_agency_percentage || row.primary_agency_pct || null,
          topNaics: row.top_naics ? JSON.parse(row.top_naics) : null,
          naicsHhi: row.naics_hhi || row.naics_concentration || null,
          naicsCount: parseInt(row.naics_count) || null,
          primaryNaicsRevenue: row.primary_naics_revenue || "0",
          primaryNaicsPercentage: row.primary_naics_percentage || row.primary_naics_pct || null,
          topPsc: row.top_psc ? JSON.parse(row.top_psc) : null,
          pscHhi: row.psc_hhi || row.psc_concentration || null,
          pscCount: parseInt(row.psc_count) || null,
          contractTypeDistribution: row.contract_type_distribution ? 
            JSON.parse(row.contract_type_distribution) : null,
          concentrationRiskScore: parseInt(row.concentration_risk_score) || 
            parseInt(row.risk_score) || null,
          diversificationScore: parseInt(row.diversification_score) || null,
          portfolioStability: row.portfolio_stability || row.stability || null,
          expansionOpportunities: row.expansion_opportunities ? 
            JSON.parse(row.expansion_opportunities) : null,
          calculatedAt: row.calculated_at ? new Date(row.calculated_at) : null,
        }));

        await db
          .insert(portfolioBreakdownsMonthly)
          .values(records)
          .onConflictDoUpdate({
            target: [
              portfolioBreakdownsMonthly.contractorUei,
              portfolioBreakdownsMonthly.monthYear,
            ],
            set: {
              topAgencies: sql`EXCLUDED.top_agencies`,
              agencyHhi: sql`EXCLUDED.agency_hhi`,
              topNaics: sql`EXCLUDED.top_naics`,
              naicsHhi: sql`EXCLUDED.naics_hhi`,
              topPsc: sql`EXCLUDED.top_psc`,
              pscHhi: sql`EXCLUDED.psc_hhi`,
              concentrationRiskScore: sql`EXCLUDED.concentration_risk_score`,
              diversificationScore: sql`EXCLUDED.diversification_score`,
              importedAt: sql`NOW()`,
            },
          });
      },
      "portfolio_breakdowns_monthly"
    );

    totalProgress.totalProcessed += progress.totalProcessed;
    totalProgress.totalInserted += progress.totalInserted;
    totalProgress.totalFailed += progress.totalFailed;
    totalProgress.errors.push(...progress.errors);
  }

  return totalProgress;
}

async function loadSubcontractorMetricsMonthly() {
  console.log("Loading subcontractor metrics monthly data...");
  
  const files = await glob(`${DATA_DIR}/full_subcontractor_metrics_monthly/*.csv.gz`);
  let totalProgress: LoadProgress = {
    tableName: "subcontractor_metrics_monthly",
    totalProcessed: 0,
    totalInserted: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    totalFailed: 0,
    errors: [],
  };

  for (const file of files) {
    console.log(`Processing ${path.basename(file)}...`);
    
    const progress = await loadCsvFile(
      file,
      async (batch) => {
        const records = batch.map((row) => ({
          subcontractorUei: row.subcontractor_uei || row.sub_uei || row.uei,
          subcontractorName: row.subcontractor_name || row.sub_name || row.legal_business_name,
          monthYear: new Date(row.month_year || row.month),
          monthlySubcontractRevenue: row.monthly_subcontract_revenue || 
            row.subcontract_revenue || row.revenue || "0",
          monthlySubcontracts: parseInt(row.monthly_subcontracts) || 
            parseInt(row.subcontract_count) || 0,
          activeSubcontracts: parseInt(row.active_subcontracts) || 0,
          uniquePrimes: parseInt(row.unique_primes) || parseInt(row.prime_count) || 0,
          topPrimes: row.top_primes ? JSON.parse(row.top_primes) : null,
          avgSubcontractValue: row.avg_subcontract_value || row.avg_value || "0",
          subcontractWinRate: row.subcontract_win_rate || row.win_rate || null,
          primeToSubRatio: row.prime_to_sub_ratio || null,
          subRevenueGrowthMom: row.sub_revenue_growth_mom || row.growth_mom || null,
          subRevenueGrowthYoy: row.sub_revenue_growth_yoy || row.growth_yoy || null,
        }));

        await db
          .insert(subcontractorMetricsMonthly)
          .values(records)
          .onConflictDoUpdate({
            target: [
              subcontractorMetricsMonthly.subcontractorUei,
              subcontractorMetricsMonthly.monthYear,
            ],
            set: {
              monthlySubcontractRevenue: sql`EXCLUDED.monthly_subcontract_revenue`,
              monthlySubcontracts: sql`EXCLUDED.monthly_subcontracts`,
              activeSubcontracts: sql`EXCLUDED.active_subcontracts`,
              uniquePrimes: sql`EXCLUDED.unique_primes`,
              topPrimes: sql`EXCLUDED.top_primes`,
              avgSubcontractValue: sql`EXCLUDED.avg_subcontract_value`,
              subcontractWinRate: sql`EXCLUDED.subcontract_win_rate`,
              importedAt: sql`NOW()`,
            },
          });
      },
      "subcontractor_metrics_monthly"
    );

    totalProgress.totalProcessed += progress.totalProcessed;
    totalProgress.totalInserted += progress.totalInserted;
    totalProgress.totalFailed += progress.totalFailed;
    totalProgress.errors.push(...progress.errors);
  }

  return totalProgress;
}

async function loadContractorNetworkMetrics() {
  console.log("Loading contractor network metrics data...");
  
  const files = await glob(`${DATA_DIR}/subcontractor_network_metrics_monthly/*.csv.gz`);
  let totalProgress: LoadProgress = {
    tableName: "contractor_network_metrics",
    totalProcessed: 0,
    totalInserted: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    totalFailed: 0,
    errors: [],
  };

  for (const file of files) {
    console.log(`Processing ${path.basename(file)}...`);
    
    const progress = await loadCsvFile(
      file,
      async (batch) => {
        const records = batch.map((row) => ({
          primeUei: row.prime_uei || row.prime_contractor_uei,
          primeName: row.prime_name || row.prime_contractor_name,
          subUei: row.sub_uei || row.subcontractor_uei,
          subName: row.sub_name || row.subcontractor_name,
          monthYear: new Date(row.month_year || row.month),
          monthlySharedRevenue: row.monthly_shared_revenue || row.shared_revenue || "0",
          monthlySharedContracts: parseInt(row.monthly_shared_contracts) || 
            parseInt(row.shared_contracts) || 0,
          totalHistoricalRevenue: row.total_historical_revenue || row.total_revenue || "0",
          totalHistoricalContracts: parseInt(row.total_historical_contracts) || 
            parseInt(row.total_contracts) || 0,
          relationshipDuration: parseInt(row.relationship_duration_months) || 
            parseInt(row.duration_months) || null,
          relationshipStrengthScore: parseInt(row.relationship_strength_score) || 
            parseInt(row.strength_score) || null,
          collaborationFrequency: row.collaboration_frequency || row.frequency || null,
          primeNetworkSize: parseInt(row.prime_network_size) || null,
          subNetworkSize: parseInt(row.sub_network_size) || null,
          exclusivityScore: row.exclusivity_score || null,
          jointWinRate: row.joint_win_rate || row.win_rate || null,
          avgContractSize: row.avg_contract_size || row.avg_size || "0",
          firstCollaborationDate: row.first_collaboration_date ? 
            new Date(row.first_collaboration_date) : null,
          lastCollaborationDate: row.last_collaboration_date ? 
            new Date(row.last_collaboration_date) : null,
          isActive: row.is_active === true || row.is_active === "true" || 
            row.is_active === "1" || row.active === true,
        }));

        await db
          .insert(contractorNetworkMetrics)
          .values(records)
          .onConflictDoUpdate({
            target: [
              contractorNetworkMetrics.primeUei,
              contractorNetworkMetrics.subUei,
              contractorNetworkMetrics.monthYear,
            ],
            set: {
              monthlySharedRevenue: sql`EXCLUDED.monthly_shared_revenue`,
              monthlySharedContracts: sql`EXCLUDED.monthly_shared_contracts`,
              totalHistoricalRevenue: sql`EXCLUDED.total_historical_revenue`,
              totalHistoricalContracts: sql`EXCLUDED.total_historical_contracts`,
              relationshipStrengthScore: sql`EXCLUDED.relationship_strength_score`,
              jointWinRate: sql`EXCLUDED.joint_win_rate`,
              isActive: sql`EXCLUDED.is_active`,
              importedAt: sql`NOW()`,
            },
          });
      },
      "contractor_network_metrics"
    );

    totalProgress.totalProcessed += progress.totalProcessed;
    totalProgress.totalInserted += progress.totalInserted;
    totalProgress.totalFailed += progress.totalFailed;
    totalProgress.errors.push(...progress.errors);
  }

  return totalProgress;
}

async function loadContractorUniverse() {
  console.log("Loading contractor universe data...");
  
  const file = `${DATA_DIR}/full_contractor_universe.csv.gz`;
  
  return await loadCsvFile(
    file,
    async (batch) => {
      const records = batch.map((row) => ({
        uei: row.RECIPIENT_UEI,
        legalBusinessName: row.RECIPIENT_NAME,
        dbaName: null, // Not in this CSV
        registrationStatus: row.DATA_QUALITY_FLAG === "REVENUE_ANOMALY" ? "needs_review" : "active",
        registrationDate: null, // Not in CSV
        expirationDate: null, // Not in CSV
        lastUpdatedDate: row.LAST_UPDATED ? new Date(row.LAST_UPDATED) : null,
        entityType: row.ENTITY_TYPE || null, // HYBRID, PRIME, SUB
        organizationStructure: null, // Not in CSV
        stateOfIncorporation: null, // Not in CSV
        countryOfIncorporation: null, // Not in CSV
        physicalAddress: null, // Not in CSV
        mailingAddress: null, // Not in CSV
        businessTypes: null, // Not in CSV
        primaryNaics: null, // Not in CSV
        allNaicsCodes: null, // Not in CSV
        cageCode: null, // Not in CSV
        dunsBumber: null, // Not in CSV
        samRegistered: null, // Not in CSV
        samExpirationDate: null, // Not in CSV
        firstContractDate: null, // Could derive from lifetime data
        lastContractDate: null, // Could derive from TTM data
        lifetimeContracts: null, // Not directly in CSV
        lifetimeRevenue: row.TOTAL_REVENUE_LIFETIME_MILLIONS || "0",
        isActive: row.HAS_PRIME_ACTIVITY === "true" || row.HAS_SUB_ACTIVITY === "true",
        isPrime: row.HAS_PRIME_ACTIVITY === "true",
        isSubcontractor: row.HAS_SUB_ACTIVITY === "true",
        isHybrid: row.ENTITY_TYPE === "HYBRID",
      }));

      await db
        .insert(contractorUniverse)
        .values(records)
        .onConflictDoUpdate({
          target: contractorUniverse.uei,
          set: {
            legalBusinessName: sql`EXCLUDED.legal_business_name`,
            registrationStatus: sql`EXCLUDED.registration_status`,
            lastUpdatedDate: sql`EXCLUDED.last_updated_date`,
            samRegistered: sql`EXCLUDED.sam_registered`,
            samExpirationDate: sql`EXCLUDED.sam_expiration_date`,
            lastContractDate: sql`EXCLUDED.last_contract_date`,
            lifetimeContracts: sql`EXCLUDED.lifetime_contracts`,
            lifetimeRevenue: sql`EXCLUDED.lifetime_revenue`,
            isActive: sql`EXCLUDED.is_active`,
            isPrime: sql`EXCLUDED.is_prime`,
            isSubcontractor: sql`EXCLUDED.is_subcontractor`,
            isHybrid: sql`EXCLUDED.is_hybrid`,
            updatedAt: sql`NOW()`,
          },
        });
    },
    "contractor_universe"
  );
}

async function loadSearchIndex() {
  console.log("Loading search index data...");
  
  const files = await glob(`${DATA_DIR}/iceberg_search_union/*.csv.gz`);
  let totalProgress: LoadProgress = {
    tableName: "contractor_search_index",
    totalProcessed: 0,
    totalInserted: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    totalFailed: 0,
    errors: [],
  };

  for (const file of files) {
    console.log(`Processing ${path.basename(file)}...`);
    
    const progress = await loadCsvFile(
      file,
      async (batch) => {
        const records = batch.map((row) => ({
          entityUei: row.entity_uei || row.uei,
          entityType: row.entity_type || "contractor",
          searchableName: row.searchable_name || row.name || row.contractor_name,
          displayName: row.display_name || row.name || row.contractor_name,
          alternateNames: row.alternate_names ? JSON.parse(row.alternate_names) : null,
          searchVector: row.search_vector || null,
          searchTags: row.search_tags ? JSON.parse(row.search_tags) : null,
          searchKeywords: row.search_keywords ? JSON.parse(row.search_keywords) : null,
          primaryIndustry: row.primary_industry || row.industry || null,
          primaryAgency: row.primary_agency || row.agency || null,
          location: row.location ? JSON.parse(row.location) : null,
          relevanceScore: parseInt(row.relevance_score) || null,
          activityScore: parseInt(row.activity_score) || null,
          revenueRank: parseInt(row.revenue_rank) || null,
          summary: row.summary ? JSON.parse(row.summary) : null,
          isActive: row.is_active === true || row.is_active === "true" || 
            row.is_active === "1" || row.active === true,
        }));

        await db
          .insert(contractorSearchIndex)
          .values(records)
          .onConflictDoUpdate({
            target: [
              contractorSearchIndex.entityUei,
              contractorSearchIndex.entityType,
            ],
            set: {
              searchableName: sql`EXCLUDED.searchable_name`,
              displayName: sql`EXCLUDED.display_name`,
              alternateNames: sql`EXCLUDED.alternate_names`,
              searchTags: sql`EXCLUDED.search_tags`,
              searchKeywords: sql`EXCLUDED.search_keywords`,
              relevanceScore: sql`EXCLUDED.relevance_score`,
              activityScore: sql`EXCLUDED.activity_score`,
              revenueRank: sql`EXCLUDED.revenue_rank`,
              summary: sql`EXCLUDED.summary`,
              isActive: sql`EXCLUDED.is_active`,
              lastIndexedAt: sql`NOW()`,
            },
          });
      },
      "contractor_search_index"
    );

    totalProgress.totalProcessed += progress.totalProcessed;
    totalProgress.totalInserted += progress.totalInserted;
    totalProgress.totalFailed += progress.totalFailed;
    totalProgress.errors.push(...progress.errors);
  }

  return totalProgress;
}

async function logEtlRun(tableName: string, progress: LoadProgress, startTime: Date) {
  const endTime = new Date();
  const durationMs = endTime.getTime() - startTime.getTime();

  await db.insert(contractorEtlMetadata).values({
    tableName,
    recordsProcessed: progress.totalProcessed,
    recordsInserted: progress.totalInserted,
    recordsUpdated: progress.totalUpdated,
    recordsSkipped: progress.totalSkipped,
    recordsFailed: progress.totalFailed,
    loadStartTime: startTime,
    loadEndTime: endTime,
    loadDurationMs: durationMs,
    loadStatus: progress.totalFailed > 0 ? "completed_with_errors" : "completed",
    errorMessage: progress.errors.length > 0 ? progress.errors.join("\n") : null,
    loadedBy: "snowflake-loader",
    loadType: "full",
  });
}

async function main() {
  console.log("Starting Snowflake data ETL process...");
  console.log(`Data directory: ${DATA_DIR}`);
  
  const tables = [
    { name: "Contractor Universe", loader: loadContractorUniverse },
    { name: "Contractor Metrics Monthly", loader: loadContractorMetricsMonthly },
    { name: "Peer Comparisons Monthly", loader: loadPeerComparisonsMonthly },
    { name: "Portfolio Breakdowns Monthly", loader: loadPortfolioBreakdownsMonthly },
    { name: "Subcontractor Metrics Monthly", loader: loadSubcontractorMetricsMonthly },
    { name: "Contractor Network Metrics", loader: loadContractorNetworkMetrics },
    { name: "Search Index", loader: loadSearchIndex },
  ];

  for (const table of tables) {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`Loading ${table.name}...`);
    console.log(`${"=".repeat(50)}`);
    
    const startTime = new Date();
    
    try {
      const progress = await table.loader();
      await logEtlRun(table.name, progress, startTime);
      
      console.log(`✅ ${table.name} loaded successfully!`);
      console.log(`   Processed: ${progress.totalProcessed}`);
      console.log(`   Inserted: ${progress.totalInserted}`);
      console.log(`   Failed: ${progress.totalFailed}`);
      
      if (progress.errors.length > 0) {
        console.log(`   ⚠️ Errors encountered:`);
        progress.errors.slice(0, 5).forEach((error) => {
          console.log(`      - ${error}`);
        });
      }
    } catch (error) {
      console.error(`❌ Failed to load ${table.name}:`, error);
      
      await logEtlRun(
        table.name,
        {
          tableName: table.name,
          totalProcessed: 0,
          totalInserted: 0,
          totalUpdated: 0,
          totalSkipped: 0,
          totalFailed: 0,
          errors: [`Fatal error: ${error}`],
        },
        startTime
      );
    }
  }
  
  console.log("\n✅ ETL process completed!");
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});