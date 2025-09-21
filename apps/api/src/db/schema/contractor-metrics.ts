import {
  pgTable,
  text,
  integer,
  decimal,
  timestamp,
  index,
  uniqueIndex,
  varchar,
  boolean,
  jsonb,
  uuid,
  date,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { contractorProfiles } from "./contractor-profiles";

// Monthly performance metrics for prime contractors (from full_contractor_metrics_monthly)
export const contractorMetricsMonthly = pgTable(
  "contractor_metrics_monthly",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Link to contractor profile
    profileId: uuid("profile_id")
      .references(() => contractorProfiles.id, { onDelete: "cascade" }),
    
    // Contractor identifiers
    contractorUei: varchar("contractor_uei", { length: 20 }).notNull(),
    contractorName: text("contractor_name").notNull(),
    
    // Time dimension
    monthYear: date("month_year").notNull(),
    fiscalYear: integer("fiscal_year"),
    fiscalQuarter: integer("fiscal_quarter"),
    
    // Performance metrics
    monthlyRevenue: decimal("monthly_revenue", { precision: 20, scale: 2 }).default("0"),
    monthlyAwards: decimal("monthly_awards", { precision: 20, scale: 2 }).default("0"),
    monthlyContracts: integer("monthly_contracts").default(0),
    activeContracts: integer("active_contracts").default(0),
    
    // Growth metrics
    revenueGrowthMom: decimal("revenue_growth_mom", { precision: 10, scale: 4 }), // Month-over-month
    revenueGrowthYoy: decimal("revenue_growth_yoy", { precision: 10, scale: 4 }), // Year-over-year
    contractGrowthMom: decimal("contract_growth_mom", { precision: 10, scale: 4 }),
    
    // Activity classification
    activityStatus: varchar("activity_status", { length: 20 }), // hot, warm, cold
    lastActivityDate: date("last_activity_date"),
    daysInactive: integer("days_inactive"),
    
    // Pipeline metrics
    pipelineValue: decimal("pipeline_value", { precision: 20, scale: 2 }).default("0"),
    pipelineCount: integer("pipeline_count").default(0),
    winRate: decimal("win_rate", { precision: 5, scale: 4 }),
    
    // Agency concentration
    primaryAgency: text("primary_agency"),
    topAgencies: jsonb("top_agencies").$type<Array<{agency: string, revenue: number}>>(),
    agencyConcentration: decimal("agency_concentration", { precision: 5, scale: 4 }), // HHI index
    
    // Contract characteristics
    avgContractValue: decimal("avg_contract_value", { precision: 18, scale: 2 }),
    medianContractValue: decimal("median_contract_value", { precision: 18, scale: 2 }),
    contractSizeDistribution: jsonb("contract_size_distribution"),
    
    // Metadata
    dataSource: varchar("data_source", { length: 50 }).default("snowflake"),
    importedAt: timestamp("imported_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Unique constraint for contractor-month combination
    contractorMonthIdx: uniqueIndex("idx_contractor_month").on(table.contractorUei, table.monthYear),
    
    // Performance indexes
    profileIdIdx: index("idx_metrics_profile_id").on(table.profileId),
    monthYearIdx: index("idx_metrics_month_year").on(table.monthYear),
    activityStatusIdx: index("idx_activity_status").on(table.activityStatus),
    revenueIdx: index("idx_monthly_revenue").on(table.monthlyRevenue),
    
    // Composite indexes for common queries
    profileMonthIdx: index("idx_profile_month").on(table.profileId, table.monthYear),
    agencyMonthIdx: index("idx_agency_month").on(table.primaryAgency, table.monthYear),
  })
);

