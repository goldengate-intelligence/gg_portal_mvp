import { pgTable, uuid, varchar, text, timestamp, integer, decimal, date, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenants";
import { userOrganizations } from "./users";

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  sector: varchar("sector", { length: 100 }),
  location: varchar("location", { length: 255 }),
  state: varchar("state", { length: 50 }),
  description: text("description"),
  logoUrl: text("logo_url"),
  website: varchar("website", { length: 255 }),
  employeeCount: integer("employee_count"),
  foundedYear: integer("founded_year"),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  lifecycleStage: varchar("lifecycle_stage", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("org_tenant_idx").on(table.tenantId),
  nameIdx: index("org_name_idx").on(table.name),
  sectorIdx: index("org_sector_idx").on(table.sector),
  statusIdx: index("org_status_idx").on(table.status),
}));

export const contracts = pgTable("contracts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  value: decimal("value", { precision: 15, scale: 2 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  status: varchar("status", { length: 50 }).notNull(),
  type: varchar("type", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantOrgIdx: index("contract_tenant_org_idx").on(table.tenantId, table.organizationId),
  statusIdx: index("contract_status_idx").on(table.status),
  datesIdx: index("contract_dates_idx").on(table.startDate, table.endDate),
}));

export const contractItems = pgTable("contract_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  contractId: uuid("contract_id").notNull().references(() => contracts.id, { onDelete: "cascade" }),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }),
  quantity: integer("quantity").default(1),
  unit: varchar("unit", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  contractIdx: index("contract_items_contract_idx").on(table.contractId),
}));

export const metrics = pgTable("metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  metricType: varchar("metric_type", { length: 50 }).notNull(),
  value: decimal("value", { precision: 15, scale: 2 }),
  unit: varchar("unit", { length: 20 }),
  period: varchar("period", { length: 20 }),
  date: date("date"),
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tenantOrgIdx: index("metrics_tenant_org_idx").on(table.tenantId, table.organizationId),
  typeDateIdx: index("metrics_type_date_idx").on(table.metricType, table.date),
}));

export const deployments = pgTable("deployments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  deploymentType: varchar("deployment_type", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull(),
  targetDate: date("target_date"),
  completedDate: date("completed_date"),
  notes: text("notes"),
  configuration: jsonb("configuration").default("{}"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantOrgIdx: index("deployments_tenant_org_idx").on(table.tenantId, table.organizationId),
  statusIdx: index("deployments_status_idx").on(table.status),
  datesIdx: index("deployments_dates_idx").on(table.targetDate, table.completedDate),
}));

export const deploymentLogs = pgTable("deployment_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  deploymentId: uuid("deployment_id").notNull().references(() => deployments.id, { onDelete: "cascade" }),
  logLevel: varchar("log_level", { length: 20 }).notNull(),
  message: text("message"),
  context: jsonb("context").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  deploymentIdx: index("deployment_logs_deployment_idx").on(table.deploymentId),
  levelIdx: index("deployment_logs_level_idx").on(table.logLevel),
}));

// Relations
export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [organizations.tenantId],
    references: [tenants.id],
  }),
  contracts: many(contracts),
  metrics: many(metrics),
  deployments: many(deployments),
  users: many(userOrganizations),
}));

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [contracts.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [contracts.organizationId],
    references: [organizations.id],
  }),
  items: many(contractItems),
}));

export const contractItemsRelations = relations(contractItems, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractItems.contractId],
    references: [contracts.id],
  }),
}));

export const metricsRelations = relations(metrics, ({ one }) => ({
  tenant: one(tenants, {
    fields: [metrics.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [metrics.organizationId],
    references: [organizations.id],
  }),
}));

export const deploymentsRelations = relations(deployments, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [deployments.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [deployments.organizationId],
    references: [organizations.id],
  }),
  logs: many(deploymentLogs),
}));

export const deploymentLogsRelations = relations(deploymentLogs, ({ one }) => ({
  deployment: one(deployments, {
    fields: [deploymentLogs.deploymentId],
    references: [deployments.id],
  }),
}));

// Type exports
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;
export type ContractItem = typeof contractItems.$inferSelect;
export type NewContractItem = typeof contractItems.$inferInsert;
export type Metric = typeof metrics.$inferSelect;
export type NewMetric = typeof metrics.$inferInsert;
export type Deployment = typeof deployments.$inferSelect;
export type NewDeployment = typeof deployments.$inferInsert;
export type DeploymentLog = typeof deploymentLogs.$inferSelect;
export type NewDeploymentLog = typeof deploymentLogs.$inferInsert;