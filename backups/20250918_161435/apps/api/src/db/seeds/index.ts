import { db } from "../index";
import { policies, roles, rolePolicies, tenants, oauthClients } from "../schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import argon2 from "argon2";

// Default policies for the system
const defaultPolicies = [
  // User management
  {
    name: "users:read:own",
    description: "Read own user profile",
    resource: "users",
    action: "read",
    effect: "allow",
    conditions: [{ field: "user.id", operator: "eq", value: "context.user.id" }],
    priority: 100,
  },
  {
    name: "users:update:own",
    description: "Update own user profile", 
    resource: "users",
    action: "update",
    effect: "allow",
    conditions: [{ field: "user.id", operator: "eq", value: "context.user.id" }],
    priority: 100,
  },
  {
    name: "users:read:all",
    description: "Read all user profiles",
    resource: "users", 
    action: "read",
    effect: "allow",
    conditions: [],
    priority: 50,
  },
  {
    name: "users:create",
    description: "Create new users",
    resource: "users",
    action: "create", 
    effect: "allow",
    conditions: [],
    priority: 50,
  },
  {
    name: "users:update:all",
    description: "Update any user profile",
    resource: "users",
    action: "update",
    effect: "allow", 
    conditions: [],
    priority: 50,
  },
  {
    name: "users:delete",
    description: "Delete users",
    resource: "users",
    action: "delete",
    effect: "allow",
    conditions: [],
    priority: 50,
  },

  // Organization management
  {
    name: "organizations:read",
    description: "Read organizations",
    resource: "organizations",
    action: "read",
    effect: "allow",
    conditions: [],
    priority: 50,
  },
  {
    name: "organizations:create",
    description: "Create organizations",
    resource: "organizations", 
    action: "create",
    effect: "allow",
    conditions: [],
    priority: 50,
  },
  {
    name: "organizations:update",
    description: "Update organizations",
    resource: "organizations",
    action: "update", 
    effect: "allow",
    conditions: [],
    priority: 50,
  },
  {
    name: "organizations:delete",
    description: "Delete organizations",
    resource: "organizations",
    action: "delete",
    effect: "allow",
    conditions: [],
    priority: 50,
  },

  // Agent management
  {
    name: "agents:read:own",
    description: "Read own agents",
    resource: "agents",
    action: "read",
    effect: "allow",
    conditions: [{ field: "agent.userId", operator: "eq", value: "context.user.id" }],
    priority: 100,
  },
  {
    name: "agents:create:own",
    description: "Create own agents",
    resource: "agents", 
    action: "create",
    effect: "allow",
    conditions: [],
    priority: 100,
  },
  {
    name: "agents:update:own",
    description: "Update own agents",
    resource: "agents",
    action: "update",
    effect: "allow",
    conditions: [{ field: "agent.userId", operator: "eq", value: "context.user.id" }],
    priority: 100,
  },
  {
    name: "agents:delete:own", 
    description: "Delete own agents",
    resource: "agents",
    action: "delete",
    effect: "allow",
    conditions: [{ field: "agent.userId", operator: "eq", value: "context.user.id" }],
    priority: 100,
  },
  {
    name: "agents:read:all",
    description: "Read all agents",
    resource: "agents",
    action: "read",
    effect: "allow",
    conditions: [],
    priority: 50,
  },
  {
    name: "agents:update:all",
    description: "Update any agents",
    resource: "agents",
    action: "update",
    effect: "allow",
    conditions: [],
    priority: 50,
  },
  {
    name: "agents:delete:all",
    description: "Delete any agents", 
    resource: "agents",
    action: "delete",
    effect: "allow",
    conditions: [],
    priority: 50,
  },

  // System administration
  {
    name: "tenants:read",
    description: "Read tenant information",
    resource: "tenants",
    action: "read",
    effect: "allow",
    conditions: [],
    priority: 50,
  },
  {
    name: "tenants:update",
    description: "Update tenant settings",
    resource: "tenants", 
    action: "update",
    effect: "allow",
    conditions: [],
    priority: 50,
  },
  {
    name: "roles:manage",
    description: "Manage roles and permissions",
    resource: "roles",
    action: "*",
    effect: "allow", 
    conditions: [],
    priority: 50,
  },
  {
    name: "audit:read",
    description: "Read audit logs",
    resource: "audit",
    action: "read",
    effect: "allow",
    conditions: [],
    priority: 50,
  },
];