// Peer comparison metrics (from peer_comparisons_monthly)
export const peerComparisonsMonthly = pgTable(
  "peer_comparisons_monthly",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Link to contractor profile
    profileId: uuid("profile_id")
      .references(() => contractorProfiles.id, { onDelete: "cascade" }),
    
    // Contractor identifiers
    contractorUei: varchar("contractor_uei", { length: 20 }).notNull(),
    contractorName: text("contractor_name").notNull(),
    
    // Time dimension
    monthYear: date("month_year").notNull(),
    
    // Peer group definition
    peerGroup: text("peer_group").notNull(),
    peerGroupSize: integer("peer_group_size"),
    peerGroupCriteria: jsonb("peer_group_criteria"), // Size tier, industry, etc.
    
    // Revenue rankings
    revenuePercentile: integer("revenue_percentile"), // 0-100
    revenueRank: integer("revenue_rank"),
    revenueQuartile: integer("revenue_quartile"), // 1-4
    
    // Growth rankings
    growthPercentile: integer("growth_percentile"),
    growthRank: integer("growth_rank"),
    growthQuartile: integer("growth_quartile"),
    
    // Contract volume rankings
    contractCountPercentile: integer("contract_count_percentile"),
    contractCountRank: integer("contract_count_rank"),
    
    // Win rate rankings
    winRatePercentile: integer("win_rate_percentile"),
    winRateRank: integer("win_rate_rank"),
    
    // Composite scores
    overallPerformanceScore: integer("overall_performance_score"), // 0-100
    competitivePositioning: varchar("competitive_positioning", { length: 20 }), // leader, challenger, follower, niche
    
    // Peer statistics for context
    peerMedianRevenue: decimal("peer_median_revenue", { precision: 20, scale: 2 }),
    peerAvgRevenue: decimal("peer_avg_revenue", { precision: 20, scale: 2 }),
    peerTopQuartileRevenue: decimal("peer_top_quartile_revenue", { precision: 20, scale: 2 }),
    
    // Trends
    percentileChange: integer("percentile_change"), // Change from previous month
    trendDirection: varchar("trend_direction", { length: 20 }), // improving, stable, declining
    
    // Metadata
    calculatedAt: timestamp("calculated_at"),
    importedAt: timestamp("imported_at").defaultNow().notNull(),
  },
  (table) => ({
    // Unique constraint
    contractorPeerMonthIdx: uniqueIndex("idx_contractor_peer_month").on(
      table.contractorUei, 
      table.peerGroup, 
      table.monthYear
    ),
    
    // Query indexes
    profileIdIdx: index("idx_peer_profile_id").on(table.profileId),
    monthYearIdx: index("idx_peer_month_year").on(table.monthYear),
    peerGroupIdx: index("idx_peer_group").on(table.peerGroup),
    performanceScoreIdx: index("idx_peer_performance_score").on(table.overallPerformanceScore),
  })
);

// Portfolio breakdown metrics (from portfolio_breakdowns_monthly)
export const portfolioBreakdownsMonthly = pgTable(
  "portfolio_breakdowns_monthly",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Link to contractor profile
    profileId: uuid("profile_id")
      .references(() => contractorProfiles.id, { onDelete: "cascade" }),
    
    // Contractor identifiers
    contractorUei: varchar("contractor_uei", { length: 20 }).notNull(),
    contractorName: text("contractor_name").notNull(),
    
    // Time dimension
    monthYear: date("month_year").notNull(),
    
    // Agency concentration
    topAgencies: jsonb("top_agencies").$type<Array<{
      agency: string,
      revenue: number,
      percentage: number,
      contractCount: number
    }>>(),
    agencyHhi: decimal("agency_hhi", { precision: 10, scale: 4 }), // Herfindahl-Hirschman Index
    agencyCount: integer("agency_count"),
    primaryAgencyRevenue: decimal("primary_agency_revenue", { precision: 20, scale: 2 }),
    primaryAgencyPercentage: decimal("primary_agency_percentage", { precision: 5, scale: 2 }),
    
    // NAICS concentration
    topNaics: jsonb("top_naics").$type<Array<{
      code: string,
      description: string,
      revenue: number,
      percentage: number
    }>>(),
    naicsHhi: decimal("naics_hhi", { precision: 10, scale: 4 }),
    naicsCount: integer("naics_count"),
    primaryNaicsRevenue: decimal("primary_naics_revenue", { precision: 20, scale: 2 }),
    primaryNaicsPercentage: decimal("primary_naics_percentage", { precision: 5, scale: 2 }),
    
    // PSC (Product Service Code) concentration
    topPsc: jsonb("top_psc").$type<Array<{
      code: string,
      description: string,
      revenue: number,
      percentage: number
    }>>(),
    pscHhi: decimal("psc_hhi", { precision: 10, scale: 4 }),
    pscCount: integer("psc_count"),
    
    // Contract type distribution
    contractTypeDistribution: jsonb("contract_type_distribution").$type<{
      firm_fixed_price: number,
      cost_plus: number,
      time_and_materials: number,
      other: number
    }>(),
    
    // Risk assessment
    concentrationRiskScore: integer("concentration_risk_score"), // 0-100, higher = more risk
    diversificationScore: integer("diversification_score"), // 0-100, higher = more diverse
    portfolioStability: varchar("portfolio_stability", { length: 20 }), // stable, moderate, volatile
    
    // Opportunity assessment
    expansionOpportunities: jsonb("expansion_opportunities").$type<Array<{
      type: string, // agency, naics, geographic
      target: string,
      potentialValue: number
    }>>(),
    
    // Metadata
    calculatedAt: timestamp("calculated_at"),
    importedAt: timestamp("imported_at").defaultNow().notNull(),
  },
  (table) => ({
    // Unique constraint
    contractorPortfolioMonthIdx: uniqueIndex("idx_contractor_portfolio_month").on(
      table.contractorUei,
      table.monthYear
    ),
    
    // Query indexes
    profileIdIdx: index("idx_portfolio_profile_id").on(table.profileId),
    monthYearIdx: index("idx_portfolio_month_year").on(table.monthYear),
    riskScoreIdx: index("idx_concentration_risk_score").on(table.concentrationRiskScore),
    diversificationIdx: index("idx_diversification_score").on(table.diversificationScore),
  })
);

