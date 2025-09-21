import { pgTable, uuid, varchar, text, timestamp, decimal, integer, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenants";
import { users } from "./users";
import { organizations } from "./organizations";

// Subscription plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  billingInterval: varchar("billing_interval", { length: 20 }).notNull(), // monthly, annually
  features: jsonb("features").default("{}"),
  limits: jsonb("limits").default("{}"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  nameIdx: index("subscription_plans_name_idx").on(table.name),
  activeIdx: index("subscription_plans_active_idx").on(table.isActive),
}));

// Tenant subscriptions
export const tenantSubscriptions = pgTable("tenant_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  planId: uuid("plan_id").notNull().references(() => subscriptionPlans.id),
  status: varchar("status", { length: 50 }).notNull(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  canceledAt: timestamp("canceled_at"),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("tenant_subscriptions_tenant_idx").on(table.tenantId),
  statusIdx: index("tenant_subscriptions_status_idx").on(table.status),
  periodIdx: index("tenant_subscriptions_period_idx").on(table.currentPeriodStart, table.currentPeriodEnd),
}));

// Invoices
export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  subscriptionId: uuid("subscription_id").references(() => tenantSubscriptions.id),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  status: varchar("status", { length: 20 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).default("0"),
  amountDue: decimal("amount_due", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("invoices_tenant_idx").on(table.tenantId),
  statusIdx: index("invoices_status_idx").on(table.status),
  dueDateIdx: index("invoices_due_date_idx").on(table.dueDate),
  numberIdx: index("invoices_number_idx").on(table.invoiceNumber),
}));

// Invoice line items
export const invoiceLineItems = pgTable("invoice_line_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitAmount: decimal("unit_amount", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  invoiceIdx: index("invoice_line_items_invoice_idx").on(table.invoiceId),
}));

// Payment methods
export const paymentMethods = pgTable("payment_methods", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // card, bank_account, etc.
  provider: varchar("provider", { length: 50 }).notNull(), // stripe, etc.
  providerPaymentMethodId: varchar("provider_payment_method_id", { length: 255 }).notNull(),
  isDefault: boolean("is_default").default(false),
  cardBrand: varchar("card_brand", { length: 20 }),
  cardLast4: varchar("card_last4", { length: 4 }),
  cardExpMonth: integer("card_exp_month"),
  cardExpYear: integer("card_exp_year"),
  bankName: varchar("bank_name", { length: 100 }),
  bankLast4: varchar("bank_last4", { length: 4 }),
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("payment_methods_tenant_idx").on(table.tenantId),
  defaultIdx: index("payment_methods_default_idx").on(table.isDefault),
  providerIdx: index("payment_methods_provider_idx").on(table.provider, table.providerPaymentMethodId),
}));

// Payment transactions
export const paymentTransactions = pgTable("payment_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  paymentMethodId: uuid("payment_method_id").references(() => paymentMethods.id),
  transactionId: varchar("transaction_id", { length: 255 }).notNull().unique(),
  provider: varchar("provider", { length: 50 }).notNull(),
  providerTransactionId: varchar("provider_transaction_id", { length: 255 }),
  type: varchar("type", { length: 20 }).notNull(), // payment, refund, dispute
  status: varchar("status", { length: 20 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  processingFee: decimal("processing_fee", { precision: 10, scale: 2 }).default("0"),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  failureCode: varchar("failure_code", { length: 50 }),
  failureMessage: text("failure_message"),
  processedAt: timestamp("processed_at"),
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("payment_transactions_tenant_idx").on(table.tenantId),
  invoiceIdx: index("payment_transactions_invoice_idx").on(table.invoiceId),
  statusIdx: index("payment_transactions_status_idx").on(table.status),
  transactionIdx: index("payment_transactions_transaction_idx").on(table.transactionId),
  providerIdx: index("payment_transactions_provider_idx").on(table.provider, table.providerTransactionId),
}));

// Usage records for metered billing
export const usageRecords = pgTable("usage_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").references(() => organizations.id),
  userId: uuid("user_id").references(() => users.id),
  metricName: varchar("metric_name", { length: 100 }).notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
  unit: varchar("unit", { length: 20 }),
  timestamp: timestamp("timestamp").notNull(),
  aggregationPeriod: varchar("aggregation_period", { length: 20 }), // hour, day, month
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tenantMetricIdx: index("usage_records_tenant_metric_idx").on(table.tenantId, table.metricName),
  timestampIdx: index("usage_records_timestamp_idx").on(table.timestamp),
  orgIdx: index("usage_records_org_idx").on(table.organizationId),
  userIdx: index("usage_records_user_idx").on(table.userId),
}));

// Credit adjustments
export const creditAdjustments = pgTable("credit_adjustments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // credit, debit
  reason: varchar("reason", { length: 100 }),
  description: text("description"),
  appliedToInvoiceId: uuid("applied_to_invoice_id").references(() => invoices.id),
  createdBy: uuid("created_by").references(() => users.id),
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("credit_adjustments_tenant_idx").on(table.tenantId),
  typeIdx: index("credit_adjustments_type_idx").on(table.type),
  invoiceIdx: index("credit_adjustments_invoice_idx").on(table.appliedToInvoiceId),
}));

// Relations
export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  tenantSubscriptions: many(tenantSubscriptions),
}));

export const tenantSubscriptionsRelations = relations(tenantSubscriptions, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [tenantSubscriptions.tenantId],
    references: [tenants.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [tenantSubscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [invoices.tenantId],
    references: [tenants.id],
  }),
  subscription: one(tenantSubscriptions, {
    fields: [invoices.subscriptionId],
    references: [tenantSubscriptions.id],
  }),
  lineItems: many(invoiceLineItems),
  transactions: many(paymentTransactions),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [paymentMethods.tenantId],
    references: [tenants.id],
  }),
  transactions: many(paymentTransactions),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [paymentTransactions.tenantId],
    references: [tenants.id],
  }),
  invoice: one(invoices, {
    fields: [paymentTransactions.invoiceId],
    references: [invoices.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [paymentTransactions.paymentMethodId],
    references: [paymentMethods.id],
  }),
}));

export const usageRecordsRelations = relations(usageRecords, ({ one }) => ({
  tenant: one(tenants, {
    fields: [usageRecords.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [usageRecords.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [usageRecords.userId],
    references: [users.id],
  }),
}));

export const creditAdjustmentsRelations = relations(creditAdjustments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [creditAdjustments.tenantId],
    references: [tenants.id],
  }),
  appliedToInvoice: one(invoices, {
    fields: [creditAdjustments.appliedToInvoiceId],
    references: [invoices.id],
  }),
  createdByUser: one(users, {
    fields: [creditAdjustments.createdBy],
    references: [users.id],
  }),
}));

// Type exports
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type TenantSubscription = typeof tenantSubscriptions.$inferSelect;
export type NewTenantSubscription = typeof tenantSubscriptions.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type NewInvoiceLineItem = typeof invoiceLineItems.$inferInsert;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type NewPaymentMethod = typeof paymentMethods.$inferInsert;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type NewPaymentTransaction = typeof paymentTransactions.$inferInsert;
export type UsageRecord = typeof usageRecords.$inferSelect;
export type NewUsageRecord = typeof usageRecords.$inferInsert;
export type CreditAdjustment = typeof creditAdjustments.$inferSelect;
export type NewCreditAdjustment = typeof creditAdjustments.$inferInsert;