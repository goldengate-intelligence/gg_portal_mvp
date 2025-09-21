import { Elysia, Context } from "elysia";
import { db } from "../db";
import { policies, roles, rolePolicies, userRoles } from "../db/schema";
import { eq, and, inArray } from "drizzle-orm";
import type { AuthContext } from "./auth";
import type { TenantContext } from "./tenant";

export interface RBACContext extends AuthContext, TenantContext {
  permissions: string[];
  userRoles: string[];
}

export interface PolicyCondition {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
  value: any;
}

export interface Policy {
  id: string;
  name: string;
  resource: string;
  action: string;
  effect: "allow" | "deny";
  conditions: PolicyCondition[];
  priority: number;
}

// RBAC middleware
export const rbacMiddleware = () =>
  new Elysia({ name: "rbac" })
    .derive(async (context: Context & AuthContext & TenantContext) => {
      if (!context.user || !context.tenantId) {
        return {
          permissions: [],
          userRoles: [],
        };
      }

      const [userPermissions, userRolesList] = await Promise.all([
        getUserPermissions(context.user.id, context.tenantId),
        getUserRoles(context.user.id, context.tenantId),
      ]);

      return {
        permissions: userPermissions,
        userRoles: userRolesList,
      };
    });

// Permission check middleware
export const requirePermission = (resource: string, action: string) =>
  new Elysia({ name: "require-permission" })
    .derive(async (context: Context & RBACContext) => {
      if (!context.user) {
        throw new Error("Authentication required");
      }

      const hasPermission = await checkPermission(
        context.user.id,
        context.tenantId!,
        resource,
        action,
        context
      );

      if (!hasPermission) {
        throw new Error(`Permission denied: ${action} on ${resource}`);
      }

      return context;
    });

// Multiple permissions check (any)
export const requireAnyPermission = (permissions: Array<{ resource: string; action: string }>) =>
  new Elysia({ name: "require-any-permission" })
    .derive(async (context: Context & RBACContext) => {
      if (!context.user) {
        throw new Error("Authentication required");
      }

      const hasAnyPermission = await Promise.all(
        permissions.map(({ resource, action }) =>
          checkPermission(context.user!.id, context.tenantId!, resource, action, context)
        )
      );

      if (!hasAnyPermission.some(Boolean)) {
        const permissionStrings = permissions.map(p => `${p.action} on ${p.resource}`);
        throw new Error(`Permission denied. Required: ${permissionStrings.join(" or ")}`);
      }

      return context;
    });

// All permissions check
export const requireAllPermissions = (permissions: Array<{ resource: string; action: string }>) =>
  new Elysia({ name: "require-all-permissions" })
    .derive(async (context: Context & RBACContext) => {
      if (!context.user) {
        throw new Error("Authentication required");
      }

      const hasAllPermissions = await Promise.all(
        permissions.map(({ resource, action }) =>
          checkPermission(context.user!.id, context.tenantId!, resource, action, context)
        )
      );

      if (!hasAllPermissions.every(Boolean)) {
        const permissionStrings = permissions.map(p => `${p.action} on ${p.resource}`);
        throw new Error(`Permission denied. Required: ${permissionStrings.join(" and ")}`);
      }

      return context;
    });

// Core permission checking logic
async function checkPermission(
  userId: string,
  tenantId: string,
  resource: string,
  action: string,
  requestContext: Context & RBACContext
): Promise<boolean> {
  try {
    // Get all policies that apply to this user for this resource/action
    const applicablePolicies = await getApplicablePolicies(userId, tenantId, resource, action);

    if (applicablePolicies.length === 0) {
      return false; // No policies = no permission
    }

    // Sort policies by priority (higher priority first)
    applicablePolicies.sort((a, b) => b.priority - a.priority);

    // Evaluate policies in order
    for (const policy of applicablePolicies) {
      const conditionsMet = evaluateConditions(policy.conditions, requestContext);
      
      if (conditionsMet) {
        return policy.effect === "allow";
      }
    }

    return false; // No matching policies
  } catch (error) {
    console.error("Error checking permission:", error);
    return false; // Fail closed
  }
}

