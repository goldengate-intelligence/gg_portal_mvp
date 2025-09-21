import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }),
  plan: varchar("plan", { length: 50 }).default("trial").notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  settings: jsonb("settings").default("{}"),
  maxUsers: integer("max_users").default(5),
  maxOrganizations: integer("max_organizations").default(100),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("tenants_slug_idx").on(table.slug),
  statusIdx: index("tenants_status_idx").on(table.status),
  planIdx: index("tenants_plan_idx").on(table.plan),
}));

// Type exports for TypeScript
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;