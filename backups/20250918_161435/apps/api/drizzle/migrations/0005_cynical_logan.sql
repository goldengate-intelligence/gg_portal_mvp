CREATE TABLE IF NOT EXISTS "contractor_list_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"list_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"action" varchar(50) NOT NULL,
	"item_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contractor_list_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"list_id" uuid NOT NULL,
	"contractor_profile_id" uuid NOT NULL,
	"notes" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"rating" integer,
	"priority" varchar(20),
	"added_by" uuid NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"last_viewed_at" timestamp,
	"view_count" integer DEFAULT 0,
	"custom_data" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contractor_list_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"list_id" uuid NOT NULL,
	"shared_with_user_id" uuid,
	"shared_with_email" varchar(255),
	"permission" varchar(20) DEFAULT 'view' NOT NULL,
	"shared_by" uuid NOT NULL,
	"shared_at" timestamp DEFAULT now() NOT NULL,
	"access_token" varchar(255),
	"expires_at" timestamp,
	"last_accessed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contractor_lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"color" varchar(7),
	"icon" varchar(50),
	"sort_order" integer DEFAULT 0,
	"item_count" integer DEFAULT 0,
	"total_value" text DEFAULT '0',
	"last_item_added_at" timestamp,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activity_list_id" ON "contractor_list_activity" ("list_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activity_user_id" ON "contractor_list_activity" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_activity_created_at" ON "contractor_list_activity" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_item_list_id" ON "contractor_list_items" ("list_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_item_contractor_profile_id" ON "contractor_list_items" ("contractor_profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_item_added_by" ON "contractor_list_items" ("added_by");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_unique_contractor_per_list" ON "contractor_list_items" ("list_id","contractor_profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_share_list_id" ON "contractor_list_shares" ("list_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_share_shared_with_user_id" ON "contractor_list_shares" ("shared_with_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_share_access_token" ON "contractor_list_shares" ("access_token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_list_user_id" ON "contractor_lists" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_list_is_default" ON "contractor_lists" ("is_default");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_list_is_public" ON "contractor_lists" ("is_public");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_unique_default_per_user" ON "contractor_lists" ("user_id","is_default");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_list_activity" ADD CONSTRAINT "contractor_list_activity_list_id_contractor_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "contractor_lists"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_list_activity" ADD CONSTRAINT "contractor_list_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_list_items" ADD CONSTRAINT "contractor_list_items_list_id_contractor_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "contractor_lists"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_list_items" ADD CONSTRAINT "contractor_list_items_contractor_profile_id_contractor_profiles_id_fk" FOREIGN KEY ("contractor_profile_id") REFERENCES "contractor_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_list_items" ADD CONSTRAINT "contractor_list_items_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_list_shares" ADD CONSTRAINT "contractor_list_shares_list_id_contractor_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "contractor_lists"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_list_shares" ADD CONSTRAINT "contractor_list_shares_shared_with_user_id_users_id_fk" FOREIGN KEY ("shared_with_user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_list_shares" ADD CONSTRAINT "contractor_list_shares_shared_by_users_id_fk" FOREIGN KEY ("shared_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_lists" ADD CONSTRAINT "contractor_lists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