// Default roles with their policy mappings
const defaultRoles = [
  {
    name: "user",
    description: "Standard user with basic permissions",
    isSystem: true,
    isDefault: true,
    policies: [
      "users:read:own",
      "users:update:own", 
      "agents:read:own",
      "agents:create:own",
      "agents:update:own",
      "agents:delete:own",
      "organizations:read",
    ],
  },
  {
    name: "org_admin",
    description: "Organization administrator",
    isSystem: true,
    isDefault: false,
    policies: [
      "users:read:all",
      "users:create",
      "users:update:all",
      "agents:read:all",
      "agents:update:all", 
      "organizations:read",
      "organizations:update",
    ],
  },
  {
    name: "admin",
    description: "System administrator with full access",
    isSystem: true,
    isDefault: false,
    policies: [
      "users:read:all",
      "users:create", 
      "users:update:all",
      "users:delete",
      "organizations:read",
      "organizations:create",
      "organizations:update",
      "organizations:delete",
      "agents:read:all",
      "agents:update:all",
      "agents:delete:all",
      "tenants:read",
      "tenants:update",
      "roles:manage",
      "audit:read",
    ],
  },
  {
    name: "super_admin",
    description: "Super administrator with unrestricted access",
    isSystem: true,
    isDefault: false,
    policies: [], // Super admin bypasses RBAC checks
  },
];

export async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    // Create default tenant if it doesn't exist
    let defaultTenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, "default"))
      .limit(1);

    if (defaultTenant.length === 0) {
      console.log("Creating default tenant...");
      [defaultTenant[0]] = await db
        .insert(tenants)
        .values({
          name: "Default Tenant",
          slug: "default",
          plan: "starter",
          status: "active",
          limits: {
            maxUsers: 100,
            maxOrganizations: 10,
            maxAgents: 50,
          },
          settings: {
            allowRegistration: true,
            defaultUserRole: "user",
          },
        })
        .returning();
    }

    const tenantId = defaultTenant[0].id;

    // Create policies
    console.log("Creating default policies...");
    const createdPolicies = new Map();

    for (const policyData of defaultPolicies) {
      const existing = await db
        .select()
        .from(policies)
        .where(eq(policies.name, policyData.name))
        .limit(1);

      if (existing.length === 0) {
        const [policy] = await db
          .insert(policies)
          .values({
            name: policyData.name,
            description: policyData.description,
            resource: policyData.resource,
            action: policyData.action,
            effect: policyData.effect as "allow" | "deny",
            conditions: policyData.conditions,
            priority: policyData.priority,
          })
          .returning();
        
        createdPolicies.set(policyData.name, policy.id);
        console.log(`  ✓ Created policy: ${policyData.name}`);
      } else {
        createdPolicies.set(policyData.name, existing[0].id);
      }
    }

    // Create roles and assign policies
    console.log("Creating default roles...");
    
    for (const roleData of defaultRoles) {
      let role = await db
        .select()
        .from(roles)
        .where(eq(roles.name, roleData.name))
        .limit(1);

      if (role.length === 0) {
        [role[0]] = await db
          .insert(roles)
          .values({
            tenantId,
            name: roleData.name,
            description: roleData.description,
            isSystem: roleData.isSystem,
            isDefault: roleData.isDefault,
          })
          .returning();
        
        console.log(`  ✓ Created role: ${roleData.name}`);
      }

      // Assign policies to role
      for (const policyName of roleData.policies) {
        const policyId = createdPolicies.get(policyName);
        if (policyId) {
          const existing = await db
            .select()
            .from(rolePolicies)
            .where(eq(rolePolicies.roleId, role[0].id))
            .limit(1);

          if (existing.length === 0) {
            await db.insert(rolePolicies).values({
              roleId: role[0].id,
              policyId,
              tenantId,
            });
          }
        }
      }
    }

    // Create default OAuth client for frontend
    console.log("Creating default OAuth client...");
    const existingClient = await db
      .select()
      .from(oauthClients)
      .where(eq(oauthClients.clientId, "goldengate-web"))
      .limit(1);

    if (existingClient.length === 0) {
      const clientSecret = nanoid(32);
      
      await db.insert(oauthClients).values({
        clientId: "goldengate-web",
        clientSecret: await argon2.hash(clientSecret),
        tenantId,
        name: "GoldenGate Web Application",
        redirectUris: [
          "http://localhost:3000/auth/callback",
          "http://localhost:5173/auth/callback",
          "https://goldengate.app/auth/callback",
        ],
        grantTypes: ["authorization_code", "refresh_token"],
        responseTypes: ["code"],
        scopes: ["openid", "profile", "email", "agents"],
        clientType: "public",
        tokenEndpointAuthMethod: "client_secret_basic",
      });
      
      console.log(`  ✓ Created OAuth client: goldengate-web`);
      console.log(`  ✓ Client secret: ${clientSecret}`);
    }

    console.log("🎉 Database seeded successfully!");
    
    return {
      tenantId,
      clientSecret: existingClient.length > 0 ? "existing" : "generated",
    };
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.main) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}