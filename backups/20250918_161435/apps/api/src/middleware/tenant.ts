import { Elysia, Context } from "elysia";
import { db } from "../db";
import { tenants } from "../db/schema";
import { eq } from "drizzle-orm";

export interface TenantContext {
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: string;
    limits: Record<string, any>;
    settings: Record<string, any>;
  };
}

// Tenant resolution strategies
export type TenantStrategy = "subdomain" | "header" | "path" | "domain";

export interface TenantMiddlewareConfig {
  strategy: TenantStrategy;
  headerName?: string; // For header strategy
  pathSegment?: number; // For path strategy (0-based index)
  required?: boolean;
}

export const tenantMiddleware = (config: TenantMiddlewareConfig = { strategy: "header", required: true }) =>
  new Elysia({ name: "tenant" })
    .derive(async (context: Context) => {
      const tenantIdentifier = extractTenantIdentifier(context, config);
      
      if (!tenantIdentifier && config.required) {
        throw new Error("Tenant identifier is required");
      }

      if (!tenantIdentifier) {
        return { tenant: null, tenantId: null };
      }

      // Resolve tenant from database
      const tenant = await resolveTenant(tenantIdentifier);
      
      if (!tenant && config.required) {
        throw new Error(`Tenant not found: ${tenantIdentifier}`);
      }

      if (tenant && tenant.status !== "active") {
        throw new Error(`Tenant is not active: ${tenant.status}`);
      }

      return {
        tenantId: tenant?.id || null,
        tenant: tenant || null,
      } as TenantContext;
    })
    .onError(({ error, code }) => {
      if (error.message.includes("Tenant")) {
        return {
          error: error.message,
          code: "TENANT_ERROR",
          statusCode: code === "VALIDATION" ? 400 : 404,
        };
      }
    });

function extractTenantIdentifier(context: Context, config: TenantMiddlewareConfig): string | null {
  const { request } = context;
  const url = new URL(request.url);

  switch (config.strategy) {
    case "subdomain": {
      const hostname = url.hostname;
      const parts = hostname.split(".");
      
      // Extract subdomain (everything before the main domain)
      if (parts.length > 2) {
        return parts.slice(0, -2).join(".");
      }
      return null;
    }

    case "header": {
      const headerName = config.headerName || "x-tenant-id";
      return request.headers.get(headerName);
    }

    case "path": {
      const pathSegment = config.pathSegment || 0;
      const pathParts = url.pathname.split("/").filter(Boolean);
      return pathParts[pathSegment] || null;
    }

    case "domain": {
      // Full domain matching
      return url.hostname;
    }

    default:
      return null;
  }
}

async function resolveTenant(identifier: string) {
  try {
    // First try to find by slug
    let tenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, identifier))
      .limit(1);

    // If not found by slug, try by ID (in case UUID is passed)
    if (tenant.length === 0) {
      tenant = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, identifier))
        .limit(1);
    }

    // If still not found, try by custom domain
    if (tenant.length === 0) {
      // Note: This would require a custom_domains field in tenants table
      // For now, we'll skip this
    }

    return tenant[0] || null;
  } catch (error) {
    console.error("Error resolving tenant:", error);
    return null;
  }
}

// Utility to get tenant from context
export function getTenant(context: Context & TenantContext) {
  return context.tenant;
}

export function getTenantId(context: Context & TenantContext): string {
  if (!context.tenantId) {
    throw new Error("No tenant context available");
  }
  return context.tenantId;
}

// Tenant validation middleware for specific endpoints
export const requireTenant = () =>
  new Elysia({ name: "require-tenant" })
    .derive((context: Context & TenantContext) => {
      if (!context.tenant) {
        throw new Error("Tenant context is required for this endpoint");
      }
      return context;
    });

// Multi-tenant query helper
export function withTenant<T extends { tenantId: any }>(
  query: any,
  tenantId: string
) {
  return query.where(eq(query.tenantId, tenantId));
}

export default tenantMiddleware;