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
  contractorIcebergOpportunities,
  contractorEtlMetadata,
} from "../../db/schema/contractor-metrics";
import { sql } from "drizzle-orm";
import path from "path";
import { glob } from "glob";

const BATCH_SIZE = 100; // Smaller batch for testing
const DATA_DIR = path.join(process.cwd(), "data/snowflake-staging");

// Helper functions for parsing Snowflake NULL values
const parseDecimal = (val: any): string => {
  if (!val || val === "\\N" || val === "\\\\N" || val === "NULL") return "0";
  return String(val);
};

const parseInteger = (val: any): number => {
  if (!val || val === "\\N" || val === "\\\\N" || val === "NULL") return 0;
  const parsed = parseInt(val);
  return isNaN(parsed) ? 0 : parsed;
};

const parseNullableDecimal = (val: any): string | null => {
  if (!val || val === "\\N" || val === "\\\\N" || val === "NULL") return null;
  return String(val);
};

const parseNullableInteger = (val: any): number | null => {
  if (!val || val === "\\N" || val === "\\\\N" || val === "NULL") return null;
  const parsed = parseInt(val);
  return isNaN(parsed) ? null : parsed;
};

const parseBoolean = (val: any): boolean => {
  return val === "true" || val === true || val === "1" || val === 1;
};

interface LoadProgress {
  tableName: string;
  totalProcessed: number;
  totalInserted: number;
  totalUpdated: number;
  totalSkipped: number;
  totalFailed: number;
  errors: string[];
}

// Helper function to calculate HHI from breakdown object
function calculateHHI(breakdown: Record<string, number>): number {
  const values = Object.values(breakdown);
  const total = values.reduce((sum, val) => sum + val, 0);
  if (total === 0) return 0;
  
  const shares = values.map(val => (val / total) * 100);
  return shares.reduce((hhi, share) => hhi + (share * share), 0) / 10000;
}

