import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, index, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenants";
import { users, userOrganizations } from "./users";
import { organizations } from "./organizations";

// User-owned agents (managed through Agent Taskflow)
export const userAgents = pgTable("user_agents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  atfAgentId: varchar("atf_agent_id", { length: 255 }).notNull().unique(), // Agent Taskflow agent ID
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  agentType: varchar("agent_type", { length: 100 }),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  configuration: jsonb("configuration").default("{}"),
  capabilities: jsonb("capabilities").default("{}"),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_agents_user_idx").on(table.userId),
  orgIdx: index("user_agents_org_idx").on(table.organizationId),
  tenantIdx: index("user_agents_tenant_idx").on(table.tenantId),
  atfIdIdx: index("user_agents_atf_id_idx").on(table.atfAgentId),
  statusIdx: index("user_agents_status_idx").on(table.status),
  typeIdx: index("user_agents_type_idx").on(table.agentType),
}));

// System-level agents (for MCP server)
export const agents = pgTable("agents", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  capabilities: jsonb("capabilities").default("{}"),
  configuration: jsonb("configuration").default("{}"),
  apiKeyHash: text("api_key_hash"),
  rateLimit: integer("rate_limit").default(60),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("agents_tenant_idx").on(table.tenantId),
  statusIdx: index("agents_status_idx").on(table.status),
}));

// Agent executions (for user agents via ATF)
export const agentExecutions = pgTable("agent_executions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userAgentId: uuid("user_agent_id").notNull().references(() => userAgents.id, { onDelete: "cascade" }),
  atfExecutionId: varchar("atf_execution_id", { length: 255 }).notNull().unique(),
  taskName: varchar("task_name", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull(),
  inputParams: jsonb("input_params").default("{}"),
  outputResults: jsonb("output_results").default("{}"),
  executionContext: jsonb("execution_context").default("{}"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  durationMs: integer("duration_ms"),
}, (table) => ({
  userAgentIdx: index("agent_executions_user_agent_idx").on(table.userAgentId),
  atfIdIdx: index("agent_executions_atf_id_idx").on(table.atfExecutionId),
  statusIdx: index("agent_executions_status_idx").on(table.status),
  startedIdx: index("agent_executions_started_idx").on(table.startedAt),
}));

// Agent permissions
export const agentPermissions = pgTable("agent_permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentId: uuid("agent_id"),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  scope: varchar("scope", { length: 50 }).notNull(),
  resources: jsonb("resources").default("{}"),
  tools: jsonb("tools").default("{}"),
  rateLimit: integer("rate_limit"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  agentIdx: index("agent_permissions_agent_idx").on(table.agentId),
  tenantIdx: index("agent_permissions_tenant_idx").on(table.tenantId),
}));

// Agent sessions
export const agentSessions = pgTable("agent_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentId: uuid("agent_id").notNull(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  transportType: varchar("transport_type", { length: 50 }),
  connectionInfo: jsonb("connection_info").default("{}"),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
  disconnectedAt: timestamp("disconnected_at"),
  lastHeartbeat: timestamp("last_heartbeat").defaultNow().notNull(),
}, (table) => ({
  agentIdx: index("agent_sessions_agent_idx").on(table.agentId),
  tokenIdx: index("agent_sessions_token_idx").on(table.sessionToken),
}));

// Agent workflows
export const agentWorkflows = pgTable("agent_workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  steps: jsonb("steps").notNull(),
  triggers: jsonb("triggers").default("{}"),
  conditions: jsonb("conditions").default("{}"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("agent_workflows_tenant_idx").on(table.tenantId),
  activeIdx: index("agent_workflows_active_idx").on(table.isActive),
}));

// Workflow executions
export const workflowExecutions = pgTable("workflow_executions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workflowId: uuid("workflow_id").notNull().references(() => agentWorkflows.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  inputParams: jsonb("input_params").default("{}"),
  outputResults: jsonb("output_results").default("{}"),
  executionContext: jsonb("execution_context").default("{}"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  durationMs: integer("duration_ms"),
}, (table) => ({
  workflowIdx: index("workflow_executions_workflow_idx").on(table.workflowId),
  agentIdx: index("workflow_executions_agent_idx").on(table.agentId),
  statusIdx: index("workflow_executions_status_idx").on(table.status),
}));