async function getApplicablePolicies(
  userId: string,
  tenantId: string,
  resource: string,
  action: string
): Promise<Policy[]> {
  // Get user's roles
  const userRoleIds = await db
    .select({ roleId: userRoles.roleId })
    .from(userRoles)
    .where(and(
      eq(userRoles.userId, userId),
      eq(userRoles.tenantId, tenantId)
    ));

  if (userRoleIds.length === 0) {
    return [];
  }

  // Get policies through role assignments
  const result = await db
    .select({
      id: policies.id,
      name: policies.name,
      resource: policies.resource,
      action: policies.action,
      effect: policies.effect,
      conditions: policies.conditions,
      priority: policies.priority,
      customConditions: rolePolicies.customConditions,
    })
    .from(policies)
    .innerJoin(rolePolicies, eq(policies.id, rolePolicies.policyId))
    .innerJoin(roles, eq(rolePolicies.roleId, roles.id))
    .where(and(
      inArray(rolePolicies.roleId, userRoleIds.map(r => r.roleId)),
      eq(policies.resource, resource),
      eq(policies.action, action),
      eq(roles.tenantId, tenantId)
    ));

  return result.map(row => ({
    id: row.id,
    name: row.name,
    resource: row.resource,
    action: row.action,
    effect: row.effect as "allow" | "deny",
    conditions: mergeConditions(row.conditions as PolicyCondition[], row.customConditions as PolicyCondition[]),
    priority: row.priority,
  }));
}

function mergeConditions(policyConditions: PolicyCondition[], customConditions: PolicyCondition[]): PolicyCondition[] {
  const merged = [...policyConditions];
  
  // Add custom conditions, but policy conditions take precedence
  for (const customCondition of customConditions || []) {
    const existingIndex = merged.findIndex(c => c.field === customCondition.field);
    if (existingIndex === -1) {
      merged.push(customCondition);
    }
  }
  
  return merged;
}

function evaluateConditions(conditions: PolicyCondition[], context: Context & RBACContext): boolean {
  if (!conditions || conditions.length === 0) {
    return true; // No conditions = always applies
  }

  return conditions.every(condition => evaluateCondition(condition, context));
}

function evaluateCondition(condition: PolicyCondition, context: Context & RBACContext): boolean {
  const contextValue = getContextValue(condition.field, context);
  
  switch (condition.operator) {
    case "eq":
      return contextValue === condition.value;
    case "ne":
      return contextValue !== condition.value;
    case "gt":
      return contextValue > condition.value;
    case "gte":
      return contextValue >= condition.value;
    case "lt":
      return contextValue < condition.value;
    case "lte":
      return contextValue <= condition.value;
    case "in":
      return Array.isArray(condition.value) && condition.value.includes(contextValue);
    case "contains":
      return typeof contextValue === "string" && contextValue.includes(condition.value);
    default:
      return false;
  }
}

function getContextValue(field: string, context: Context & RBACContext): any {
  switch (field) {
    case "user.id":
      return context.user?.id;
    case "user.role":
      return context.user?.role;
    case "tenant.id":
      return context.tenantId;
    case "organization.id":
      return context.user?.organizationId;
    case "time.hour":
      return new Date().getHours();
    case "time.day":
      return new Date().getDay();
    default:
      // Support nested property access
      const keys = field.split(".");
      let value: any = context;
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) break;
      }
      return value;
  }
}

async function getUserPermissions(userId: string, tenantId: string): Promise<string[]> {
  try {
    const result = await db
      .select({
        resource: policies.resource,
        action: policies.action,
      })
      .from(policies)
      .innerJoin(rolePolicies, eq(policies.id, rolePolicies.policyId))
      .innerJoin(roles, eq(rolePolicies.roleId, roles.id))
      .innerJoin(userRoles, eq(roles.id, userRoles.roleId))
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.tenantId, tenantId),
        eq(policies.effect, "allow")
      ));

    return result.map(row => `${row.resource}:${row.action}`);
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return [];
  }
}

async function getUserRoles(userId: string, tenantId: string): Promise<string[]> {
  try {
    const result = await db
      .select({ name: roles.name })
      .from(roles)
      .innerJoin(userRoles, eq(roles.id, userRoles.roleId))
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.tenantId, tenantId)
      ));

    return result.map(row => row.name);
  } catch (error) {
    console.error("Error getting user roles:", error);
    return [];
  }
}

// Utility functions
export function hasPermission(context: Context & RBACContext, resource: string, action: string): boolean {
  const permission = `${resource}:${action}`;
  return context.permissions.includes(permission);
}

export function hasRole(context: Context & RBACContext, roleName: string): boolean {
  return context.userRoles.includes(roleName);
}

export function hasAnyRole(context: Context & RBACContext, roleNames: string[]): boolean {
  return roleNames.some(role => context.userRoles.includes(role));
}

export default rbacMiddleware;