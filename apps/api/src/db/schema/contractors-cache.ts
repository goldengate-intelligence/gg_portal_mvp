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
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const contractorsCache = pgTable(
  "contractors_cache",
  {
    // Primary key
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Core contractor fields from CSV
    contractorUei: varchar("contractor_uei", { length: 20 }).notNull().unique(),
    contractorName: text("contractor_name").notNull(),
    primaryAgency: text("primary_agency"),
    primarySubAgencyCode: varchar("primary_sub_agency_code", { length: 10 }),
    country: varchar("country", { length: 100 }),
    state: varchar("state", { length: 10 }),
    city: text("city"),
    zipCode: varchar("zip_code", { length: 10 }),
    
    // NAICS and industry classification
    primaryNaicsCode: varchar("primary_naics_code", { length: 10 }),
    primaryNaicsDescription: text("primary_naics_description"),
    industryCluster: text("industry_cluster"),
    
    // Business characteristics
    lifecycleStage: varchar("lifecycle_stage", { length: 50 }),
    sizeTier: varchar("size_tier", { length: 20 }),
    sizeQuartile: varchar("size_quartile", { length: 10 }),
    peerGroupRefined: text("peer_group_refined"),
    
    // Contract metrics
    totalContracts: integer("total_contracts").default(0),
    totalObligated: decimal("total_obligated", { precision: 15, scale: 2 }).default("0"),
    agencyDiversity: integer("agency_diversity").default(0),
    
    // Metadata
    sourceLastUpdated: timestamp("source_last_updated"),
    cacheCreatedAt: timestamp("cache_created_at").defaultNow().notNull(),
    cacheUpdatedAt: timestamp("cache_updated_at").defaultNow().notNull(),
    
    // Additional fields for enhanced functionality
    isActive: boolean("is_active").default(true),
    syncStatus: varchar("sync_status", { length: 20 }).default("synced"), // synced, pending, error
    syncError: text("sync_error"),
    metadata: jsonb("metadata"), // For storing additional flexible data
  },
  (table) => ({
    // Indexes for common queries
    contractorNameIdx: index("idx_contractor_name").on(table.contractorName),
    contractorUeiIdx: uniqueIndex("idx_contractor_uei").on(table.contractorUei),
    stateIdx: index("idx_state").on(table.state),
    primaryAgencyIdx: index("idx_primary_agency").on(table.primaryAgency),
    industryClusterIdx: index("idx_industry_cluster").on(table.industryCluster),
    lifecycleStageIdx: index("idx_lifecycle_stage").on(table.lifecycleStage),
    sizeTierIdx: index("idx_size_tier").on(table.sizeTier),
    totalObligatedIdx: index("idx_total_obligated").on(table.totalObligated),
    
    // Composite indexes for common filter combinations
    stateIndustryIdx: index("idx_state_industry").on(table.state, table.industryCluster),
    agencySizeIdx: index("idx_agency_size").on(table.primaryAgency, table.sizeTier),
    
    // Additional indexes for text search (GIN index will be created via raw SQL migration)
    naicsDescIdx: index("idx_naics_description").on(table.primaryNaicsDescription),
  })
);

// Type for inserting contractors
export type NewContractorCache = typeof contractorsCache.$inferInsert;
export type ContractorCache = typeof contractorsCache.$inferSelect;

// Cache statistics table
export const contractorsCacheStats = pgTable("contractors_cache_stats", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  lastSyncTime: timestamp("last_sync_time"),
  totalRecords: integer("total_records").default(0),
  syncDuration: integer("sync_duration_ms"),
  syncStatus: varchar("sync_status", { length: 20 }).default("idle"), // idle, syncing, completed, failed
  syncError: text("sync_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ContractorsCacheStats = typeof contractorsCacheStats.$inferSelect;