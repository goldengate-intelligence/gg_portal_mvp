CREATE TABLE IF NOT EXISTS "contractor_etl_metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table_name" varchar(100) NOT NULL,
	"source_file" text,
	"records_processed" integer DEFAULT 0,
	"records_inserted" integer DEFAULT 0,
	"records_updated" integer DEFAULT 0,
	"records_skipped" integer DEFAULT 0,
	"records_failed" integer DEFAULT 0,
	"load_start_time" timestamp NOT NULL,
	"load_end_time" timestamp,
	"load_duration_ms" integer,
	"load_status" varchar(20) NOT NULL,
	"error_message" text,
	"data_quality_checks" jsonb,
	"validation_errors" jsonb,
	"loaded_by" varchar(100),
	"load_type" varchar(20),
	"month_year" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contractor_metrics_monthly" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"contractor_uei" varchar(20) NOT NULL,
	"contractor_name" text NOT NULL,
	"month_year" date NOT NULL,
	"fiscal_year" integer,
	"fiscal_quarter" integer,
	"monthly_revenue" numeric(20, 2) DEFAULT '0',
	"monthly_awards" integer DEFAULT 0,
	"monthly_contracts" integer DEFAULT 0,
	"active_contracts" integer DEFAULT 0,
	"revenue_growth_mom" numeric(10, 4),
	"revenue_growth_yoy" numeric(10, 4),
	"contract_growth_mom" numeric(10, 4),
	"activity_status" varchar(20),
	"last_activity_date" date,
	"days_inactive" integer,
	"pipeline_value" numeric(20, 2) DEFAULT '0',
	"pipeline_count" integer DEFAULT 0,
	"win_rate" numeric(5, 4),
	"primary_agency" text,
	"top_agencies" jsonb,
	"agency_concentration" numeric(5, 4),
	"avg_contract_value" numeric(18, 2),
	"median_contract_value" numeric(18, 2),
	"contract_size_distribution" jsonb,
	"data_source" varchar(50) DEFAULT 'snowflake',
	"imported_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contractor_network_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prime_profile_id" uuid,
	"prime_uei" varchar(20) NOT NULL,
	"prime_name" text NOT NULL,
	"sub_profile_id" uuid,
	"sub_uei" varchar(20) NOT NULL,
	"sub_name" text NOT NULL,
	"month_year" date NOT NULL,
	"monthly_shared_revenue" numeric(20, 2) DEFAULT '0',
	"monthly_shared_contracts" integer DEFAULT 0,
	"total_historical_revenue" numeric(20, 2) DEFAULT '0',
	"total_historical_contracts" integer DEFAULT 0,
	"relationship_duration_months" integer,
	"relationship_strength_score" integer,
	"collaboration_frequency" varchar(20),
	"prime_network_size" integer,
	"sub_network_size" integer,
	"exclusivity_score" numeric(5, 4),
	"joint_win_rate" numeric(5, 4),
	"avg_contract_size" numeric(18, 2),
	"first_collaboration_date" date,
	"last_collaboration_date" date,
	"is_active" boolean DEFAULT true,
	"imported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contractor_search_index" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"entity_uei" varchar(20) NOT NULL,
	"entity_type" varchar(20) NOT NULL,
	"searchable_name" text NOT NULL,
	"display_name" text NOT NULL,
	"alternate_names" jsonb,
	"search_vector" text,
	"search_tags" jsonb,
	"search_keywords" jsonb,
	"primary_industry" text,
	"primary_agency" text,
	"location" jsonb,
	"relevance_score" integer,
	"activity_score" integer,
	"revenue_rank" integer,
	"summary" jsonb,
	"last_indexed_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contractor_universe" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"uei" varchar(20) NOT NULL,
	"legal_business_name" text NOT NULL,
	"dba_name" text,
	"registration_status" varchar(50),
	"registration_date" date,
	"expiration_date" date,
	"last_updated_date" date,
	"entity_type" varchar(100),
	"organization_structure" varchar(100),
	"state_of_incorporation" varchar(10),
	"country_of_incorporation" varchar(100),
	"physical_address" jsonb,
	"mailing_address" jsonb,
	"business_types" jsonb,
	"primary_naics" varchar(10),
	"all_naics_codes" jsonb,
	"cage_code" varchar(10),
	"duns_number" varchar(20),
	"sam_registered" boolean DEFAULT false,
	"sam_expiration_date" date,
	"first_contract_date" date,
	"last_contract_date" date,
	"lifetime_contracts" integer DEFAULT 0,
	"lifetime_revenue" numeric(20, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"is_prime" boolean DEFAULT false,
	"is_subcontractor" boolean DEFAULT false,
	"is_hybrid" boolean DEFAULT false,
	"data_source" varchar(50) DEFAULT 'snowflake',
	"imported_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contractor_universe_uei_unique" UNIQUE("uei")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "peer_comparisons_monthly" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"contractor_uei" varchar(20) NOT NULL,
	"contractor_name" text NOT NULL,
	"month_year" date NOT NULL,
	"peer_group" text NOT NULL,
	"peer_group_size" integer,
	"peer_group_criteria" jsonb,
	"revenue_percentile" integer,
	"revenue_rank" integer,
	"revenue_quartile" integer,
	"growth_percentile" integer,
	"growth_rank" integer,
	"growth_quartile" integer,
	"contract_count_percentile" integer,
	"contract_count_rank" integer,
	"win_rate_percentile" integer,
	"win_rate_rank" integer,
	"overall_performance_score" integer,
	"competitive_positioning" varchar(20),
	"peer_median_revenue" numeric(20, 2),
	"peer_avg_revenue" numeric(20, 2),
	"peer_top_quartile_revenue" numeric(20, 2),
	"percentile_change" integer,
	"trend_direction" varchar(20),
	"calculated_at" timestamp,
	"imported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "portfolio_breakdowns_monthly" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"contractor_uei" varchar(20) NOT NULL,
	"contractor_name" text NOT NULL,
	"month_year" date NOT NULL,
	"top_agencies" jsonb,
	"agency_hhi" numeric(10, 4),
	"agency_count" integer,
	"primary_agency_revenue" numeric(20, 2),
	"primary_agency_percentage" numeric(5, 2),
	"top_naics" jsonb,
	"naics_hhi" numeric(10, 4),
	"naics_count" integer,
	"primary_naics_revenue" numeric(20, 2),
	"primary_naics_percentage" numeric(5, 2),
	"top_psc" jsonb,
	"psc_hhi" numeric(10, 4),
	"psc_count" integer,
	"contract_type_distribution" jsonb,
	"concentration_risk_score" integer,
	"diversification_score" integer,
	"portfolio_stability" varchar(20),
	"expansion_opportunities" jsonb,
	"calculated_at" timestamp,
	"imported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subcontractor_metrics_monthly" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"subcontractor_uei" varchar(20) NOT NULL,
	"subcontractor_name" text NOT NULL,
	"month_year" date NOT NULL,
	"monthly_subcontract_revenue" numeric(20, 2) DEFAULT '0',
	"monthly_subcontracts" integer DEFAULT 0,
	"active_subcontracts" integer DEFAULT 0,
	"unique_primes" integer DEFAULT 0,
	"top_primes" jsonb,
	"avg_subcontract_value" numeric(18, 2),
	"subcontract_win_rate" numeric(5, 4),
	"prime_to_sub_ratio" numeric(10, 4),
	"sub_revenue_growth_mom" numeric(10, 4),
	"sub_revenue_growth_yoy" numeric(10, 4),
	"data_source" varchar(50) DEFAULT 'snowflake',
	"imported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_etl_table_name" ON "contractor_etl_metadata" ("table_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_etl_load_status" ON "contractor_etl_metadata" ("load_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_etl_month_year" ON "contractor_etl_metadata" ("month_year");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_etl_created_at" ON "contractor_etl_metadata" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_contractor_month" ON "contractor_metrics_monthly" ("contractor_uei","month_year");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_metrics_profile_id" ON "contractor_metrics_monthly" ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_metrics_month_year" ON "contractor_metrics_monthly" ("month_year");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activity_status" ON "contractor_metrics_monthly" ("activity_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_monthly_revenue" ON "contractor_metrics_monthly" ("monthly_revenue");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profile_month" ON "contractor_metrics_monthly" ("profile_id","month_year");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_month" ON "contractor_metrics_monthly" ("primary_agency","month_year");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_prime_sub_month" ON "contractor_network_metrics" ("prime_uei","sub_uei","month_year");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_network_prime_profile" ON "contractor_network_metrics" ("prime_profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_network_sub_profile" ON "contractor_network_metrics" ("sub_profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_network_month_year" ON "contractor_network_metrics" ("month_year");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_relationship_strength" ON "contractor_network_metrics" ("relationship_strength_score");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_prime_month" ON "contractor_network_metrics" ("prime_uei","month_year");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sub_month" ON "contractor_network_metrics" ("sub_uei","month_year");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_search_entity_uei_type" ON "contractor_search_index" ("entity_uei","entity_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_searchable_name" ON "contractor_search_index" ("searchable_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_search_entity_type" ON "contractor_search_index" ("entity_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_search_profile_id" ON "contractor_search_index" ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_relevance_score" ON "contractor_search_index" ("relevance_score");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_universe_uei" ON "contractor_universe" ("uei");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_universe_profile_id" ON "contractor_universe" ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_legal_business_name" ON "contractor_universe" ("legal_business_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_registration_status" ON "contractor_universe" ("registration_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_universe_primary_naics" ON "contractor_universe" ("primary_naics");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_universe_state" ON "contractor_universe" ("state_of_incorporation");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_universe_is_active" ON "contractor_universe" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_universe_is_prime" ON "contractor_universe" ("is_prime");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_universe_is_sub" ON "contractor_universe" ("is_subcontractor");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_contractor_peer_month" ON "peer_comparisons_monthly" ("contractor_uei","peer_group","month_year");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_peer_profile_id" ON "peer_comparisons_monthly" ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_peer_month_year" ON "peer_comparisons_monthly" ("month_year");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_peer_group" ON "peer_comparisons_monthly" ("peer_group");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_peer_performance_score" ON "peer_comparisons_monthly" ("overall_performance_score");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_contractor_portfolio_month" ON "portfolio_breakdowns_monthly" ("contractor_uei","month_year");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_portfolio_profile_id" ON "portfolio_breakdowns_monthly" ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_portfolio_month_year" ON "portfolio_breakdowns_monthly" ("month_year");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_concentration_risk_score" ON "portfolio_breakdowns_monthly" ("concentration_risk_score");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_diversification_score" ON "portfolio_breakdowns_monthly" ("diversification_score");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_subcontractor_month" ON "subcontractor_metrics_monthly" ("subcontractor_uei","month_year");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sub_metrics_profile_id" ON "subcontractor_metrics_monthly" ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sub_metrics_month_year" ON "subcontractor_metrics_monthly" ("month_year");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sub_monthly_revenue" ON "subcontractor_metrics_monthly" ("monthly_subcontract_revenue");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_metrics_monthly" ADD CONSTRAINT "contractor_metrics_monthly_profile_id_contractor_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "contractor_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_network_metrics" ADD CONSTRAINT "contractor_network_metrics_prime_profile_id_contractor_profiles_id_fk" FOREIGN KEY ("prime_profile_id") REFERENCES "contractor_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_network_metrics" ADD CONSTRAINT "contractor_network_metrics_sub_profile_id_contractor_profiles_id_fk" FOREIGN KEY ("sub_profile_id") REFERENCES "contractor_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_search_index" ADD CONSTRAINT "contractor_search_index_profile_id_contractor_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "contractor_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_universe" ADD CONSTRAINT "contractor_universe_profile_id_contractor_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "contractor_profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "peer_comparisons_monthly" ADD CONSTRAINT "peer_comparisons_monthly_profile_id_contractor_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "contractor_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "portfolio_breakdowns_monthly" ADD CONSTRAINT "portfolio_breakdowns_monthly_profile_id_contractor_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "contractor_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subcontractor_metrics_monthly" ADD CONSTRAINT "subcontractor_metrics_monthly_profile_id_contractor_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "contractor_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