// Workflow logs
export const workflowLogs = pgTable("workflow_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  executionId: uuid("execution_id").notNull().references(() => workflowExecutions.id, { onDelete: "cascade" }),
  stepName: varchar("step_name", { length: 255 }),
  logLevel: varchar("log_level", { length: 20 }).notNull(),
  message: text("message"),
  data: jsonb("data").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  executionIdx: index("workflow_logs_execution_idx").on(table.executionId),
}));

// Agent audit log
export const agentAuditLog = pgTable("agent_audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentId: uuid("agent_id"), // For system agents
  userAgentId: uuid("user_agent_id").references(() => userAgents.id, { onDelete: "cascade" }), // For user agents
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 100 }),
  resource: varchar("resource", { length: 255 }),
  parameters: jsonb("parameters").default("{}"),
  result: jsonb("result").default("{}"),
  durationMs: integer("duration_ms"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  agentIdx: index("agent_audit_agent_idx").on(table.agentId),
  userAgentIdx: index("agent_audit_user_agent_idx").on(table.userAgentId),
  tenantIdx: index("agent_audit_tenant_idx").on(table.tenantId),
  actionIdx: index("agent_audit_action_idx").on(table.action),
  createdIdx: index("agent_audit_created_idx").on(table.createdAt),
}));

// Relations
export const userAgentsRelations = relations(userAgents, ({ one, many }) => ({
  user: one(users, {
    fields: [userAgents.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [userAgents.organizationId],
    references: [organizations.id],
  }),
  tenant: one(tenants, {
    fields: [userAgents.tenantId],
    references: [tenants.id],
  }),
  executions: many(agentExecutions),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [agents.tenantId],
    references: [tenants.id],
  }),
  permissions: many(agentPermissions),
  sessions: many(agentSessions),
}));

export const agentExecutionsRelations = relations(agentExecutions, ({ one }) => ({
  userAgent: one(userAgents, {
    fields: [agentExecutions.userAgentId],
    references: [userAgents.id],
  }),
}));

export const agentWorkflowsRelations = relations(agentWorkflows, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [agentWorkflows.tenantId],
    references: [tenants.id],
  }),
  executions: many(workflowExecutions),
}));

export const workflowExecutionsRelations = relations(workflowExecutions, ({ one, many }) => ({
  workflow: one(agentWorkflows, {
    fields: [workflowExecutions.workflowId],
    references: [agentWorkflows.id],
  }),
  logs: many(workflowLogs),
}));

export const workflowLogsRelations = relations(workflowLogs, ({ one }) => ({
  execution: one(workflowExecutions, {
    fields: [workflowLogs.executionId],
    references: [workflowExecutions.id],
  }),
}));

// Type exports
export type UserAgent = typeof userAgents.$inferSelect;
export type NewUserAgent = typeof userAgents.$inferInsert;
export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
export type AgentExecution = typeof agentExecutions.$inferSelect;
export type NewAgentExecution = typeof agentExecutions.$inferInsert;
export type AgentPermission = typeof agentPermissions.$inferSelect;
export type NewAgentPermission = typeof agentPermissions.$inferInsert;
export type AgentSession = typeof agentSessions.$inferSelect;
export type NewAgentSession = typeof agentSessions.$inferInsert;
export type AgentWorkflow = typeof agentWorkflows.$inferSelect;
export type NewAgentWorkflow = typeof agentWorkflows.$inferInsert;
export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
export type NewWorkflowExecution = typeof workflowExecutions.$inferInsert;
export type WorkflowLog = typeof workflowLogs.$inferSelect;
export type NewWorkflowLog = typeof workflowLogs.$inferInsert;
export type AgentAuditLog = typeof agentAuditLog.$inferSelect;
export type NewAgentAuditLog = typeof agentAuditLog.$inferInsert;