// Subcontractor performance metrics (from full_subcontractor_metrics_monthly)
export const subcontractorMetricsMonthly = pgTable(
  "subcontractor_metrics_monthly",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Link to contractor profile (subcontractor)
    profileId: uuid("profile_id")
      .references(() => contractorProfiles.id, { onDelete: "cascade" }),
    
    // Subcontractor identifiers
    subcontractorUei: varchar("subcontractor_uei", { length: 20 }).notNull(),
    subcontractorName: text("subcontractor_name").notNull(),
    
    // Time dimension
    monthYear: date("month_year").notNull(),
    
    // Subcontract performance metrics
    monthlySubcontractRevenue: decimal("monthly_subcontract_revenue", { precision: 20, scale: 2 }).default("0"),
    monthlySubcontracts: integer("monthly_subcontracts").default(0),
    activeSubcontracts: integer("active_subcontracts").default(0),
    
    // Prime contractor relationships
    uniquePrimes: integer("unique_primes").default(0),
    topPrimes: jsonb("top_primes").$type<Array<{
      primeUei: string,
      primeName: string,
      revenue: number,
      contractCount: number
    }>>(),
    
    // Subcontract characteristics
    avgSubcontractValue: decimal("avg_subcontract_value", { precision: 18, scale: 2 }),
    subcontractWinRate: decimal("subcontract_win_rate", { precision: 5, scale: 4 }),
    
    // Performance as percentage of prime work
    primeToSubRatio: decimal("prime_to_sub_ratio", { precision: 10, scale: 4 }), // Sub revenue / Prime revenue
    
    // Growth metrics
    subRevenueGrowthMom: decimal("sub_revenue_growth_mom", { precision: 10, scale: 4 }),
    subRevenueGrowthYoy: decimal("sub_revenue_growth_yoy", { precision: 10, scale: 4 }),
    
    // Metadata
    dataSource: varchar("data_source", { length: 50 }).default("snowflake"),
    importedAt: timestamp("imported_at").defaultNow().notNull(),
  },
  (table) => ({
    // Unique constraint
    subcontractorMonthIdx: uniqueIndex("idx_subcontractor_month").on(
      table.subcontractorUei,
      table.monthYear
    ),
    
    // Query indexes
    profileIdIdx: index("idx_sub_metrics_profile_id").on(table.profileId),
    monthYearIdx: index("idx_sub_metrics_month_year").on(table.monthYear),
    revenueIdx: index("idx_sub_monthly_revenue").on(table.monthlySubcontractRevenue),
  })
);

