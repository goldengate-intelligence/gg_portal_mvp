CREATE TABLE IF NOT EXISTS "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"domain" varchar(255),
	"plan" varchar(50) DEFAULT 'trial' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"settings" jsonb DEFAULT '{}',
	"max_users" integer DEFAULT 5,
	"max_organizations" integer DEFAULT 100,
	"trial_ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"is_primary" boolean DEFAULT false,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bio" text,
	"avatar_url" text,
	"phone" varchar(50),
	"timezone" varchar(50),
	"preferences" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"device_info" jsonb DEFAULT '{}',
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_activity" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"is_default" boolean DEFAULT false,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(50) NOT NULL,
	"full_name" varchar(255),
	"password_hash" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"email_verified_at" timestamp,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contract_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"amount" numeric(15, 2),
	"quantity" integer DEFAULT 1,
	"unit" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"organization_id" uuid,
	"title" varchar(255) NOT NULL,
	"value" numeric(15, 2),
	"start_date" date,
	"end_date" date,
	"status" varchar(50) NOT NULL,
	"type" varchar(100),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deployment_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deployment_id" uuid NOT NULL,
	"log_level" varchar(20) NOT NULL,
	"message" text,
	"context" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deployments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"organization_id" uuid,
	"deployment_type" varchar(100),
	"status" varchar(50) NOT NULL,
	"target_date" date,
	"completed_date" date,
	"notes" text,
	"configuration" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"organization_id" uuid,
	"metric_type" varchar(50) NOT NULL,
	"value" numeric(15, 2),
	"unit" varchar(20),
	"period" varchar(20),
	"date" date,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"sector" varchar(100),
	"location" varchar(255),
	"state" varchar(50),
	"description" text,
	"logo_url" text,
	"website" varchar(255),
	"employee_count" integer,
	"founded_year" integer,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"lifecycle_stage" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid,
	"user_agent_id" uuid,
	"tenant_id" uuid,
	"action" varchar(100),
	"resource" varchar(255),
	"parameters" jsonb DEFAULT '{}',
	"result" jsonb DEFAULT '{}',
	"duration_ms" integer,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_agent_id" uuid NOT NULL,
	"atf_execution_id" varchar(255) NOT NULL,
	"task_name" varchar(255),
	"status" varchar(50) NOT NULL,
	"input_params" jsonb DEFAULT '{}',
	"output_results" jsonb DEFAULT '{}',
	"execution_context" jsonb DEFAULT '{}',
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"duration_ms" integer,
	CONSTRAINT "agent_executions_atf_execution_id_unique" UNIQUE("atf_execution_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid,
	"tenant_id" uuid,
	"scope" varchar(50) NOT NULL,
	"resources" jsonb DEFAULT '{}',
	"tools" jsonb DEFAULT '{}',
	"rate_limit" integer,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"transport_type" varchar(50),
	"connection_info" jsonb DEFAULT '{}',
	"connected_at" timestamp DEFAULT now() NOT NULL,
	"disconnected_at" timestamp,
	"last_heartbeat" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agent_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"steps" jsonb NOT NULL,
	"triggers" jsonb DEFAULT '{}',
	"conditions" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"capabilities" jsonb DEFAULT '{}',
	"configuration" jsonb DEFAULT '{}',
	"api_key_hash" text,
	"rate_limit" integer DEFAULT 60,
	"last_active_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"atf_agent_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"agent_type" varchar(100),
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"configuration" jsonb DEFAULT '{}',
	"capabilities" jsonb DEFAULT '{}',
	"last_active_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_agents_atf_agent_id_unique" UNIQUE("atf_agent_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"status" varchar(50) NOT NULL,
	"input_params" jsonb DEFAULT '{}',
	"output_results" jsonb DEFAULT '{}',
	"execution_context" jsonb DEFAULT '{}',
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"duration_ms" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execution_id" uuid NOT NULL,
	"step_name" varchar(255),
	"log_level" varchar(20) NOT NULL,
	"message" text,
	"data" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauth_access_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"token_type" varchar(20) DEFAULT 'Bearer',
	"client_id" uuid,
	"user_id" uuid,
	"agent_id" uuid,
	"scopes" jsonb NOT NULL,
	"audience" jsonb,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_access_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauth_authorization_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(255) NOT NULL,
	"client_id" uuid,
	"user_id" uuid,
	"redirect_uri" text NOT NULL,
	"scopes" jsonb NOT NULL,
	"code_challenge" varchar(255),
	"code_challenge_method" varchar(10),
	"nonce" varchar(255),
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_authorization_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauth_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" varchar(255) NOT NULL,
	"client_secret" text NOT NULL,
	"tenant_id" uuid,
	"name" varchar(255) NOT NULL,
	"redirect_uris" jsonb NOT NULL,
	"grant_types" jsonb NOT NULL,
	"response_types" jsonb NOT NULL,
	"scopes" jsonb NOT NULL,
	"client_type" varchar(20) NOT NULL,
	"token_endpoint_auth_method" varchar(50) DEFAULT 'client_secret_basic',
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_clients_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauth_refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"access_token_id" uuid,
	"client_id" uuid,
	"user_id" uuid,
	"scopes" jsonb NOT NULL,
	"expires_at" timestamp,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"resource" varchar(100) NOT NULL,
	"action" varchar(50) NOT NULL,
	"conditions" jsonb DEFAULT '{}',
	"effect" varchar(10) DEFAULT 'allow' NOT NULL,
	"priority" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "policies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid,
	"policy_id" uuid,
	"tenant_id" uuid,
	"custom_conditions" jsonb DEFAULT '{}',
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false,
	"is_default" boolean DEFAULT false,
	"max_users" integer,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"role_id" uuid,
	"tenant_id" uuid,
	"granted_by" uuid,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credit_adjustments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"type" varchar(20) NOT NULL,
	"reason" varchar(100),
	"description" text,
	"applied_to_invoice_id" uuid,
	"created_by" uuid,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoice_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"description" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_amount" numeric(10, 2) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"subscription_id" uuid,
	"invoice_number" varchar(50) NOT NULL,
	"status" varchar(20) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0',
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"amount_paid" numeric(10, 2) DEFAULT '0',
	"amount_due" numeric(10, 2) NOT NULL,
	"due_date" timestamp,
	"paid_at" timestamp,
	"period_start" timestamp,
	"period_end" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_payment_method_id" varchar(255) NOT NULL,
	"is_default" boolean DEFAULT false,
	"card_brand" varchar(20),
	"card_last4" varchar(4),
	"card_exp_month" integer,
	"card_exp_year" integer,
	"bank_name" varchar(100),
	"bank_last4" varchar(4),
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid,
	"payment_method_id" uuid,
	"transaction_id" varchar(255) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_transaction_id" varchar(255),
	"type" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"processing_fee" numeric(10, 2) DEFAULT '0',
	"net_amount" numeric(10, 2) NOT NULL,
	"failure_code" varchar(50),
	"failure_message" text,
	"processed_at" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_transactions_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"billing_interval" varchar(20) NOT NULL,
	"features" jsonb DEFAULT '{}',
	"limits" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_plans_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenant_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"status" varchar(50) NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false,
	"canceled_at" timestamp,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "usage_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"organization_id" uuid,
	"user_id" uuid,
	"metric_name" varchar(100) NOT NULL,
	"quantity" numeric(15, 4) NOT NULL,
	"unit" varchar(20),
	"timestamp" timestamp NOT NULL,
	"aggregation_period" varchar(20),
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenants_slug_idx" ON "tenants" ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenants_status_idx" ON "tenants" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenants_plan_idx" ON "tenants" ("plan");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_orgs_user_org_idx" ON "user_organizations" ("user_id","organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_orgs_user_idx" ON "user_organizations" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_orgs_org_idx" ON "user_organizations" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_orgs_tenant_idx" ON "user_organizations" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_orgs_primary_idx" ON "user_organizations" ("user_id","is_primary");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_sessions_user_idx" ON "user_sessions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_sessions_token_idx" ON "user_sessions" ("session_token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_sessions_expires_idx" ON "user_sessions" ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_tenants_user_tenant_idx" ON "user_tenants" ("user_id","tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_tenants_user_idx" ON "user_tenants" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_tenants_tenant_idx" ON "user_tenants" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_username_idx" ON "users" ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_active_idx" ON "users" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contract_items_contract_idx" ON "contract_items" ("contract_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contract_tenant_org_idx" ON "contracts" ("tenant_id","organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contract_status_idx" ON "contracts" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contract_dates_idx" ON "contracts" ("start_date","end_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deployment_logs_deployment_idx" ON "deployment_logs" ("deployment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deployment_logs_level_idx" ON "deployment_logs" ("log_level");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deployments_tenant_org_idx" ON "deployments" ("tenant_id","organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deployments_status_idx" ON "deployments" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deployments_dates_idx" ON "deployments" ("target_date","completed_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "metrics_tenant_org_idx" ON "metrics" ("tenant_id","organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "metrics_type_date_idx" ON "metrics" ("metric_type","date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_tenant_idx" ON "organizations" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_name_idx" ON "organizations" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_sector_idx" ON "organizations" ("sector");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "org_status_idx" ON "organizations" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_audit_agent_idx" ON "agent_audit_log" ("agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_audit_user_agent_idx" ON "agent_audit_log" ("user_agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_audit_tenant_idx" ON "agent_audit_log" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_audit_action_idx" ON "agent_audit_log" ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_audit_created_idx" ON "agent_audit_log" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_executions_user_agent_idx" ON "agent_executions" ("user_agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_executions_atf_id_idx" ON "agent_executions" ("atf_execution_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_executions_status_idx" ON "agent_executions" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_executions_started_idx" ON "agent_executions" ("started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_permissions_agent_idx" ON "agent_permissions" ("agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_permissions_tenant_idx" ON "agent_permissions" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_sessions_agent_idx" ON "agent_sessions" ("agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_sessions_token_idx" ON "agent_sessions" ("session_token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_workflows_tenant_idx" ON "agent_workflows" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_workflows_active_idx" ON "agent_workflows" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agents_tenant_idx" ON "agents" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agents_status_idx" ON "agents" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_agents_user_idx" ON "user_agents" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_agents_org_idx" ON "user_agents" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_agents_tenant_idx" ON "user_agents" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_agents_atf_id_idx" ON "user_agents" ("atf_agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_agents_status_idx" ON "user_agents" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_agents_type_idx" ON "user_agents" ("agent_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_executions_workflow_idx" ON "workflow_executions" ("workflow_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_executions_agent_idx" ON "workflow_executions" ("agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_executions_status_idx" ON "workflow_executions" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_logs_execution_idx" ON "workflow_logs" ("execution_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oauth_tokens_token_idx" ON "oauth_access_tokens" ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oauth_tokens_user_idx" ON "oauth_access_tokens" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oauth_tokens_expires_idx" ON "oauth_access_tokens" ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "policies_resource_action_idx" ON "policies" ("resource","action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "policies_effect_idx" ON "policies" ("effect");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "role_policies_role_policy_idx" ON "role_policies" ("role_id","policy_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_policies_role_idx" ON "role_policies" ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "roles_tenant_name_idx" ON "roles" ("tenant_id","name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "roles_is_default_idx" ON "roles" ("is_default");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_roles_user_role_tenant_idx" ON "user_roles" ("user_id","role_id","tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_roles_user_tenant_idx" ON "user_roles" ("user_id","tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "credit_adjustments_tenant_idx" ON "credit_adjustments" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "credit_adjustments_type_idx" ON "credit_adjustments" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "credit_adjustments_invoice_idx" ON "credit_adjustments" ("applied_to_invoice_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_line_items_invoice_idx" ON "invoice_line_items" ("invoice_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoices_tenant_idx" ON "invoices" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoices_status_idx" ON "invoices" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoices_due_date_idx" ON "invoices" ("due_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoices_number_idx" ON "invoices" ("invoice_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_methods_tenant_idx" ON "payment_methods" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_methods_default_idx" ON "payment_methods" ("is_default");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_methods_provider_idx" ON "payment_methods" ("provider","provider_payment_method_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_transactions_tenant_idx" ON "payment_transactions" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_transactions_invoice_idx" ON "payment_transactions" ("invoice_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_transactions_status_idx" ON "payment_transactions" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_transactions_transaction_idx" ON "payment_transactions" ("transaction_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_transactions_provider_idx" ON "payment_transactions" ("provider","provider_transaction_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscription_plans_name_idx" ON "subscription_plans" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscription_plans_active_idx" ON "subscription_plans" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_subscriptions_tenant_idx" ON "tenant_subscriptions" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_subscriptions_status_idx" ON "tenant_subscriptions" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenant_subscriptions_period_idx" ON "tenant_subscriptions" ("current_period_start","current_period_end");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usage_records_tenant_metric_idx" ON "usage_records" ("tenant_id","metric_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usage_records_timestamp_idx" ON "usage_records" ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usage_records_org_idx" ON "usage_records" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usage_records_user_idx" ON "usage_records" ("user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_tenants" ADD CONSTRAINT "user_tenants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_tenants" ADD CONSTRAINT "user_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contract_items" ADD CONSTRAINT "contract_items_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contracts" ADD CONSTRAINT "contracts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contracts" ADD CONSTRAINT "contracts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deployment_logs" ADD CONSTRAINT "deployment_logs_deployment_id_deployments_id_fk" FOREIGN KEY ("deployment_id") REFERENCES "deployments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deployments" ADD CONSTRAINT "deployments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deployments" ADD CONSTRAINT "deployments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "metrics" ADD CONSTRAINT "metrics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "metrics" ADD CONSTRAINT "metrics_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organizations" ADD CONSTRAINT "organizations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_audit_log" ADD CONSTRAINT "agent_audit_log_user_agent_id_user_agents_id_fk" FOREIGN KEY ("user_agent_id") REFERENCES "user_agents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_audit_log" ADD CONSTRAINT "agent_audit_log_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_executions" ADD CONSTRAINT "agent_executions_user_agent_id_user_agents_id_fk" FOREIGN KEY ("user_agent_id") REFERENCES "user_agents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_permissions" ADD CONSTRAINT "agent_permissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_workflows" ADD CONSTRAINT "agent_workflows_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agents" ADD CONSTRAINT "agents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_agents" ADD CONSTRAINT "user_agents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_agents" ADD CONSTRAINT "user_agents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_agents" ADD CONSTRAINT "user_agents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_workflow_id_agent_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "agent_workflows"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_logs" ADD CONSTRAINT "workflow_logs_execution_id_workflow_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "workflow_executions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_access_tokens" ADD CONSTRAINT "oauth_access_tokens_client_id_oauth_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "oauth_clients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_access_tokens" ADD CONSTRAINT "oauth_access_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_authorization_codes" ADD CONSTRAINT "oauth_authorization_codes_client_id_oauth_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "oauth_clients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_authorization_codes" ADD CONSTRAINT "oauth_authorization_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_clients" ADD CONSTRAINT "oauth_clients_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_refresh_tokens" ADD CONSTRAINT "oauth_refresh_tokens_access_token_id_oauth_access_tokens_id_fk" FOREIGN KEY ("access_token_id") REFERENCES "oauth_access_tokens"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_refresh_tokens" ADD CONSTRAINT "oauth_refresh_tokens_client_id_oauth_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "oauth_clients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_refresh_tokens" ADD CONSTRAINT "oauth_refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_policies" ADD CONSTRAINT "role_policies_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_policies" ADD CONSTRAINT "role_policies_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "policies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_policies" ADD CONSTRAINT "role_policies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credit_adjustments" ADD CONSTRAINT "credit_adjustments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credit_adjustments" ADD CONSTRAINT "credit_adjustments_applied_to_invoice_id_invoices_id_fk" FOREIGN KEY ("applied_to_invoice_id") REFERENCES "invoices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credit_adjustments" ADD CONSTRAINT "credit_adjustments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_tenant_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "tenant_subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "tenant_subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "tenant_subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
