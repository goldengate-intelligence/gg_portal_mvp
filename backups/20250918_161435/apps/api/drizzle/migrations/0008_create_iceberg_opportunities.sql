-- Create iceberg opportunities table
CREATE TABLE IF NOT EXISTS "contractor_iceberg_opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"contractor_uei" varchar(20) NOT NULL,
	"contractor_name" text NOT NULL,
	"prime_revenue" numeric(20, 2) DEFAULT '0',
	"subcontractor_revenue" numeric(20, 2) DEFAULT '0',
	"total_revenue" numeric(20, 2) DEFAULT '0',
	"sub_to_prime_ratio" numeric(10, 4),
	"hidden_revenue_percentage" numeric(5, 2),
	"iceberg_score" integer,
	"opportunity_tier" varchar(20),
	"scale_tier" varchar(20),
	"entity_type" varchar(20),
	"primary_industry" text,
	"primary_agencies" jsonb,
	"business_types" jsonb,
	"location" jsonb,
	"is_active" boolean DEFAULT true,
	"last_activity_date" date,
	"potential_prime_value" numeric(20, 2),
	"competitive_advantages" jsonb,
	"risk_factors" jsonb,
	"analysis_date" date,
	"last_updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_iceberg_opportunities" ADD CONSTRAINT "contractor_iceberg_opportunities_profile_id_contractor_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "contractor_profiles"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_iceberg_contractor_uei" ON "contractor_iceberg_opportunities" ("contractor_uei");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_iceberg_score" ON "contractor_iceberg_opportunities" ("iceberg_score");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_opportunity_tier" ON "contractor_iceberg_opportunities" ("opportunity_tier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sub_to_prime_ratio" ON "contractor_iceberg_opportunities" ("sub_to_prime_ratio");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_iceberg_profile_id" ON "contractor_iceberg_opportunities" ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_iceberg_scale_tier" ON "contractor_iceberg_opportunities" ("scale_tier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_iceberg_entity_type" ON "contractor_iceberg_opportunities" ("entity_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_iceberg_is_active" ON "contractor_iceberg_opportunities" ("is_active");