// Prime-subcontractor network relationships (from subcontractor_network_metrics_monthly)
export const contractorNetworkMetrics = pgTable(
  "contractor_network_metrics",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Prime contractor
    primeProfileId: uuid("prime_profile_id")
      .references(() => contractorProfiles.id, { onDelete: "cascade" }),
    primeUei: varchar("prime_uei", { length: 20 }).notNull(),
    primeName: text("prime_name").notNull(),
    
    // Subcontractor
    subProfileId: uuid("sub_profile_id")
      .references(() => contractorProfiles.id, { onDelete: "cascade" }),
    subUei: varchar("sub_uei", { length: 20 }).notNull(),
    subName: text("sub_name").notNull(),
    
    // Time dimension
    monthYear: date("month_year").notNull(),
    
    // Relationship metrics
    monthlySharedRevenue: decimal("monthly_shared_revenue", { precision: 20, scale: 2 }).default("0"),
    monthlySharedContracts: integer("monthly_shared_contracts").default(0),
    totalHistoricalRevenue: decimal("total_historical_revenue", { precision: 20, scale: 2 }).default("0"),
    totalHistoricalContracts: integer("total_historical_contracts").default(0),
    
    // Relationship strength indicators
    relationshipDuration: integer("relationship_duration_months"),
    relationshipStrengthScore: integer("relationship_strength_score"), // 0-100
    collaborationFrequency: varchar("collaboration_frequency", { length: 20 }), // frequent, occasional, rare
    
    // Network position metrics
    primeNetworkSize: integer("prime_network_size"), // Total subs for this prime
    subNetworkSize: integer("sub_network_size"), // Total primes for this sub
    exclusivityScore: decimal("exclusivity_score", { precision: 5, scale: 4 }), // How exclusive is this relationship
    
    // Performance metrics
    jointWinRate: decimal("joint_win_rate", { precision: 5, scale: 4 }),
    avgContractSize: decimal("avg_contract_size", { precision: 18, scale: 2 }),
    
    // Metadata
    firstCollaborationDate: date("first_collaboration_date"),
    lastCollaborationDate: date("last_collaboration_date"),
    isActive: boolean("is_active").default(true),
    importedAt: timestamp("imported_at").defaultNow().notNull(),
  },
  (table) => ({
    // Unique constraint for prime-sub-month combination
    primeSubMonthIdx: uniqueIndex("idx_prime_sub_month").on(
      table.primeUei,
      table.subUei,
      table.monthYear
    ),
    
    // Query indexes
    primeProfileIdx: index("idx_network_prime_profile").on(table.primeProfileId),
    subProfileIdx: index("idx_network_sub_profile").on(table.subProfileId),
    monthYearIdx: index("idx_network_month_year").on(table.monthYear),
    strengthScoreIdx: index("idx_relationship_strength").on(table.relationshipStrengthScore),
    
    // Composite indexes for network analysis
    primeMonthIdx: index("idx_prime_month").on(table.primeUei, table.monthYear),
    subMonthIdx: index("idx_sub_month").on(table.subUei, table.monthYear),
  })
);

