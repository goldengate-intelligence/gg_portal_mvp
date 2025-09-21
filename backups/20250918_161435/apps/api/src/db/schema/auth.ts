import { pgTable, uuid, varchar, text, timestamp, jsonb, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "./tenants";
import { users } from "./users";

// OAuth 2.0 tables
export const oauthClients = pgTable("oauth_clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: varchar("client_id", { length: 255 }).notNull().unique(),
  clientSecret: text("client_secret").notNull(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  redirectUris: jsonb("redirect_uris").notNull(),
  grantTypes: jsonb("grant_types").notNull(),
  responseTypes: jsonb("response_types").notNull(),
  scopes: jsonb("scopes").notNull(),
  clientType: varchar("client_type", { length: 20 }).notNull(),
  tokenEndpointAuthMethod: varchar("token_endpoint_auth_method", { length: 50 }).default("client_secret_basic"),
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const oauthAccessTokens = pgTable("oauth_access_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  tokenType: varchar("token_type", { length: 20 }).default("Bearer"),
  clientId: uuid("client_id").references(() => oauthClients.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id"),
  scopes: jsonb("scopes").notNull(),
  audience: jsonb("audience"),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  tokenIdx: index("oauth_tokens_token_idx").on(table.token),
  userIdx: index("oauth_tokens_user_idx").on(table.userId),
  expiresIdx: index("oauth_tokens_expires_idx").on(table.expiresAt),
}));

export const oauthRefreshTokens = pgTable("oauth_refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  accessTokenId: uuid("access_token_id").references(() => oauthAccessTokens.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => oauthClients.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  scopes: jsonb("scopes").notNull(),
  expiresAt: timestamp("expires_at"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const oauthAuthorizationCodes = pgTable("oauth_authorization_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 255 }).notNull().unique(),
  clientId: uuid("client_id").references(() => oauthClients.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  redirectUri: text("redirect_uri").notNull(),
  scopes: jsonb("scopes").notNull(),
  codeChallenge: varchar("code_challenge", { length: 255 }),
  codeChallengeMethod: varchar("code_challenge_method", { length: 10 }),
  nonce: varchar("nonce", { length: 255 }),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports
export type OAuthClient = typeof oauthClients.$inferSelect;
export type NewOAuthClient = typeof oauthClients.$inferInsert;
export type OAuthAccessToken = typeof oauthAccessTokens.$inferSelect;
export type NewOAuthAccessToken = typeof oauthAccessTokens.$inferInsert;