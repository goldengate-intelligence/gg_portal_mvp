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
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { contractorsCache } from "./contractors-cache";

// Main contractor profile table - one row per unique contractor entity
export const contractorProfiles = pgTable(
  "contractor_profiles",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Core contractor identity
    canonicalName: text("canonical_name").notNull().unique(), // Standardized name
    displayName: text("display_name").notNull(), // Display-friendly name
    
    // Aggregate metrics across all UEIs
    totalUeis: integer("total_ueis").default(0),
    totalContracts: integer("total_contracts").default(0),
    totalObligated: decimal("total_obligated", { precision: 20, scale: 2 }).default("0"),
    avgContractValue: decimal("avg_contract_value", { precision: 18, scale: 2 }).default("0"),
    
    // Agency relationships
    primaryAgency: text("primary_agency"), // Most common agency
    totalAgencies: integer("total_agencies").default(0),
    agencyDiversity: integer("agency_diversity").default(0),
    
    // Geographic presence
    headquartersState: varchar("headquarters_state", { length: 10 }),
    totalStates: integer("total_states").default(0),
    statesList: jsonb("states_list").$type<string[]>().default(sql`'[]'::jsonb`),
    
    // Industry classification
    primaryNaicsCode: varchar("primary_naics_code", { length: 10 }),
    primaryNaicsDescription: text("primary_naics_description"),
    primaryIndustryCluster: text("primary_industry_cluster"),
    industryClusters: jsonb("industry_clusters").$type<string[]>().default(sql`'[]'::jsonb`),
    
    // Business characteristics (aggregated/derived)
    dominantSizeTier: varchar("dominant_size_tier", { length: 20 }),
    dominantLifecycleStage: varchar("dominant_lifecycle_stage", { length: 50 }),
    
    // Performance metrics
    performanceScore: integer("performance_score"), // Calculated based on diversity, value, etc.
    riskScore: integer("risk_score"), // Based on concentration, lifecycle, etc.
    growthTrend: varchar("growth_trend", { length: 20 }), // increasing, stable, declining
    
    // Metadata
    firstSeenDate: timestamp("first_seen_date"),
    lastActiveDate: timestamp("last_active_date"),
    profileCreatedAt: timestamp("profile_created_at").defaultNow().notNull(),
    profileUpdatedAt: timestamp("profile_updated_at").defaultNow().notNull(),
    
    // Additional analysis fields
    metadata: jsonb("metadata"), // Flexible field for additional data
    tags: jsonb("tags").$type<string[]>().default(sql`'[]'::jsonb`),
    isActive: boolean("is_active").default(true),
    profileCompleteness: integer("profile_completeness").default(0), // 0-100
  },
  (table) => ({
    // Indexes for common queries
    canonicalNameIdx: uniqueIndex("idx_canonical_name").on(table.canonicalName),
    displayNameIdx: index("idx_display_name").on(table.displayName),
    totalObligatedIdx: index("idx_profile_total_obligated").on(table.totalObligated),
    primaryAgencyIdx: index("idx_profile_primary_agency").on(table.primaryAgency),
    headquartersStateIdx: index("idx_headquarters_state").on(table.headquartersState),
    performanceScoreIdx: index("idx_performance_score").on(table.performanceScore),
    
    // Full text search on display name
    profileSearchIdx: index("idx_profile_search").on(table.displayName),
  })
);

// Mapping table - links UEIs to contractor profiles
export const contractorUeiMappings = pgTable(
  "contractor_uei_mappings",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    
    profileId: uuid("profile_id")
      .notNull()
      .references(() => contractorProfiles.id, { onDelete: "cascade" }),
    
    contractorCacheId: text("contractor_cache_id")
      .notNull()
      .references(() => contractorsCache.id, { onDelete: "cascade" }),
    
    uei: varchar("uei", { length: 20 }).notNull(),
    contractorName: text("contractor_name").notNull(), // As it appears in the cache
    
    // Metrics for this specific UEI
    totalContracts: integer("total_contracts").default(0),
    totalObligated: decimal("total_obligated", { precision: 18, scale: 2 }).default("0"),
    primaryAgency: text("primary_agency"),
    state: varchar("state", { length: 10 }),
    
    // Metadata
    mappingConfidence: integer("mapping_confidence").default(100), // 0-100
    mappingMethod: varchar("mapping_method", { length: 50 }).default("exact_match"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    profileIdIdx: index("idx_mapping_profile_id").on(table.profileId),
    ueiIdx: uniqueIndex("idx_mapping_uei").on(table.uei),
    contractorCacheIdIdx: index("idx_mapping_cache_id").on(table.contractorCacheId),
  })
);

// Agency relationships - tracks contractor-agency relationships
export const contractorAgencyRelationships = pgTable(
  "contractor_agency_relationships",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    
    profileId: uuid("profile_id")
      .notNull()
      .references(() => contractorProfiles.id, { onDelete: "cascade" }),
    
    agency: text("agency").notNull(),
    subAgency: text("sub_agency"),
    
    // Aggregate metrics for this contractor-agency pair
    totalContracts: integer("total_contracts").default(0),
    totalObligated: decimal("total_obligated", { precision: 18, scale: 2 }).default("0"),
    totalUeis: integer("total_ueis").default(0), // How many UEIs work with this agency
    
    // Relationship characteristics
    firstContractDate: timestamp("first_contract_date"),
    lastContractDate: timestamp("last_contract_date"),
    relationshipStrength: varchar("relationship_strength", { length: 20 }), // strong, moderate, weak
    isPrimary: boolean("is_primary").default(false),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    profileAgencyIdx: uniqueIndex("idx_profile_agency").on(table.profileId, table.agency),
    profileIdIdx: index("idx_relationship_profile_id").on(table.profileId),
    agencyIdx: index("idx_relationship_agency").on(table.agency),
  })
);

// Profile statistics table for tracking aggregation runs
export const contractorProfileStats = pgTable("contractor_profile_stats", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  
  totalProfiles: integer("total_profiles").default(0),
  totalUeisMapped: integer("total_ueis_mapped").default(0),
  totalUnmappedUeis: integer("total_unmapped_ueis").default(0),
  
  lastAggregationRun: timestamp("last_aggregation_run"),
  aggregationDuration: integer("aggregation_duration_ms"),
  aggregationStatus: varchar("aggregation_status", { length: 20 }).default("idle"),
  aggregationError: text("aggregation_error"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types
export type ContractorProfile = typeof contractorProfiles.$inferSelect;
export type NewContractorProfile = typeof contractorProfiles.$inferInsert;
export type ContractorUeiMapping = typeof contractorUeiMappings.$inferSelect;
export type NewContractorUeiMapping = typeof contractorUeiMappings.$inferInsert;
export type ContractorAgencyRelationship = typeof contractorAgencyRelationships.$inferSelect;
export type NewContractorAgencyRelationship = typeof contractorAgencyRelationships.$inferInsert;