// Master contractor universe (from full_contractor_universe)
export const contractorUniverse = pgTable(
  "contractor_universe",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Link to contractor profile
    profileId: uuid("profile_id")
      .references(() => contractorProfiles.id, { onDelete: "set null" }),
    
    // Core identifiers
    uei: varchar("uei", { length: 20 }).notNull().unique(),
    legalBusinessName: text("legal_business_name").notNull(),
    dbaName: text("dba_name"),
    
    // Registration status
    registrationStatus: varchar("registration_status", { length: 50 }), // active, inactive, expired
    registrationDate: date("registration_date"),
    expirationDate: date("expiration_date"),
    lastUpdatedDate: date("last_updated_date"),
    
    // Business information
    entityType: varchar("entity_type", { length: 100 }), // corporation, llc, partnership, etc.
    organizationStructure: varchar("organization_structure", { length: 100 }),
    stateOfIncorporation: varchar("state_of_incorporation", { length: 10 }),
    countryOfIncorporation: varchar("country_of_incorporation", { length: 100 }),
    
    // Physical location
    physicalAddress: jsonb("physical_address").$type<{
      street1: string,
      street2?: string,
      city: string,
      state: string,
      zipCode: string,
      country: string
    }>(),
    
    // Mailing address (if different)
    mailingAddress: jsonb("mailing_address").$type<{
      street1: string,
      street2?: string,
      city: string,
      state: string,
      zipCode: string,
      country: string
    }>(),
    
    // Business classifications
    businessTypes: jsonb("business_types").$type<string[]>(), // Small Business, 8(a), Woman Owned, etc.
    primaryNaics: varchar("primary_naics", { length: 10 }),
    allNaicsCodes: jsonb("all_naics_codes").$type<string[]>(),
    
    // Compliance and certifications
    cageCode: varchar("cage_code", { length: 10 }),
    dunsBumber: varchar("duns_number", { length: 20 }),
    samRegistered: boolean("sam_registered").default(false),
    samExpirationDate: date("sam_expiration_date"),
    
    // Contractor history summary
    firstContractDate: date("first_contract_date"),
    lastContractDate: date("last_contract_date"),
    lifetimeContracts: integer("lifetime_contracts").default(0),
    lifetimeRevenue: decimal("lifetime_revenue", { precision: 20, scale: 2 }).default("0"),
    
    // Status flags
    isActive: boolean("is_active").default(true),
    isPrime: boolean("is_prime").default(false),
    isSubcontractor: boolean("is_subcontractor").default(false),
    isHybrid: boolean("is_hybrid").default(false),
    
    // Metadata
    dataSource: varchar("data_source", { length: 50 }).default("snowflake"),
    importedAt: timestamp("imported_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Primary indexes
    ueiIdx: uniqueIndex("idx_universe_uei").on(table.uei),
    profileIdIdx: index("idx_universe_profile_id").on(table.profileId),
    
    // Search indexes
    legalNameIdx: index("idx_legal_business_name").on(table.legalBusinessName),
    registrationStatusIdx: index("idx_registration_status").on(table.registrationStatus),
    
    // Classification indexes
    primaryNaicsIdx: index("idx_universe_primary_naics").on(table.primaryNaics),
    stateIdx: index("idx_universe_state").on(table.stateOfIncorporation),
    
    // Boolean flags for filtering
    isActiveIdx: index("idx_universe_is_active").on(table.isActive),
    isPrimeIdx: index("idx_universe_is_prime").on(table.isPrime),
    isSubIdx: index("idx_universe_is_sub").on(table.isSubcontractor),
  })
);

// Iceberg opportunities - contractors with high sub revenue but low prime revenue (from iceberg_search_union)
export const contractorIcebergOpportunities = pgTable(
  "contractor_iceberg_opportunities",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Link to contractor profile
    profileId: uuid("profile_id")
      .references(() => contractorProfiles.id, { onDelete: "cascade" }),
    
    // Contractor identifiers
    contractorUei: varchar("contractor_uei", { length: 20 }).notNull(),
    contractorName: text("contractor_name").notNull(),
    
    // Revenue comparison metrics
    primeRevenue: decimal("prime_revenue", { precision: 20, scale: 2 }).default("0"),
    subcontractorRevenue: decimal("subcontractor_revenue", { precision: 20, scale: 2 }).default("0"),
    totalRevenue: decimal("total_revenue", { precision: 20, scale: 2 }).default("0"),
    
    // Iceberg metrics
    subToPrimeRatio: decimal("sub_to_prime_ratio", { precision: 10, scale: 4 }), // Sub revenue / Prime revenue
    hiddenRevenuePercentage: decimal("hidden_revenue_percentage", { precision: 5, scale: 2 }), // % of revenue that's sub
    icebergScore: integer("iceberg_score"), // 0-100, higher = more hidden opportunity
    
    // Opportunity classification
    opportunityTier: varchar("opportunity_tier", { length: 20 }), // high, medium, low
    scaleTier: varchar("scale_tier", { length: 20 }), // Large, Medium, Small
    entityType: varchar("entity_type", { length: 20 }), // PRIME, SUB, HYBRID
    
    // Business context
    primaryIndustry: text("primary_industry"),
    primaryAgencies: jsonb("primary_agencies").$type<string[]>(),
    businessTypes: jsonb("business_types").$type<string[]>(),
    
    // Geographic info
    location: jsonb("location").$type<{
      city: string,
      state: string,
      country: string
    }>(),
    
    // Activity metrics
    isActive: boolean("is_active").default(true),
    lastActivityDate: date("last_activity_date"),
    
    // Opportunity insights
    potentialPrimeValue: decimal("potential_prime_value", { precision: 20, scale: 2 }), // Estimated prime contract potential
    competitiveAdvantages: jsonb("competitive_advantages").$type<string[]>(),
    riskFactors: jsonb("risk_factors").$type<string[]>(),
    
    // Metadata
    analysisDate: date("analysis_date"),
    lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Unique constraint
    contractorUeiIdx: uniqueIndex("idx_iceberg_contractor_uei").on(table.contractorUei),
    
    // Opportunity indexes
    icebergScoreIdx: index("idx_iceberg_score").on(table.icebergScore),
    opportunityTierIdx: index("idx_opportunity_tier").on(table.opportunityTier),
    subToPrimeRatioIdx: index("idx_sub_to_prime_ratio").on(table.subToPrimeRatio),
    
    // Filter indexes
    profileIdIdx: index("idx_iceberg_profile_id").on(table.profileId),
    scaleTierIdx: index("idx_iceberg_scale_tier").on(table.scaleTier),
    entityTypeIdx: index("idx_iceberg_entity_type").on(table.entityType),
    isActiveIdx: index("idx_iceberg_is_active").on(table.isActive),
  })
);

