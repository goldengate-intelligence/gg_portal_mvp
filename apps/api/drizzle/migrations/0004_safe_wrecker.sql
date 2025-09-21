ALTER TABLE "contractor_agency_relationships" ALTER COLUMN "total_obligated" SET DATA TYPE numeric(18, 2);--> statement-breakpoint
ALTER TABLE "contractor_profiles" ALTER COLUMN "total_obligated" SET DATA TYPE numeric(20, 2);--> statement-breakpoint
ALTER TABLE "contractor_profiles" ALTER COLUMN "avg_contract_value" SET DATA TYPE numeric(18, 2);--> statement-breakpoint
ALTER TABLE "contractor_uei_mappings" ALTER COLUMN "total_obligated" SET DATA TYPE numeric(18, 2);