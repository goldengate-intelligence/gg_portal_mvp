CREATE TABLE IF NOT EXISTS "contractor_agency_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"agency" text NOT NULL,
	"sub_agency" text,
	"total_contracts" integer DEFAULT 0,
	"total_obligated" numeric(15, 2) DEFAULT '0',
	"total_ueis" integer DEFAULT 0,
	"first_contract_date" timestamp,
	"last_contract_date" timestamp,
	"relationship_strength" varchar(20),
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contractor_profile_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"total_profiles" integer DEFAULT 0,
	"total_ueis_mapped" integer DEFAULT 0,
	"total_unmapped_ueis" integer DEFAULT 0,
	"last_aggregation_run" timestamp,
	"aggregation_duration_ms" integer,
	"aggregation_status" varchar(20) DEFAULT 'idle',
	"aggregation_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contractor_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"canonical_name" text NOT NULL,
	"display_name" text NOT NULL,
	"total_ueis" integer DEFAULT 0,
	"total_contracts" integer DEFAULT 0,
	"total_obligated" numeric(18, 2) DEFAULT '0',
	"avg_contract_value" numeric(15, 2) DEFAULT '0',
	"primary_agency" text,
	"total_agencies" integer DEFAULT 0,
	"agency_diversity" integer DEFAULT 0,
	"headquarters_state" varchar(10),
	"total_states" integer DEFAULT 0,
	"states_list" jsonb DEFAULT '[]'::jsonb,
	"primary_naics_code" varchar(10),
	"primary_naics_description" text,
	"primary_industry_cluster" text,
	"industry_clusters" jsonb DEFAULT '[]'::jsonb,
	"dominant_size_tier" varchar(20),
	"dominant_lifecycle_stage" varchar(50),
	"performance_score" integer,
	"risk_score" integer,
	"growth_trend" varchar(20),
	"first_seen_date" timestamp,
	"last_active_date" timestamp,
	"profile_created_at" timestamp DEFAULT now() NOT NULL,
	"profile_updated_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"profile_completeness" integer DEFAULT 0,
	CONSTRAINT "contractor_profiles_canonical_name_unique" UNIQUE("canonical_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contractor_uei_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"contractor_cache_id" text NOT NULL,
	"uei" varchar(20) NOT NULL,
	"contractor_name" text NOT NULL,
	"total_contracts" integer DEFAULT 0,
	"total_obligated" numeric(15, 2) DEFAULT '0',
	"primary_agency" text,
	"state" varchar(10),
	"mapping_confidence" integer DEFAULT 100,
	"mapping_method" varchar(50) DEFAULT 'exact_match',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_profile_agency" ON "contractor_agency_relationships" ("profile_id","agency");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_relationship_profile_id" ON "contractor_agency_relationships" ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_relationship_agency" ON "contractor_agency_relationships" ("agency");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_canonical_name" ON "contractor_profiles" ("canonical_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_display_name" ON "contractor_profiles" ("display_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profile_total_obligated" ON "contractor_profiles" ("total_obligated");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profile_primary_agency" ON "contractor_profiles" ("primary_agency");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_headquarters_state" ON "contractor_profiles" ("headquarters_state");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_performance_score" ON "contractor_profiles" ("performance_score");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profile_search" ON "contractor_profiles" ("display_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mapping_profile_id" ON "contractor_uei_mappings" ("profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_mapping_uei" ON "contractor_uei_mappings" ("uei");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_mapping_cache_id" ON "contractor_uei_mappings" ("contractor_cache_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_agency_relationships" ADD CONSTRAINT "contractor_agency_relationships_profile_id_contractor_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "contractor_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_uei_mappings" ADD CONSTRAINT "contractor_uei_mappings_profile_id_contractor_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "contractor_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_uei_mappings" ADD CONSTRAINT "contractor_uei_mappings_contractor_cache_id_contractors_cache_id_fk" FOREIGN KEY ("contractor_cache_id") REFERENCES "contractors_cache"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
