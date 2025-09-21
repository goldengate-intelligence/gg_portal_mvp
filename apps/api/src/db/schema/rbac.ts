import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, index, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenants";
import { users } from "./users";

// RBAC tables
export const policies = pgTable("policies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  resource: varchar("resource", { length: 100 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  conditions: jsonb("conditions").default("{}"),
  effect: varchar("effect", { length: 10 }).default("allow").notNull(),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  resourceActionIdx: index("policies_resource_action_idx").on(table.resource, table.action),
  effectIdx: index("policies_effect_idx").on(table.effect),
}));

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isSystem: boolean("is_system").default(false),
  isDefault: boolean("is_default").default(false),
  maxUsers: integer("max_users"),
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantNameIdx: uniqueIndex("roles_tenant_name_idx").on(table.tenantId, table.name),
  isDefaultIdx: index("roles_is_default_idx").on(table.isDefault),
}));

export const rolePolicies = pgTable("role_policies", {
  id: uuid("id").defaultRandom().primaryKey(),
  roleId: uuid("role_id").references(() => roles.id, { onDelete: "cascade" }),
  policyId: uuid("policy_id").references(() => policies.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  customConditions: jsonb("custom_conditions").default("{}"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  rolePolicyIdx: uniqueIndex("role_policies_role_policy_idx").on(table.roleId, table.policyId),
  roleIdx: index("role_policies_role_idx").on(table.roleId),
}));

export const userRoles = pgTable("user_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  roleId: uuid("role_id").references(() => roles.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  grantedBy: uuid("granted_by").references(() => users.id),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userRoleTenantIdx: uniqueIndex("user_roles_user_role_tenant_idx").on(table.userId, table.roleId, table.tenantId),
  userTenantIdx: index("user_roles_user_tenant_idx").on(table.userId, table.tenantId),
}));

// Type exports
export type Policy = typeof policies.$inferSelect;
export type NewPolicy = typeof policies.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type RolePolicy = typeof rolePolicies.$inferSelect;
export type NewRolePolicy = typeof rolePolicies.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;