// ETL metadata table for tracking data loads
export const contractorEtlMetadata = pgTable(
  "contractor_etl_metadata",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    
    tableName: varchar("table_name", { length: 100 }).notNull(),
    sourceFile: text("source_file"),
    
    // Load statistics
    recordsProcessed: integer("records_processed").default(0),
    recordsInserted: integer("records_inserted").default(0),
    recordsUpdated: integer("records_updated").default(0),
    recordsSkipped: integer("records_skipped").default(0),
    recordsFailed: integer("records_failed").default(0),
    
    // Timing
    loadStartTime: timestamp("load_start_time").notNull(),
    loadEndTime: timestamp("load_end_time"),
    loadDurationMs: integer("load_duration_ms"),
    
    // Status
    loadStatus: varchar("load_status", { length: 20 }).notNull(), // pending, running, completed, failed
    errorMessage: text("error_message"),
    
    // Data quality
    dataQualityChecks: jsonb("data_quality_checks"),
    validationErrors: jsonb("validation_errors"),
    
    // Metadata
    loadedBy: varchar("loaded_by", { length: 100 }),
    loadType: varchar("load_type", { length: 20 }), // full, incremental, delta
    monthYear: date("month_year"), // For monthly data loads
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tableNameIdx: index("idx_etl_table_name").on(table.tableName),
    loadStatusIdx: index("idx_etl_load_status").on(table.loadStatus),
    monthYearIdx: index("idx_etl_month_year").on(table.monthYear),
    createdAtIdx: index("idx_etl_created_at").on(table.createdAt),
  })
);

// Export types
export type ContractorMetricsMonthly = typeof contractorMetricsMonthly.$inferSelect;
export type NewContractorMetricsMonthly = typeof contractorMetricsMonthly.$inferInsert;

export type PeerComparisonsMonthly = typeof peerComparisonsMonthly.$inferSelect;
export type NewPeerComparisonsMonthly = typeof peerComparisonsMonthly.$inferInsert;

export type PortfolioBreakdownsMonthly = typeof portfolioBreakdownsMonthly.$inferSelect;
export type NewPortfolioBreakdownsMonthly = typeof portfolioBreakdownsMonthly.$inferInsert;

export type SubcontractorMetricsMonthly = typeof subcontractorMetricsMonthly.$inferSelect;
export type NewSubcontractorMetricsMonthly = typeof subcontractorMetricsMonthly.$inferInsert;

export type ContractorNetworkMetrics = typeof contractorNetworkMetrics.$inferSelect;
export type NewContractorNetworkMetrics = typeof contractorNetworkMetrics.$inferInsert;

export type ContractorUniverse = typeof contractorUniverse.$inferSelect;
export type NewContractorUniverse = typeof contractorUniverse.$inferInsert;

export type ContractorIcebergOpportunities = typeof contractorIcebergOpportunities.$inferSelect;
export type NewContractorIcebergOpportunities = typeof contractorIcebergOpportunities.$inferInsert;

export type ContractorEtlMetadata = typeof contractorEtlMetadata.$inferSelect;
export type NewContractorEtlMetadata = typeof contractorEtlMetadata.$inferInsert;