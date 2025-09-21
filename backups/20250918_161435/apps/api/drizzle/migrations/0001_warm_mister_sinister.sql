CREATE TABLE IF NOT EXISTS "contractors_cache" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contractor_uei" varchar(20) NOT NULL,
	"contractor_name" text NOT NULL,
	"primary_agency" text,
	"primary_sub_agency_code" varchar(10),
	"country" varchar(100),
	"state" varchar(2),
	"city" text,
	"zip_code" varchar(10),
	"primary_naics_code" varchar(10),
	"primary_naics_description" text,
	"industry_cluster" text,
	"lifecycle_stage" varchar(50),
	"size_tier" varchar(20),
	"size_quartile" varchar(10),
	"peer_group_refined" text,
	"total_contracts" integer DEFAULT 0,
	"total_obligated" numeric(15, 2) DEFAULT '0',
	"agency_diversity" integer DEFAULT 0,
	"source_last_updated" timestamp,
	"cache_created_at" timestamp DEFAULT now() NOT NULL,
	"cache_updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true,
	"sync_status" varchar(20) DEFAULT 'synced',
	"sync_error" text,
	"metadata" jsonb,
	CONSTRAINT "contractors_cache_contractor_uei_unique" UNIQUE("contractor_uei")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contractors_cache_stats" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"last_sync_time" timestamp,
	"total_records" integer DEFAULT 0,
	"sync_duration_ms" integer,
	"sync_status" varchar(20) DEFAULT 'idle',
	"sync_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_contractor_name" ON "contractors_cache" ("contractor_name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_contractor_uei" ON "contractors_cache" ("contractor_uei");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_state" ON "contractors_cache" ("state");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_primary_agency" ON "contractors_cache" ("primary_agency");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_industry_cluster" ON "contractors_cache" ("industry_cluster");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_lifecycle_stage" ON "contractors_cache" ("lifecycle_stage");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_size_tier" ON "contractors_cache" ("size_tier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_total_obligated" ON "contractors_cache" ("total_obligated");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_state_industry" ON "contractors_cache" ("state","industry_cluster");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_size" ON "contractors_cache" ("primary_agency","size_tier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_naics_description" ON "contractors_cache" ("primary_naics_description");