// Helper to parse JSON breakdown into array format
function parseBreakdown(jsonStr: string, type: 'agency' | 'naics' | 'psc'): any[] {
  try {
    const breakdown = JSON.parse(jsonStr);
    const total = Object.values(breakdown).reduce((sum: number, val: any) => sum + Number(val), 0);
    
    return Object.entries(breakdown)
      .map(([key, value]) => ({
        [type === 'agency' ? 'agency' : type === 'naics' ? 'code' : 'code']: key,
        [type === 'naics' ? 'description' : type === 'psc' ? 'description' : undefined]: key,
        revenue: Number(value),
        percentage: total > 0 ? (Number(value) / total) * 100 : 0
      }))
      .filter(item => item.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3); // Top 3
  } catch {
    return [];
  }
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
          cast: false, // Handle all casting manually
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
          console.log(`  Processed ${progress.totalProcessed} records...`);
        } catch (error) {
          progress.totalFailed += processBatch.length;
          progress.errors.push(`Batch error: ${error}`);
          console.error(`  Error processing batch: ${error}`);
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

export async function loadContractorUniverse() {
  console.log("Loading contractor universe data...");
  
  const file = `${DATA_DIR}/full_contractor_universe.csv.gz`;
  
  return await loadCsvFile(
    file,
    async (batch) => {
      const records = batch.map((row) => ({
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
        lifetimeRevenue: parseDecimal(row.TOTAL_REVENUE_LIFETIME_MILLIONS),
        isActive: parseBoolean(row.HAS_PRIME_ACTIVITY) || parseBoolean(row.HAS_SUB_ACTIVITY),
        isPrime: parseBoolean(row.HAS_PRIME_ACTIVITY),
        isSubcontractor: parseBoolean(row.HAS_SUB_ACTIVITY),
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
            entityType: sql`EXCLUDED.entity_type`,
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

export async function loadContractorMetricsMonthly() {
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
        const records = batch.map((row) => {
          const activeContracts = parseInteger(row.ACTIVE_CONTRACT_COUNT);
          const revenueTTM = parseFloat(parseDecimal(row.REVENUE_TTM_MILLIONS));
          const daysInactive = parseNullableInteger(row.DAYS_SINCE_LAST_CONTRACT_START);
          
          return {
            contractorUei: row.RECIPIENT_UEI,
            contractorName: row.RECIPIENT_NAME,
            monthYear: new Date(row.SNAPSHOT_MONTH),
            fiscalYear: null,
            fiscalQuarter: null,
            monthlyRevenue: parseDecimal(row.REVENUE_MONTHLY_MILLIONS),
            monthlyAwards: parseDecimal(row.AWARDS_MONTHLY_MILLIONS),
            monthlyContracts: activeContracts,
            activeContracts: activeContracts,
            revenueGrowthMom: null,
            revenueGrowthYoy: parseNullableDecimal(row.GROWTH_YOY_REVENUE_TTM_PCT),
            contractGrowthMom: null,
            activityStatus: row.ACTIVITY_CLASSIFICATION === "\\N" ? null : row.ACTIVITY_CLASSIFICATION,
            lastActivityDate: daysInactive ? 
              new Date(Date.now() - (daysInactive * 86400000)) : null,
            daysInactive: daysInactive,
            pipelineValue: parseDecimal(row.ACTIVE_PIPELINE_MILLIONS),
            pipelineCount: null,
            winRate: null,
            primaryAgency: row.AWARDING_AGENCY_NAME === "\\N" ? null : row.AWARDING_AGENCY_NAME,
            topAgencies: null,
            agencyConcentration: null,
            avgContractValue: activeContracts > 0 ? String(revenueTTM / activeContracts) : "0",
            medianContractValue: null,
            contractSizeDistribution: null,
          };
        });

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
              revenueGrowthYoy: sql`EXCLUDED.revenue_growth_yoy`,
              activityStatus: sql`EXCLUDED.activity_status`,
              primaryAgency: sql`EXCLUDED.primary_agency`,
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

export async function loadPeerComparisonsMonthly() {
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
          contractorUei: row.RECIPIENT_UEI,
          contractorName: row.RECIPIENT_NAME,
          monthYear: new Date(row.SNAPSHOT_MONTH),
          peerGroup: row.PEER_NAICS_CODE || "default",
          peerGroupSize: parseInt(row.PEER_GROUP_SIZE) || null,
          peerGroupCriteria: null,
          revenuePercentile: Math.round((parseFloat(row.REVENUE_SCORE) || 0) * 100),
          revenueRank: parseInt(row.REVENUE_RANK) || null,
          revenueQuartile: parseInt(row.SIZE_QUARTILE) || null,
          growthPercentile: Math.round((parseFloat(row.GROWTH_SCORE) || 0) * 100),
          growthRank: parseInt(row.GROWTH_RANK) || null,
          growthQuartile: null,
          contractCountPercentile: null,
          contractCountRank: null,
          winRatePercentile: null,
          winRateRank: null,
          overallPerformanceScore: parseInt(row.COMPOSITE_SCORE) || null,
          competitivePositioning: row.PERFORMANCE_CLASSIFICATION || null,
          peerMedianRevenue: "0",
          peerAvgRevenue: "0",
          peerTopQuartileRevenue: "0",
          percentileChange: null,
          trendDirection: null,
          calculatedAt: row.CREATED_AT ? new Date(row.CREATED_AT) : null,
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

export async function loadPortfolioBreakdownsMonthly() {
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
        const records = batch.map((row) => {
          // Parse the JSON breakdowns
          const agencyBreakdown = row.AGENCY_AWARD_BREAKDOWN ? 
            JSON.parse(row.AGENCY_AWARD_BREAKDOWN) : {};
          const naicsBreakdown = row.NAICS_AWARD_BREAKDOWN ? 
            JSON.parse(row.NAICS_AWARD_BREAKDOWN) : {};
          const pscBreakdown = row.PSC_AWARD_BREAKDOWN ? 
            JSON.parse(row.PSC_AWARD_BREAKDOWN) : {};
          
          // Get top agencies
          const topAgencies = parseBreakdown(row.AGENCY_AWARD_BREAKDOWN || '{}', 'agency');
          const topNaics = parseBreakdown(row.NAICS_AWARD_BREAKDOWN || '{}', 'naics');
          const topPsc = parseBreakdown(row.PSC_AWARD_BREAKDOWN || '{}', 'psc');
          
          // Get primary (top) agency
          const primaryAgency = topAgencies[0];
          
          return {
            contractorUei: row.RECIPIENT_UEI,
            contractorName: row.RECIPIENT_UEI, // Use UEI as name since name not in CSV
            monthYear: new Date(row.SNAPSHOT_MONTH),
            topAgencies: topAgencies.length > 0 ? topAgencies : null,
            agencyHhi: (() => {
              const hhi = calculateHHI(agencyBreakdown);
              return isNaN(hhi) ? null : hhi;
            })(),
            agencyCount: Object.keys(agencyBreakdown).length,
            primaryAgencyRevenue: primaryAgency ? String(primaryAgency.revenue) : "0",
            primaryAgencyPercentage: primaryAgency ? String(primaryAgency.percentage) : "0",
            topNaics: topNaics.length > 0 ? topNaics : null,
            naicsHhi: (() => {
              const hhi = calculateHHI(naicsBreakdown);
              return isNaN(hhi) ? null : hhi;
            })(),
            naicsCount: Object.keys(naicsBreakdown).length,
            primaryNaicsRevenue: topNaics[0] ? String(topNaics[0].revenue) : "0",
            primaryNaicsPercentage: topNaics[0] ? String(topNaics[0].percentage) : "0",
            topPsc: topPsc.length > 0 ? topPsc : null,
            pscHhi: (() => {
              const hhi = calculateHHI(pscBreakdown);
              return isNaN(hhi) ? null : hhi;
            })(),
            pscCount: Object.keys(pscBreakdown).length,
            contractTypeDistribution: null,
            concentrationRiskScore: (() => {
              const hhi = calculateHHI(agencyBreakdown);
              return isNaN(hhi) ? 0 : Math.round(hhi * 100);
            })(),
            diversificationScore: (() => {
              const hhi = calculateHHI(agencyBreakdown);
              return isNaN(hhi) ? 100 : Math.round((1 - hhi) * 100);
            })(),
            portfolioStability: (() => {
              const hhi = calculateHHI(agencyBreakdown);
              return isNaN(hhi) || hhi <= 0.25 ? "diverse" : 
                hhi > 0.5 ? "concentrated" : "moderate";
            })(),
            expansionOpportunities: null,
            calculatedAt: row.CREATED_AT ? new Date(row.CREATED_AT) : null,
          };
        });

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
              portfolioStability: sql`EXCLUDED.portfolio_stability`,
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

export async function loadSubcontractorMetricsMonthly() {
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
          subcontractorUei: row.RECIPIENT_UEI,
          subcontractorName: row.RECIPIENT_NAME,
          monthYear: new Date(row.SNAPSHOT_MONTH),
          monthlySubcontractRevenue: parseDecimal(row.REVENUE_MONTHLY_MILLIONS),
          monthlySubcontracts: parseInteger(row.ACTIVE_CONTRACT_COUNT), // Use contract count, not awards amount
          activeSubcontracts: parseInteger(row.ACTIVE_CONTRACT_COUNT),
          uniquePrimes: 0, // Would need to derive from network data
          topPrimes: null,
          avgSubcontractValue: "0",
          subcontractWinRate: null,
          primeToSubRatio: null,
          subRevenueGrowthMom: null,
          subRevenueGrowthYoy: parseNullableDecimal(row.GROWTH_YOY_REVENUE_TTM_PCT),
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
              subRevenueGrowthYoy: sql`EXCLUDED.sub_revenue_growth_yoy`,
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

export async function loadContractorNetworkMetrics() {
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
        const records = batch
          .filter(row => row.DOMINANT_PRIME_UEI) // Only include rows with prime relationships
          .map((row) => ({
            primeUei: row.DOMINANT_PRIME_UEI,
            primeName: row.DOMINANT_PRIME_NAME,
            subUei: row.RECIPIENT_UEI,
            subName: row.RECIPIENT_NAME,
            monthYear: new Date(row.SNAPSHOT_MONTH),
            monthlySharedRevenue: row.MAX_PRIME_RELATIONSHIP_TTM || "0",
            monthlySharedContracts: 0,
            totalHistoricalRevenue: "0",
            totalHistoricalContracts: 0,
            relationshipDuration: null,
            relationshipStrengthScore: parseInt(row.MAX_STRENGTH_SCORE) || null,
            collaborationFrequency: row.OVERALL_STRENGTH_TIER || null,
            primeNetworkSize: parseInt(row.TOTAL_PRIME_RELATIONSHIPS) || null,
            subNetworkSize: null,
            exclusivityScore: row.MAX_CONCENTRATION_PCT ? 
              String(parseFloat(row.MAX_CONCENTRATION_PCT) / 100) : null,
            jointWinRate: null,
            avgContractSize: "0",
            firstCollaborationDate: null,
            lastCollaborationDate: null,
            isActive: row.IS_ACTIVE_TEAMING_PARTNER === "true" || row.IS_ACTIVE_TEAMING_PARTNER === true,
          }));

        if (records.length > 0) {
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
                relationshipStrengthScore: sql`EXCLUDED.relationship_strength_score`,
                collaborationFrequency: sql`EXCLUDED.collaboration_frequency`,
                exclusivityScore: sql`EXCLUDED.exclusivity_score`,
                isActive: sql`EXCLUDED.is_active`,
                importedAt: sql`NOW()`,
              },
            });
        }
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

export async function loadIcebergOpportunities() {
  console.log("Loading iceberg opportunities data...");
  
  const files = await glob(`${DATA_DIR}/iceberg_search_union/*.csv.gz`);
  let totalProgress: LoadProgress = {
    tableName: "contractor_iceberg_opportunities",
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
        const records = batch.map((row) => {
          const primeRevenue = parseFloat(parseDecimal(row.PRIME_REVENUE_TTM_MILLIONS)) || 0;
          const subRevenue = parseFloat(parseDecimal(row.SUB_REVENUE_TTM_MILLIONS)) || 0;
          const totalRevenue = parseFloat(parseDecimal(row.TOTAL_REVENUE_TTM_MILLIONS)) || 0;
          
          // Calculate iceberg metrics
          const subToPrimeRatio = primeRevenue > 0 ? subRevenue / primeRevenue : null;
          const hiddenRevenuePercentage = totalRevenue > 0 ? (subRevenue / totalRevenue) * 100 : 0;
          
          // Calculate iceberg score (0-100, higher = more hidden opportunity)
          let icebergScore = 0;
          if (subToPrimeRatio && subToPrimeRatio > 1) {
            // High sub revenue relative to prime revenue
            icebergScore = Math.min(100, Math.round(subToPrimeRatio * 20 + hiddenRevenuePercentage));
          } else if (hiddenRevenuePercentage > 50) {
            // More than 50% revenue from subcontracting
            icebergScore = Math.round(hiddenRevenuePercentage);
          }
          
          // Determine opportunity tier
          let opportunityTier = "low";
          if (icebergScore >= 75) opportunityTier = "high";
          else if (icebergScore >= 50) opportunityTier = "medium";
          
          return {
            contractorUei: row.RECIPIENT_UEI,
            contractorName: row.RECIPIENT_NAME,
            primeRevenue: String(primeRevenue),
            subcontractorRevenue: String(subRevenue),
            totalRevenue: String(totalRevenue),
            subToPrimeRatio: subToPrimeRatio ? String(subToPrimeRatio) : null,
            hiddenRevenuePercentage: String(hiddenRevenuePercentage),
            icebergScore: icebergScore,
            opportunityTier: opportunityTier,
            scaleTier: row.SCALE_TIER || "Unknown",
            entityType: row.ENTITY_TYPE || "Unknown",
            primaryIndustry: null,
            primaryAgencies: null,
            businessTypes: row.ENTITY_TYPE ? [row.ENTITY_TYPE] : null,
            location: null,
            isActive: parseBoolean(row.HAS_PRIME_ACTIVITY) || parseBoolean(row.HAS_SUB_ACTIVITY),
            lastActivityDate: row.LAST_UPDATED ? new Date(row.LAST_UPDATED) : null,
            potentialPrimeValue: subToPrimeRatio && subToPrimeRatio > 1 ? 
              String(subRevenue * 0.8) : String(subRevenue * 0.3), // Estimated prime potential
            competitiveAdvantages: subToPrimeRatio && subToPrimeRatio > 2 ? 
              ["Strong subcontractor track record", "Proven delivery capability"] : null,
            riskFactors: primeRevenue === 0 ? 
              ["No prime contract experience", "Unproven as prime contractor"] : null,
            analysisDate: new Date(),
          };
        });

        // Only insert records with meaningful iceberg scores
        const meaningfulRecords = records.filter(record => record.icebergScore > 0);

        if (meaningfulRecords.length > 0) {
          await db
            .insert(contractorIcebergOpportunities)
            .values(meaningfulRecords)
            .onConflictDoUpdate({
              target: contractorIcebergOpportunities.contractorUei,
              set: {
                contractorName: sql`EXCLUDED.contractor_name`,
                primeRevenue: sql`EXCLUDED.prime_revenue`,
                subcontractorRevenue: sql`EXCLUDED.subcontractor_revenue`,
                totalRevenue: sql`EXCLUDED.total_revenue`,
                subToPrimeRatio: sql`EXCLUDED.sub_to_prime_ratio`,
                hiddenRevenuePercentage: sql`EXCLUDED.hidden_revenue_percentage`,
                icebergScore: sql`EXCLUDED.iceberg_score`,
                opportunityTier: sql`EXCLUDED.opportunity_tier`,
                potentialPrimeValue: sql`EXCLUDED.potential_prime_value`,
                lastUpdatedAt: sql`NOW()`,
              },
            });
        }
      },
      "contractor_iceberg_opportunities"
    );

    totalProgress.totalProcessed += progress.totalProcessed;
    totalProgress.totalInserted += progress.totalInserted;
    totalProgress.totalFailed += progress.totalFailed;
    totalProgress.errors.push(...progress.errors);
  }

  return totalProgress;
}

export async function loadHybridEntities() {
  console.log("Loading hybrid entities data...");
  
  const file = `${DATA_DIR}/hybrid_entities.csv.gz`;
  
  // This updates existing records with hybrid-specific metrics
  return await loadCsvFile(
    file,
    async (batch) => {
      // Update contractor_universe with hybrid metrics
      const universeUpdates = batch.map((row) => ({
        uei: row.RECIPIENT_UEI,
        legalBusinessName: row.RECIPIENT_NAME,
        entityType: "HYBRID",
        isHybrid: true,
        isPrime: true,
        isSubcontractor: true,
        lifetimeRevenue: row.TOTAL_REVENUE_LIFETIME_MILLIONS || "0",
      }));

      await db
        .insert(contractorUniverse)
        .values(universeUpdates)
        .onConflictDoUpdate({
          target: contractorUniverse.uei,
          set: {
            entityType: sql`'HYBRID'`,
            isHybrid: sql`true`,
            isPrime: sql`true`,
            isSubcontractor: sql`true`,
            lifetimeRevenue: sql`EXCLUDED.lifetime_revenue`,
            updatedAt: sql`NOW()`,
          },
        });
    },
    "hybrid_entities"
  );
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
    loadedBy: "snowflake-loader-v2",
    loadType: "full",
  });
}

async function main() {
  console.log("Starting Snowflake data ETL process (v2)...");
  console.log(`Data directory: ${DATA_DIR}`);
  
  const tables = [
    { name: "Contractor Universe", loader: loadContractorUniverse },
    { name: "Contractor Metrics Monthly", loader: loadContractorMetricsMonthly },
    { name: "Peer Comparisons Monthly", loader: loadPeerComparisonsMonthly },
    { name: "Portfolio Breakdowns Monthly", loader: loadPortfolioBreakdownsMonthly },
    { name: "Subcontractor Metrics Monthly", loader: loadSubcontractorMetricsMonthly },
    { name: "Contractor Network Metrics", loader: loadContractorNetworkMetrics },
    { name: "Iceberg Opportunities", loader: loadIcebergOpportunities },
    { name: "Hybrid Entities", loader: loadHybridEntities },
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
  console.log("\nRun verification queries:");
  console.log("  bun run db:shell");
  console.log("  SELECT COUNT(*) FROM contractor_universe;");
  console.log("  SELECT COUNT(*) FROM contractor_metrics_monthly;");
  
  process.exit(0);
}

// Main function commented out - this is now a library file
// Use snowflake-loader-v2.ts to run the full ETL
// Or import specific functions from this file