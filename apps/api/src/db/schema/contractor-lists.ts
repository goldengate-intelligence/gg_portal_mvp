import {
  pgTable,
  text,
  timestamp,
  index,
  uniqueIndex,
  boolean,
  jsonb,
  uuid,
  integer,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { contractorProfiles } from "./contractor-profiles";

// User contractor lists - allows users to organize contractors into multiple lists
export const contractorLists = pgTable(
  "contractor_lists",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Owner
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    
    // List details
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    isDefault: boolean("is_default").default(false), // Each user has one default list
    isPublic: boolean("is_public").default(false), // Allow sharing lists
    
    // List metadata
    color: varchar("color", { length: 7 }), // Hex color for UI
    icon: varchar("icon", { length: 50 }), // Icon identifier
    sortOrder: integer("sort_order").default(0), // For ordering lists
    
    // Statistics (denormalized for performance)
    itemCount: integer("item_count").default(0),
    totalValue: text("total_value").default("0"), // Sum of all contractor values
    lastItemAddedAt: timestamp("last_item_added_at"),
    
    // Settings
    settings: jsonb("settings").$type<{
      notifications?: boolean;
      autoUpdate?: boolean;
      defaultView?: 'grid' | 'table';
    }>().default({}),
    
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_list_user_id").on(table.userId),
    isDefaultIdx: index("idx_list_is_default").on(table.isDefault),
    isPublicIdx: index("idx_list_is_public").on(table.isPublic),
    // Ensure only one default list per user
    uniqueDefaultPerUser: uniqueIndex("idx_unique_default_per_user")
      .on(table.userId, table.isDefault)
      .where(sql`${table.isDefault} = true`),
  })
);

// Items in contractor lists - many-to-many relationship
export const contractorListItems = pgTable(
  "contractor_list_items",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    
    // Relationships
    listId: uuid("list_id")
      .notNull()
      .references(() => contractorLists.id, { onDelete: "cascade" }),
    
    contractorProfileId: uuid("contractor_profile_id")
      .notNull()
      .references(() => contractorProfiles.id, { onDelete: "cascade" }),
    
    // Item metadata
    notes: text("notes"), // User notes about this contractor
    tags: jsonb("tags").$type<string[]>().default(sql`'[]'::jsonb`),
    rating: integer("rating"), // 1-5 star rating
    priority: varchar("priority", { length: 20 }), // high, medium, low
    
    // Tracking
    addedBy: uuid("added_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    
    addedAt: timestamp("added_at").defaultNow().notNull(),
    lastViewedAt: timestamp("last_viewed_at"),
    viewCount: integer("view_count").default(0),
    
    // Custom fields for tracking
    customData: jsonb("custom_data"), // Flexible field for user-specific data
  },
  (table) => ({
    listIdIdx: index("idx_item_list_id").on(table.listId),
    contractorProfileIdIdx: index("idx_item_contractor_profile_id").on(table.contractorProfileId),
    addedByIdx: index("idx_item_added_by").on(table.addedBy),
    // Prevent duplicate contractors in same list
    uniqueContractorPerList: uniqueIndex("idx_unique_contractor_per_list")
      .on(table.listId, table.contractorProfileId),
  })
);

// List sharing - track who has access to shared lists
export const contractorListShares = pgTable(
  "contractor_list_shares",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    
    listId: uuid("list_id")
      .notNull()
      .references(() => contractorLists.id, { onDelete: "cascade" }),
    
    sharedWithUserId: uuid("shared_with_user_id")
      .references(() => users.id, { onDelete: "cascade" }),
    
    sharedWithEmail: varchar("shared_with_email", { length: 255 }), // For external sharing
    
    permission: varchar("permission", { length: 20 }).notNull().default("view"), // view, edit
    
    sharedBy: uuid("shared_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    
    sharedAt: timestamp("shared_at").defaultNow().notNull(),
    accessToken: varchar("access_token", { length: 255 }), // For external access
    expiresAt: timestamp("expires_at"),
    lastAccessedAt: timestamp("last_accessed_at"),
  },
  (table) => ({
    listIdIdx: index("idx_share_list_id").on(table.listId),
    sharedWithUserIdIdx: index("idx_share_shared_with_user_id").on(table.sharedWithUserId),
    accessTokenIdx: uniqueIndex("idx_share_access_token").on(table.accessToken),
  })
);

// List activity log
export const contractorListActivity = pgTable(
  "contractor_list_activity",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    
    listId: uuid("list_id")
      .notNull()
      .references(() => contractorLists.id, { onDelete: "cascade" }),
    
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    
    action: varchar("action", { length: 50 }).notNull(), // added, removed, shared, exported, etc.
    
    itemId: uuid("item_id"), // Reference to contractor_list_items if applicable
    
    metadata: jsonb("metadata"), // Additional context about the action
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    listIdIdx: index("idx_activity_list_id").on(table.listId),
    userIdIdx: index("idx_activity_user_id").on(table.userId),
    createdAtIdx: index("idx_activity_created_at").on(table.createdAt),
  })
);

// Types
export type ContractorList = typeof contractorLists.$inferSelect;
export type NewContractorList = typeof contractorLists.$inferInsert;
export type ContractorListItem = typeof contractorListItems.$inferSelect;
export type NewContractorListItem = typeof contractorListItems.$inferInsert;
export type ContractorListShare = typeof contractorListShares.$inferSelect;
export type NewContractorListShare = typeof contractorListShares.$inferInsert;
export type ContractorListActivity = typeof contractorListActivity.$inferSelect;
export type NewContractorListActivity = typeof contractorListActivity.$inferInsert;