# Full-Stack Migration Proposal: Next.js to Vite + TanStack with Bun/Elysia/Drizzle Backend

## Executive Summary

This document outlines the comprehensive migration strategy for transitioning from the legacy Next.js application (`ui-old`) to a modern full-stack architecture featuring:
- **Frontend**: Vite-based React with TanStack Router, Query, Table, and Form
- **Backend**: Bun runtime with Elysia framework, PostgreSQL database, and Drizzle ORM
- **Data Model**: Type-safe, schema-first approach with end-to-end type safety

## Current State Analysis

### UI-Old (Legacy)
- **Framework**: Next.js 15.2.4 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom wrappers
- **State Management**: Client-side React state
- **Data Fetching**: Traditional React patterns
- **Drag & Drop**: @dnd-kit library
- **Build Tool**: Next.js built-in (Webpack)

### UI (New)
- **Framework**: Vite + React 19
- **Routing**: TanStack Router (file-based routing replaced with programmatic routing)
- **Data Fetching**: TanStack Query for server state management
- **Tables**: TanStack Table for advanced data grid functionality
- **Forms**: TanStack Form with Zod validation
- **Styling**: Tailwind CSS v4 with Vite plugin
- **Build Tool**: Vite (faster builds and HMR)
- **Testing**: Vitest
- **Code Quality**: Biome (linting and formatting)

### API (Backend Stack)
- **Runtime**: Bun (fast JavaScript runtime)
- **Framework**: Elysia (type-safe, performant web framework)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM (type-safe, SQL-like)
- **Validation**: Zod schemas (shared with frontend)
- **Authentication**: JWT with @elysiajs/jwt
- **API Documentation**: Swagger via @elysiajs/swagger
- **Password Hashing**: Argon2
- **MCP Server**: Built-in Model Context Protocol server for agent control
- **Agent SDK**: Native agent interaction layer

## Key Differences & Migration Challenges

### 1. Routing Architecture
**Challenge**: Next.js App Router → TanStack Router
- Next.js uses file-based routing with `app/` directory
- TanStack Router uses programmatic route definitions
- Need to convert `page.tsx` and `layout.tsx` patterns

**Migration Strategy**:
```typescript
// Old: app/page.tsx
// New: Create route in main.tsx
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: YourComponent,
})
```

### 2. Component Library Migration
**Challenge**: shadcn/ui components need adaptation
- 50+ UI components in `ui-old/components/ui/`
- These are tightly coupled with Radix UI
- Need to decide: migrate as-is or rebuild with modern patterns

**Migration Strategy**:
- Phase 1: Copy essential components and adapt imports
- Phase 2: Gradually refactor to use TanStack Form components
- Phase 3: Optimize and remove duplicates

### 3. Form Handling
**Challenge**: React Hook Form → TanStack Form
- Different API and validation patterns
- TanStack Form provides better TypeScript support
- Field-level subscription for better performance

**Migration Strategy**:
```typescript
// Old: React Hook Form
const { register, handleSubmit } = useForm()

// New: TanStack Form
const form = useAppForm({
  defaultValues: {},
  validators: { onBlur: schema },
  onSubmit: ({ value }) => {}
})
```

### 4. Data Management
**Challenge**: No centralized data fetching → TanStack Query
- Old app appears to use local state and direct API calls
- TanStack Query provides caching, synchronization, and background updates

**Migration Strategy**:
- Wrap API calls in TanStack Query hooks
- Implement proper error boundaries
- Set up query client configuration

### 5. Build System & Development Experience
**Benefits of Migration**:
- Vite provides 10-100x faster HMR
- Better tree-shaking and smaller bundles
- Native ES modules in development
- Improved TypeScript performance

## Backend Data Model & API Design

### Multi-Tenant Architecture

The platform will be designed as a **multi-tenant SaaS application** with the following approach:

#### Tenancy Strategy: Hybrid (Shared Database with Row-Level Security)
- **Shared tables** with `tenant_id` column for isolation
- **Tenant-specific schemas** for custom data
- **Row-Level Security (RLS)** in PostgreSQL for data isolation
- **Separate file storage** per tenant

#### Tenant Model
```typescript
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // URL-friendly identifier
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }), // Custom domain support
  plan: varchar("plan", { enum: ["trial", "starter", "professional", "enterprise"] }).default("trial"),
  status: varchar("status", { enum: ["active", "suspended", "cancelled"] }).default("active"),
  settings: jsonb("settings"), // Tenant-specific settings
  maxUsers: integer("max_users").default(5),
  maxOrganizations: integer("max_organizations").default(100),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User-Tenant relationship (many-to-many for cross-tenant access)
export const userTenants = pgTable("user_tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  role: varchar("role", { enum: ["owner", "admin", "member", "viewer"] }).default("member"),
  isDefault: boolean("is_default").default(false), // User's default tenant
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.tenantId] }),
  userIdx: index("user_tenant_user_idx").on(table.userId),
  tenantIdx: index("user_tenant_tenant_idx").on(table.tenantId),
}));
```

### Core Domain Models (Updated for Multi-Tenancy)

Based on the existing UI and the Bun/Elysia/Drizzle documentation, here are the recommended data models with multi-tenant support:

#### 1. Organizations/Companies (Multi-Tenant)
```typescript
// Primary entity representing companies/organizations
export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  sector: varchar("sector", { length: 100 }), // Maps to industry sectors from UI
  location: varchar("location", { length: 255 }),
  state: varchar("state", { length: 50 }),
  description: text("description"),
  logoUrl: text("logo_url"),
  website: varchar("website", { length: 255 }),
  employeeCount: integer("employee_count"),
  foundedYear: integer("founded_year"),
  status: varchar("status", { enum: ["active", "inactive", "pending"] }).default("active"),
  lifecycleStage: varchar("lifecycle_stage", { length: 50 }), // Growth, Mature, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  tenantIdx: index("org_tenant_idx").on(table.tenantId),
  nameIdx: index("org_name_idx").on(table.name),
  sectorIdx: index("org_sector_idx").on(table.sector),
}));
```

#### 2. Contracts/Awards (Multi-Tenant)
```typescript
export const contracts = pgTable("contracts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").references(() => organizations.id),
  title: varchar("title", { length: 255 }).notNull(),
  value: decimal("value", { precision: 15, scale: 2 }), // Contract value in billions
  startDate: date("start_date"),
  endDate: date("end_date"),
  status: varchar("status", { enum: ["active", "completed", "pending", "cancelled"] }),
  type: varchar("type", { length: 100 }), // Award type
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  tenantOrgIdx: index("contract_tenant_org_idx").on(table.tenantId, table.organizationId),
}));
```

#### 3. Metrics/Performance
```typescript
export const metrics = pgTable("metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  metricType: varchar("metric_type", { length: 50 }), // revenue, growth, etc.
  value: decimal("value", { precision: 15, scale: 2 }),
  unit: varchar("unit", { length: 20 }), // percentage, dollars, etc.
  period: varchar("period", { length: 20 }), // monthly, quarterly, yearly
  date: date("date"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

#### 4. Deployments
```typescript
export const deployments = pgTable("deployments", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  deploymentType: varchar("deployment_type", { length: 100 }),
  status: varchar("status", { enum: ["planned", "in_progress", "deployed", "failed"] }),
  targetDate: date("target_date"),
  completedDate: date("completed_date"),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### Multi-Tenant Middleware

```typescript
// middleware/tenant.middleware.ts
export const tenantMiddleware = new Elysia()
  .derive(async ({ headers, jwt, set }) => {
    // Extract tenant from subdomain or header
    const host = headers.host;
    const tenantSlug = host.split('.')[0]; // e.g., acme.app.com -> acme
    
    // Or from JWT token
    const token = headers.authorization?.replace('Bearer ', '');
    const payload = await jwt.verify(token);
    
    if (!payload?.tenantId) {
      set.status = 401;
      throw new Error('Tenant not found');
    }
    
    return {
      tenantId: payload.tenantId,
      userId: payload.userId,
      role: payload.role,
    };
  });
```

### API Endpoints Structure (Multi-Tenant)

```typescript
// All endpoints automatically scoped to tenant via middleware
// Tenant context injected: /api/v1/t/:tenantSlug/... or via subdomain

// Organization endpoints (tenant-scoped)
GET    /api/v1/organizations          // List tenant's organizations
GET    /api/v1/organizations/:id      // Get single (validates tenant ownership)
POST   /api/v1/organizations          // Create (auto-assigns tenantId)
PATCH  /api/v1/organizations/:id      // Update (validates tenant ownership)
DELETE /api/v1/organizations/:id      // Delete (validates tenant ownership)

// Tenant management (admin only)
GET    /api/v1/tenant/settings        // Get tenant settings
PATCH  /api/v1/tenant/settings        // Update tenant settings
GET    /api/v1/tenant/users           // List tenant users
POST   /api/v1/tenant/users/invite    // Invite user to tenant

// Cross-tenant (for users with multiple tenants)
GET    /api/v1/user/tenants           // List user's tenants
POST   /api/v1/user/tenants/switch    // Switch active tenant
```

### Frontend-Backend Integration Strategy

#### 1. Type Sharing
```typescript
// shared/types.ts - Shared between frontend and backend
import { z } from "zod";

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  sector: z.string().optional(),
  location: z.string().optional(),
  // ... other fields
});

export type Organization = z.infer<typeof OrganizationSchema>;
```

#### 2. TanStack Query Hooks
```typescript
// frontend/hooks/useOrganizations.ts
export const useOrganizations = (filters?: FilterParams) => {
  return useQuery({
    queryKey: ['organizations', filters],
    queryFn: () => api.organizations.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.organizations.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};
```

## Migration Plan

### Phase 0: Backend Setup (Week 1)
1. **Database Setup**
   - Set up PostgreSQL with Docker
   - Create Drizzle schemas for all entities (with tenant support)
   - Generate and run initial migrations
   - Create seed data for development

2. **API Development**
   - Implement Elysia routes for all entities
   - Add validation with Zod schemas
   - Implement authentication/authorization (humans & agents)
   - Set up Swagger documentation
   - Add error handling and logging

3. **MCP Server Implementation**
   - Set up MCP server with WebSocket transport
   - Register platform tools (CRUD, analytics, reporting)
   - Implement resource handlers for data access
   - Create agent authentication & permissions
   - Add comprehensive audit logging
   - Build workflow execution engine

4. **Testing**
   - Unit tests for services
   - Integration tests for API endpoints
   - MCP server connection tests
   - Agent workflow tests
   - Set up test database

### Phase 1: Foundation (Week 2)
1. Set up project structure in new UI
2. Configure TanStack Router with main routes
3. Set up TanStack Query client and providers
4. Establish design system foundations (colors, typography, spacing)
5. Create base layout components

### Phase 2: Core Components (Week 3)
1. Migrate essential UI components:
   - Button, Input, Card, Dialog, Select
   - Table components (adapt to TanStack Table)
   - Form field components
2. Set up component documentation/storybook
3. Implement theme provider

### Phase 3: Feature Migration (Week 4-5)
1. **Main Dashboard Page**
   - Convert complex filter system
   - Migrate data grid/table views
   - Implement drag-and-drop with modern patterns
   
2. **Forms & Modals**
   - Deploy/Edit modals
   - Settings forms
   - Search functionality

3. **Data Visualization**
   - Charts and metrics displays
   - Progress indicators
   - Status badges

### Phase 4: Integration & Testing (Week 6)
1. API integration with TanStack Query
2. Authentication flow
3. Error handling and loading states
4. End-to-end testing setup
5. Performance optimization

### Phase 5: Deployment & Cutover (Week 7)
1. Production build optimization
2. Environment configuration
3. Deployment pipeline setup
4. Parallel run (if needed)
5. Traffic migration
6. Deprecate old UI

## Technical Recommendations

### 1. Component Architecture
```typescript
// Recommended structure
src/
  components/
    ui/           # Base UI components
    features/     # Feature-specific components
    layouts/      # Layout components
  hooks/          # Custom hooks
  routes/         # Route components
  services/       # API services
  stores/         # Global state (if needed)
```

### 2. Type Safety
- Use Zod schemas for runtime validation
- Generate TypeScript types from Zod schemas
- Implement strict TypeScript configuration

### 3. Performance Optimizations
- Implement code splitting at route level
- Use React.lazy for heavy components
- Optimize bundle size with tree shaking
- Implement virtual scrolling for large lists

### 4. Testing Strategy
- Unit tests with Vitest
- Component testing with React Testing Library
- E2E tests with Playwright
- Visual regression testing (optional)

## Risk Mitigation

### High-Risk Areas
1. **Complex Dashboard Page**: Contains extensive business logic
   - Mitigation: Break into smaller, testable components
   
2. **Drag & Drop Functionality**: Library compatibility
   - Mitigation: Evaluate modern alternatives or create adapter

3. **Data Synchronization**: Ensuring data consistency
   - Mitigation: Leverage TanStack Query's built-in synchronization

### Rollback Strategy
- Maintain both UIs in parallel initially
- Use feature flags for gradual rollout
- Keep old UI operational until full validation

## Success Metrics

1. **Performance**
   - Initial load time < 2s
   - Time to interactive < 3s
   - Lighthouse score > 90

2. **Developer Experience**
   - HMR updates < 200ms
   - Build time < 30s
   - TypeScript checking < 10s

3. **User Experience**
   - Zero regression in functionality
   - Improved perceived performance
   - Consistent UI/UX

## Resource Requirements

### Team
- 2 Senior Frontend Engineers
- 1 UI/UX Designer (part-time)
- 1 QA Engineer

### Timeline
- Total Duration: 7 weeks
- Backend Setup: Week 1
- Frontend Migration: Weeks 2-7
- Buffer: 1-2 weeks for unexpected issues

### Dependencies
- API documentation and stability
- Design system finalization
- Testing environment availability

## Data Model Considerations

### Key Design Decisions

1. **Type-Safe End-to-End**
   - Shared Zod schemas between frontend and backend
   - Auto-generated TypeScript types from Drizzle schemas
   - Type-safe API client with full inference

2. **Performance Optimizations**
   - Database indexes on frequently queried fields
   - Pagination support for all list endpoints
   - Efficient query patterns with Drizzle relations

3. **Scalability**
   - UUID primary keys for distributed systems
   - Soft deletes for data recovery
   - Audit logs for compliance

### Sample Multi-Tenant API Service Implementation

```typescript
// api/src/modules/organizations/organizations.service.ts
export class OrganizationService {
  async findAll(tenantId: string, filters: FilterParams) {
    const query = db.select().from(schema.organizations)
      .where(eq(schema.organizations.tenantId, tenantId)); // Tenant isolation
    
    // Apply filters
    if (filters.sector) {
      query.where(and(
        eq(schema.organizations.tenantId, tenantId),
        eq(schema.organizations.sector, filters.sector)
      ));
    }
    if (filters.location) {
      query.where(and(
        eq(schema.organizations.tenantId, tenantId),
        like(schema.organizations.location, `%${filters.location}%`)
      ));
    }
    
    // Apply pagination
    const results = await query
      .limit(filters.limit || 50)
      .offset(filters.offset || 0)
      .orderBy(desc(schema.organizations.createdAt));
    
    return results;
  }

  async create(tenantId: string, data: CreateOrgDTO) {
    // Check tenant limits
    const tenant = await db.query.tenants.findFirst({
      where: eq(schema.tenants.id, tenantId)
    });
    
    const orgCount = await db.select({ count: count() })
      .from(schema.organizations)
      .where(eq(schema.organizations.tenantId, tenantId));
    
    if (orgCount[0].count >= tenant.maxOrganizations) {
      throw new Error('Organization limit reached for your plan');
    }
    
    return await db.insert(schema.organizations).values({
      ...data,
      tenantId, // Always set tenant ID
    }).returning();
  }
}
```

### Frontend Multi-Tenant Context

```typescript
// frontend/contexts/TenantContext.tsx
export const TenantProvider = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState(null);
  
  const switchTenant = async (tenantId: string) => {
    await api.switchTenant(tenantId);
    setCurrentTenant(tenantId);
    queryClient.invalidateQueries(); // Clear all cached data
  };
  
  return (
    <TenantContext.Provider value={{ currentTenant, switchTenant }}>
      {children}
    </TenantContext.Provider>
  );
};

// Usage in components
const MyComponent = () => {
  const { currentTenant } = useTenant();
  const { data } = useOrganizations({ tenantId: currentTenant.id });
  
  return <div>Organizations for {currentTenant.name}</div>;
};
```

## MCP Server Integration - Agent-Native Platform

### MCP Server Architecture

The platform will include a built-in MCP (Model Context Protocol) server that allows AI agents to fully control and operate the platform. This makes the system "agent-native" from the ground up.

```typescript
// api/src/mcp/server.ts
import { MCPServer } from '@modelcontextprotocol/server';
import { WebSocketTransport } from '@modelcontextprotocol/transport';

export class PlatformMCPServer {
  private server: MCPServer;
  
  constructor() {
    this.server = new MCPServer({
      name: 'goldengate-platform',
      version: '1.0.0',
      capabilities: {
        tools: true,
        resources: true,
        prompts: true,
        sampling: true
      }
    });
    
    this.registerTools();
    this.registerResources();
    this.registerPrompts();
  }
  
  private registerTools() {
    // Organization Management Tools
    this.server.addTool({
      name: 'create_organization',
      description: 'Create a new organization in the platform',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
          name: { type: 'string' },
          sector: { type: 'string' },
          location: { type: 'string' },
          description: { type: 'string' }
        },
        required: ['tenantId', 'name']
      },
      handler: async (params) => {
        return await organizationService.create(params.tenantId, params);
      }
    });
    
    this.server.addTool({
      name: 'analyze_contracts',
      description: 'Analyze contract values and trends for organizations',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
          organizationId: { type: 'string' },
          dateRange: { 
            type: 'object',
            properties: {
              start: { type: 'string', format: 'date' },
              end: { type: 'string', format: 'date' }
            }
          }
        }
      },
      handler: async (params) => {
        return await analyticsService.analyzeContracts(params);
      }
    });
    
    this.server.addTool({
      name: 'generate_report',
      description: 'Generate comprehensive reports for tenant data',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
          reportType: { 
            type: 'string', 
            enum: ['performance', 'contracts', 'deployments', 'comprehensive'] 
          },
          format: { type: 'string', enum: ['json', 'pdf', 'excel'] }
        }
      },
      handler: async (params) => {
        return await reportService.generate(params);
      }
    });
    
    // Deployment Automation Tools
    this.server.addTool({
      name: 'schedule_deployment',
      description: 'Schedule and manage deployments',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string' },
          organizationId: { type: 'string' },
          deploymentType: { type: 'string' },
          targetDate: { type: 'string', format: 'date' },
          configuration: { type: 'object' }
        }
      },
      handler: async (params) => {
        return await deploymentService.schedule(params);
      }
    });
  }
  
  private registerResources() {
    // Expose platform data as resources
    this.server.addResource({
      uri: 'platform://organizations',
      name: 'Organizations Database',
      description: 'Access to all organizations in the tenant',
      mimeType: 'application/json',
      handler: async (uri, context) => {
        const tenantId = context.tenantId;
        return await organizationService.findAll(tenantId);
      }
    });
    
    this.server.addResource({
      uri: 'platform://analytics/dashboard',
      name: 'Analytics Dashboard Data',
      description: 'Real-time analytics and metrics',
      mimeType: 'application/json',
      handler: async (uri, context) => {
        return await analyticsService.getDashboardData(context.tenantId);
      }
    });
  }
  
  private registerPrompts() {
    // Pre-built prompts for common agent tasks
    this.server.addPrompt({
      name: 'analyze_tenant_health',
      description: 'Analyze overall health and performance of a tenant',
      template: `Analyze the following tenant data and provide insights:
        - Organization count: {{orgCount}}
        - Active contracts: {{contractCount}}
        - Total contract value: {{totalValue}}
        - Recent deployments: {{deployments}}
        
        Provide recommendations for:
        1. Growth opportunities
        2. Risk areas
        3. Optimization suggestions`
    });
  }
}
```

### Agent-Native API Design

```typescript
// api/src/modules/agent/agent.service.ts
export class AgentService {
  async executeWorkflow(workflowId: string, context: AgentContext) {
    // Agents can execute complex multi-step workflows
    const workflow = await this.getWorkflow(workflowId);
    
    for (const step of workflow.steps) {
      const result = await this.executeStep(step, context);
      context.addResult(step.id, result);
      
      // Allow agents to make decisions based on results
      if (step.conditionalNext) {
        const nextStep = await this.evaluateCondition(step.conditionalNext, result);
        workflow.jumpTo(nextStep);
      }
    }
    
    return context.getResults();
  }
  
  async batchOperations(operations: AgentOperation[]) {
    // Efficient batch processing for agent operations
    return await db.transaction(async (tx) => {
      const results = [];
      for (const op of operations) {
        results.push(await this.executeOperation(op, tx));
      }
      return results;
    });
  }
}
```

### WebSocket Integration for Real-Time Agent Communication

```typescript
// api/src/mcp/websocket.ts
export const mcpWebSocketRoute = new Elysia()
  .ws('/mcp', {
    async open(ws) {
      const transport = new WebSocketTransport(ws);
      const mcpServer = new PlatformMCPServer();
      
      await mcpServer.connect(transport);
      console.log('MCP agent connected');
    },
    
    async message(ws, message) {
      // Handle MCP protocol messages
      await mcpServer.handleMessage(message);
    },
    
    async close(ws) {
      console.log('MCP agent disconnected');
    }
  });
```

## Fine-Grained RBAC (Role-Based Access Control)

### Policy-Based Authorization System

```typescript
// Database Schema for RBAC
export const policies = pgTable("policies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  resource: varchar("resource", { length: 100 }).notNull(), // e.g., "organizations", "contracts"
  action: varchar("action", { length: 50 }).notNull(), // e.g., "create", "read", "update", "delete", "list"
  conditions: jsonb("conditions"), // Dynamic conditions like {"ownOnly": true, "maxValue": 1000000}
  effect: varchar("effect", { enum: ["allow", "deny"] }).default("allow"),
  priority: integer("priority").default(0), // Higher priority policies override lower ones
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  resourceActionIdx: index("policy_resource_action_idx").on(table.resource, table.action),
}));

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isSystem: boolean("is_system").default(false), // System roles can't be modified
  isDefault: boolean("is_default").default(false), // Auto-assigned to new users
  maxUsers: integer("max_users"), // Limit users per role (for licensing)
  metadata: jsonb("metadata"), // Additional role configuration
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  tenantNameIdx: uniqueIndex("role_tenant_name_idx").on(table.tenantId, table.name),
}));

export const rolePolicies = pgTable("role_policies", {
  id: uuid("id").defaultRandom().primaryKey(),
  roleId: uuid("role_id").references(() => roles.id, { onDelete: "cascade" }),
  policyId: uuid("policy_id").references(() => policies.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  customConditions: jsonb("custom_conditions"), // Override policy conditions for this role
  expiresAt: timestamp("expires_at"), // Temporary policy assignments
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.roleId, table.policyId] }),
  roleIdx: index("role_policy_role_idx").on(table.roleId),
}));

export const userRoles = pgTable("user_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  roleId: uuid("role_id").references(() => roles.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  grantedBy: uuid("granted_by").references(() => users.id),
  expiresAt: timestamp("expires_at"), // Temporary role assignments
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.roleId, table.tenantId] }),
  userTenantIdx: index("user_role_user_tenant_idx").on(table.userId, table.tenantId),
}));

// Separate tables for agent RBAC
export const agentRoles = pgTable("agent_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentId: uuid("agent_id").notNull(),
  roleId: uuid("role_id").references(() => roles.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  grantedBy: uuid("granted_by").references(() => users.id),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.agentId, table.roleId, table.tenantId] }),
}));
```

### Default System Policies

```typescript
// Default fine-grained policies
const DEFAULT_POLICIES = [
  // Organization policies
  { name: "org:create", resource: "organizations", action: "create" },
  { name: "org:read", resource: "organizations", action: "read" },
  { name: "org:update", resource: "organizations", action: "update" },
  { name: "org:delete", resource: "organizations", action: "delete" },
  { name: "org:list", resource: "organizations", action: "list" },
  
  // Contract policies with conditions
  { 
    name: "contract:create:limited", 
    resource: "contracts", 
    action: "create",
    conditions: { maxValue: 1000000 } // Can only create contracts up to $1M
  },
  { 
    name: "contract:read:own", 
    resource: "contracts", 
    action: "read",
    conditions: { ownOnly: true } // Can only read own contracts
  },
  
  // MCP/Agent specific policies
  { name: "mcp:connect", resource: "mcp", action: "connect" },
  { name: "mcp:tool:use", resource: "mcp.tools", action: "execute" },
  { name: "mcp:resource:read", resource: "mcp.resources", action: "read" },
  { name: "mcp:workflow:execute", resource: "mcp.workflows", action: "execute" },
  
  // Admin policies
  { name: "tenant:manage", resource: "tenant", action: "manage" },
  { name: "user:manage", resource: "users", action: "manage" },
  { name: "role:manage", resource: "roles", action: "manage" },
  { name: "billing:manage", resource: "billing", action: "manage" },
];

// Default system roles with policy mappings
const DEFAULT_ROLES = [
  {
    name: "super_admin",
    policies: ["*"], // All policies
    isSystem: true,
  },
  {
    name: "tenant_admin",
    policies: [
      "org:*", "contract:*", "user:manage", "role:manage", 
      "mcp:*", "tenant:read"
    ],
    isSystem: true,
  },
  {
    name: "organization_manager",
    policies: [
      "org:create", "org:read", "org:update", "org:list",
      "contract:create:limited", "contract:read", "contract:update",
      "mcp:connect", "mcp:tool:use"
    ],
  },
  {
    name: "analyst",
    policies: [
      "org:read", "org:list", "contract:read", "contract:list",
      "mcp:resource:read"
    ],
  },
  {
    name: "viewer",
    policies: ["org:list", "contract:list"],
    isDefault: true, // New users get this role by default
  },
  {
    name: "agent_worker",
    policies: [
      "mcp:connect", "mcp:tool:use", "mcp:resource:read", 
      "mcp:workflow:execute", "org:read", "contract:read"
    ],
  },
];
```

### Authorization Middleware

```typescript
// middleware/authorization.ts
export class AuthorizationService {
  async checkPermission(
    userId: string,
    tenantId: string,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): Promise<boolean> {
    // Get user's roles
    const userRoles = await db.query.userRoles.findMany({
      where: and(
        eq(schema.userRoles.userId, userId),
        eq(schema.userRoles.tenantId, tenantId),
        or(
          isNull(schema.userRoles.expiresAt),
          gte(schema.userRoles.expiresAt, new Date())
        )
      ),
      with: {
        role: {
          with: {
            policies: {
              with: {
                policy: true
              }
            }
          }
        }
      }
    });
    
    // Collect all policies from all roles
    const policies = userRoles.flatMap(ur => 
      ur.role.policies.map(rp => ({
        ...rp.policy,
        customConditions: rp.customConditions
      }))
    );
    
    // Sort by priority (deny > allow, higher priority > lower)
    policies.sort((a, b) => {
      if (a.effect === 'deny' && b.effect === 'allow') return -1;
      if (a.effect === 'allow' && b.effect === 'deny') return 1;
      return b.priority - a.priority;
    });
    
    // Evaluate policies
    for (const policy of policies) {
      if (this.matchesPolicy(policy, resource, action, context)) {
        return policy.effect === 'allow';
      }
    }
    
    return false; // Default deny
  }
  
  private matchesPolicy(
    policy: Policy,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): boolean {
    // Check resource and action match (with wildcard support)
    if (!this.matchesPattern(policy.resource, resource)) return false;
    if (!this.matchesPattern(policy.action, action)) return false;
    
    // Evaluate conditions
    if (policy.conditions || policy.customConditions) {
      const conditions = { ...policy.conditions, ...policy.customConditions };
      return this.evaluateConditions(conditions, context);
    }
    
    return true;
  }
  
  private matchesPattern(pattern: string, value: string): boolean {
    if (pattern === '*') return true;
    if (pattern.endsWith('*')) {
      return value.startsWith(pattern.slice(0, -1));
    }
    return pattern === value;
  }
  
  private evaluateConditions(
    conditions: Record<string, any>,
    context?: Record<string, any>
  ): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      switch (key) {
        case 'ownOnly':
          if (value && context?.ownerId !== context?.userId) return false;
          break;
        case 'maxValue':
          if (context?.value && context.value > value) return false;
          break;
        case 'ipWhitelist':
          if (!value.includes(context?.ip)) return false;
          break;
        case 'timeRestriction':
          if (!this.isWithinTimeRange(value)) return false;
          break;
        // Add more condition evaluators as needed
      }
    }
    return true;
  }
}

// Elysia middleware integration
export const authorizationMiddleware = new Elysia()
  .derive(async ({ headers, jwt, set, params, body }) => {
    const authService = new AuthorizationService();
    
    // Extract user and tenant from JWT
    const token = headers.authorization?.replace('Bearer ', '');
    const payload = await jwt.verify(token);
    
    // Determine resource and action from route
    const resource = determineResource(params, body);
    const action = determineAction(request.method, params);
    
    // Check permission
    const hasPermission = await authService.checkPermission(
      payload.userId,
      payload.tenantId,
      resource,
      action,
      { ...body, userId: payload.userId, ip: request.ip }
    );
    
    if (!hasPermission) {
      set.status = 403;
      throw new Error('Insufficient permissions');
    }
    
    return { 
      userId: payload.userId,
      tenantId: payload.tenantId,
      permissions: payload.permissions 
    };
  });
```

## OAuth 2.0 Implementation (RFC 6749 & Latest Extensions)

### OAuth 2.0 Server Implementation

```typescript
// OAuth 2.0 database schema
export const oauthClients = pgTable("oauth_clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: varchar("client_id", { length: 255 }).notNull().unique(),
  clientSecret: text("client_secret").notNull(), // Hashed
  tenantId: uuid("tenant_id").references(() => tenants.id),
  name: varchar("name", { length: 255 }).notNull(),
  redirectUris: jsonb("redirect_uris").$type<string[]>().notNull(),
  grantTypes: jsonb("grant_types").$type<string[]>().notNull(), // authorization_code, client_credentials, refresh_token, device_code
  responseTypes: jsonb("response_types").$type<string[]>().notNull(), // code, token
  scopes: jsonb("scopes").$type<string[]>().notNull(),
  clientType: varchar("client_type", { enum: ["confidential", "public"] }).notNull(),
  tokenEndpointAuthMethod: varchar("token_endpoint_auth_method", { 
    enum: ["client_secret_basic", "client_secret_post", "client_secret_jwt", "private_key_jwt", "none"] 
  }).default("client_secret_basic"),
  jwksUri: text("jwks_uri"), // For JWT authentication
  logoUri: text("logo_uri"),
  policyUri: text("policy_uri"),
  tosUri: text("tos_uri"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const oauthAuthorizationCodes = pgTable("oauth_authorization_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 255 }).notNull().unique(),
  clientId: uuid("client_id").references(() => oauthClients.id),
  userId: uuid("user_id").references(() => users.id),
  redirectUri: text("redirect_uri").notNull(),
  scopes: jsonb("scopes").$type<string[]>().notNull(),
  codeChallenge: varchar("code_challenge", { length: 255 }), // PKCE
  codeChallengeMethod: varchar("code_challenge_method", { enum: ["S256", "plain"] }),
  nonce: varchar("nonce", { length: 255 }), // OpenID Connect
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const oauthAccessTokens = pgTable("oauth_access_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(), // JWT or opaque token
  tokenType: varchar("token_type", { enum: ["Bearer", "DPoP"] }).default("Bearer"),
  clientId: uuid("client_id").references(() => oauthClients.id),
  userId: uuid("user_id").references(() => users.id),
  agentId: uuid("agent_id"), // For agent tokens
  scopes: jsonb("scopes").$type<string[]>().notNull(),
  audience: jsonb("audience").$type<string[]>(), // Resource indicators (RFC 8707)
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  metadata: jsonb("metadata"), // Additional token metadata
  createdAt: timestamp("created_at").defaultNow(),
});

export const oauthRefreshTokens = pgTable("oauth_refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  accessTokenId: uuid("access_token_id").references(() => oauthAccessTokens.id),
  clientId: uuid("client_id").references(() => oauthClients.id),
  userId: uuid("user_id").references(() => users.id),
  scopes: jsonb("scopes").$type<string[]>().notNull(),
  expiresAt: timestamp("expires_at"),
  revokedAt: timestamp("revoked_at"),
  rotatedFrom: uuid("rotated_from"), // Token rotation chain
  createdAt: timestamp("created_at").defaultNow(),
});

// OAuth 2.0 Device Flow (RFC 8628)
export const oauthDeviceCodes = pgTable("oauth_device_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  deviceCode: varchar("device_code", { length: 255 }).notNull().unique(),
  userCode: varchar("user_code", { length: 20 }).notNull().unique(),
  clientId: uuid("client_id").references(() => oauthClients.id),
  scopes: jsonb("scopes").$type<string[]>().notNull(),
  interval: integer("interval").default(5), // Polling interval in seconds
  expiresAt: timestamp("expires_at").notNull(),
  authorizedAt: timestamp("authorized_at"),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### OAuth 2.0 Server Implementation with Latest Standards

```typescript
// api/src/oauth/server.ts
import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';

export class OAuth2Server {
  // Authorization Endpoint (RFC 6749 Section 3.1)
  async authorize(params: AuthorizeParams): Promise<AuthorizeResponse> {
    // Validate client
    const client = await this.validateClient(params.client_id);
    
    // Validate redirect URI
    if (!client.redirectUris.includes(params.redirect_uri)) {
      throw new Error('Invalid redirect URI');
    }
    
    // Validate response type
    if (!client.responseTypes.includes(params.response_type)) {
      throw new Error('Unsupported response type');
    }
    
    // PKCE validation (RFC 7636)
    if (client.clientType === 'public' && !params.code_challenge) {
      throw new Error('PKCE required for public clients');
    }
    
    // Generate authorization code
    const code = await this.generateAuthorizationCode({
      clientId: client.id,
      userId: params.userId,
      scopes: params.scope?.split(' ') || [],
      redirectUri: params.redirect_uri,
      codeChallenge: params.code_challenge,
      codeChallengeMethod: params.code_challenge_method,
      nonce: params.nonce, // OpenID Connect
    });
    
    // Return authorization code
    return {
      code: code.code,
      state: params.state,
    };
  }
  
  // Token Endpoint (RFC 6749 Section 3.2)
  async token(params: TokenParams): Promise<TokenResponse> {
    switch (params.grant_type) {
      case 'authorization_code':
        return await this.handleAuthorizationCodeGrant(params);
      
      case 'client_credentials':
        return await this.handleClientCredentialsGrant(params);
      
      case 'refresh_token':
        return await this.handleRefreshTokenGrant(params);
      
      case 'urn:ietf:params:oauth:grant-type:device_code':
        return await this.handleDeviceCodeGrant(params);
      
      case 'urn:ietf:params:oauth:grant-type:jwt-bearer':
        return await this.handleJWTBearerGrant(params); // RFC 7523
      
      default:
        throw new Error('Unsupported grant type');
    }
  }
  
  private async handleAuthorizationCodeGrant(params: any): Promise<TokenResponse> {
    // Validate authorization code
    const authCode = await this.validateAuthorizationCode(params.code);
    
    // PKCE verification (RFC 7636)
    if (authCode.codeChallenge) {
      const verifier = params.code_verifier;
      if (!verifier) throw new Error('code_verifier required');
      
      const challenge = authCode.codeChallengeMethod === 'S256'
        ? base64url(sha256(verifier))
        : verifier;
      
      if (challenge !== authCode.codeChallenge) {
        throw new Error('Invalid code_verifier');
      }
    }
    
    // Generate tokens
    const { accessToken, refreshToken, idToken } = await this.generateTokens({
      clientId: authCode.clientId,
      userId: authCode.userId,
      scopes: authCode.scopes,
      nonce: authCode.nonce,
      audience: params.resource, // Resource indicators (RFC 8707)
    });
    
    // Mark authorization code as used
    await this.markAuthorizationCodeAsUsed(authCode.id);
    
    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: refreshToken,
      scope: authCode.scopes.join(' '),
      id_token: idToken, // OpenID Connect
    };
  }
  
  // Introspection Endpoint (RFC 7662)
  async introspect(token: string, tokenTypeHint?: string): Promise<IntrospectionResponse> {
    const tokenData = await this.validateToken(token, tokenTypeHint);
    
    if (!tokenData || tokenData.revokedAt) {
      return { active: false };
    }
    
    return {
      active: true,
      scope: tokenData.scopes.join(' '),
      client_id: tokenData.clientId,
      username: tokenData.username,
      token_type: tokenData.tokenType,
      exp: Math.floor(tokenData.expiresAt.getTime() / 1000),
      iat: Math.floor(tokenData.createdAt.getTime() / 1000),
      nbf: Math.floor(tokenData.createdAt.getTime() / 1000),
      sub: tokenData.userId,
      aud: tokenData.audience,
      iss: process.env.OAUTH_ISSUER,
      jti: tokenData.id,
    };
  }
  
  // Revocation Endpoint (RFC 7009)
  async revoke(token: string, tokenTypeHint?: string): Promise<void> {
    const tokenData = await this.findToken(token, tokenTypeHint);
    
    if (tokenData) {
      await db.update(schema.oauthAccessTokens)
        .set({ revokedAt: new Date() })
        .where(eq(schema.oauthAccessTokens.id, tokenData.id));
      
      // Also revoke associated refresh tokens
      if (tokenData.refreshTokenId) {
        await db.update(schema.oauthRefreshTokens)
          .set({ revokedAt: new Date() })
          .where(eq(schema.oauthRefreshTokens.id, tokenData.refreshTokenId));
      }
    }
  }
  
  // Device Authorization Endpoint (RFC 8628)
  async deviceAuthorization(clientId: string, scope?: string): Promise<DeviceAuthResponse> {
    const client = await this.validateClient(clientId);
    
    if (!client.grantTypes.includes('urn:ietf:params:oauth:grant-type:device_code')) {
      throw new Error('Client not authorized for device flow');
    }
    
    const deviceCode = generateSecureRandom(32);
    const userCode = generateUserFriendlyCode(8); // e.g., "BDSD-HQMM"
    
    await db.insert(schema.oauthDeviceCodes).values({
      deviceCode,
      userCode,
      clientId: client.id,
      scopes: scope?.split(' ') || [],
      expiresAt: new Date(Date.now() + 600000), // 10 minutes
    });
    
    return {
      device_code: deviceCode,
      user_code: userCode,
      verification_uri: `${process.env.BASE_URL}/device`,
      verification_uri_complete: `${process.env.BASE_URL}/device?user_code=${userCode}`,
      expires_in: 600,
      interval: 5,
    };
  }
}

// OAuth 2.0 Routes
export const oauthRoutes = new Elysia({ prefix: '/oauth' })
  .use(jwt())
  
  // Authorization endpoint
  .get('/authorize', async ({ query, set }) => {
    const server = new OAuth2Server();
    return await server.authorize(query);
  })
  
  // Token endpoint
  .post('/token', async ({ body, headers, set }) => {
    const server = new OAuth2Server();
    
    // Client authentication (multiple methods supported)
    const client = await server.authenticateClient(headers, body);
    
    return await server.token({ ...body, clientId: client.id });
  })
  
  // Introspection endpoint
  .post('/introspect', async ({ body, headers }) => {
    const server = new OAuth2Server();
    await server.authenticateClient(headers, body);
    return await server.introspect(body.token, body.token_type_hint);
  })
  
  // Revocation endpoint
  .post('/revoke', async ({ body, headers }) => {
    const server = new OAuth2Server();
    await server.authenticateClient(headers, body);
    await server.revoke(body.token, body.token_type_hint);
    return { success: true };
  })
  
  // Device authorization endpoint
  .post('/device_authorization', async ({ body }) => {
    const server = new OAuth2Server();
    return await server.deviceAuthorization(body.client_id, body.scope);
  })
  
  // JWKS endpoint for public key discovery
  .get('/.well-known/jwks.json', async () => {
    return await getPublicKeySet();
  })
  
  // OpenID Connect Discovery
  .get('/.well-known/openid-configuration', async () => {
    return {
      issuer: process.env.OAUTH_ISSUER,
      authorization_endpoint: `${process.env.BASE_URL}/oauth/authorize`,
      token_endpoint: `${process.env.BASE_URL}/oauth/token`,
      userinfo_endpoint: `${process.env.BASE_URL}/oauth/userinfo`,
      jwks_uri: `${process.env.BASE_URL}/oauth/.well-known/jwks.json`,
      registration_endpoint: `${process.env.BASE_URL}/oauth/register`,
      scopes_supported: ['openid', 'profile', 'email', 'offline_access'],
      response_types_supported: ['code', 'token', 'id_token', 'code token', 'code id_token', 'token id_token', 'code token id_token'],
      grant_types_supported: ['authorization_code', 'implicit', 'client_credentials', 'refresh_token', 'urn:ietf:params:oauth:grant-type:device_code'],
      subject_types_supported: ['public', 'pairwise'],
      id_token_signing_alg_values_supported: ['RS256', 'ES256'],
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post', 'client_secret_jwt', 'private_key_jwt'],
      claims_supported: ['sub', 'iss', 'aud', 'exp', 'iat', 'name', 'email', 'email_verified'],
      code_challenge_methods_supported: ['S256', 'plain'],
    };
  });
```

## MCP Server Implementation (Latest Specification)

### MCP Protocol Implementation

```typescript
// api/src/mcp/protocol.ts
import { MCPServer as BaseMCPServer } from '@modelcontextprotocol/server';
import { 
  Tool, 
  Resource, 
  Prompt,
  ServerCapabilities,
  InitializeRequest,
  InitializeResponse,
  CallToolRequest,
  CallToolResponse,
  ListResourcesRequest,
  ListResourcesResponse,
  ReadResourceRequest,
  ReadResourceResponse,
  ListPromptsRequest,
  ListPromptsResponse,
  GetPromptRequest,
  GetPromptResponse,
  CompleteSamplingRequest,
  CompleteSamplingResponse,
} from '@modelcontextprotocol/types';

export class PlatformMCPServer extends BaseMCPServer {
  private rbacService: AuthorizationService;
  private oauth2Server: OAuth2Server;
  
  constructor() {
    super({
      name: 'goldengate-platform',
      version: '1.0.0',
    });
    
    this.rbacService = new AuthorizationService();
    this.oauth2Server = new OAuth2Server();
  }
  
  // Initialize handler - MCP spec requires this
  async handleInitialize(request: InitializeRequest): Promise<InitializeResponse> {
    // Validate client capabilities
    const clientCapabilities = request.params.capabilities;
    
    // Authenticate the agent using OAuth 2.0
    const token = request.params.authentication?.token;
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const tokenInfo = await this.oauth2Server.introspect(token);
    if (!tokenInfo.active) {
      throw new Error('Invalid or expired token');
    }
    
    // Set up server capabilities based on agent permissions
    const capabilities: ServerCapabilities = {
      tools: await this.canUseTools(tokenInfo.sub),
      resources: await this.canAccessResources(tokenInfo.sub),
      prompts: await this.canUsePrompts(tokenInfo.sub),
      sampling: await this.canUseSampling(tokenInfo.sub),
    };
    
    return {
      protocolVersion: '1.0.0',
      serverInfo: {
        name: this.name,
        version: this.version,
      },
      capabilities,
      metadata: {
        tenantId: tokenInfo.tenant_id,
        agentId: tokenInfo.sub,
        scopes: tokenInfo.scope,
      },
    };
  }
  
  // Tool execution with RBAC
  async handleCallTool(request: CallToolRequest, context: MCPContext): Promise<CallToolResponse> {
    const { name, arguments: args } = request.params;
    
    // Check if agent has permission to execute this tool
    const hasPermission = await this.rbacService.checkPermission(
      context.agentId,
      context.tenantId,
      `mcp.tools.${name}`,
      'execute',
      { toolName: name, arguments: args }
    );
    
    if (!hasPermission) {
      throw new Error(`Permission denied for tool: ${name}`);
    }
    
    // Audit log the tool execution
    await this.auditLog({
      agentId: context.agentId,
      tenantId: context.tenantId,
      action: 'tool_execution',
      resource: `mcp.tools.${name}`,
      parameters: args,
      timestamp: new Date(),
    });
    
    // Execute the tool with tenant context
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    
    try {
      const result = await tool.handler(args, context);
      
      // Audit successful execution
      await this.auditLog({
        agentId: context.agentId,
        action: 'tool_execution_success',
        resource: `mcp.tools.${name}`,
        result: { success: true },
      });
      
      return {
        type: 'tool_result',
        tool_result: result,
      };
    } catch (error) {
      // Audit failed execution
      await this.auditLog({
        agentId: context.agentId,
        action: 'tool_execution_failure',
        resource: `mcp.tools.${name}`,
        result: { error: error.message },
      });
      
      throw error;
    }
  }
  
  // Resource access with RBAC
  async handleReadResource(request: ReadResourceRequest, context: MCPContext): Promise<ReadResourceResponse> {
    const { uri } = request.params;
    
    // Check if agent has permission to read this resource
    const hasPermission = await this.rbacService.checkPermission(
      context.agentId,
      context.tenantId,
      `mcp.resources.${uri}`,
      'read',
      { uri }
    );
    
    if (!hasPermission) {
      throw new Error(`Permission denied for resource: ${uri}`);
    }
    
    // Apply tenant filtering to resource data
    const resource = this.resources.get(uri);
    if (!resource) {
      throw new Error(`Resource not found: ${uri}`);
    }
    
    const data = await resource.handler(uri, context);
    
    // Filter data based on tenant context
    const filteredData = await this.applyTenantFilter(data, context.tenantId);
    
    return {
      contents: [{
        uri,
        mimeType: resource.mimeType,
        text: JSON.stringify(filteredData),
      }],
    };
  }
  
  // Sampling with rate limiting
  async handleCompleteSampling(request: CompleteSamplingRequest, context: MCPContext): Promise<CompleteSamplingResponse> {
    // Check rate limits for this agent
    const rateLimitOk = await this.checkRateLimit(context.agentId, 'sampling');
    if (!rateLimitOk) {
      throw new Error('Rate limit exceeded');
    }
    
    // Check if agent has sampling permission
    const hasPermission = await this.rbacService.checkPermission(
      context.agentId,
      context.tenantId,
      'mcp.sampling',
      'execute'
    );
    
    if (!hasPermission) {
      throw new Error('Permission denied for sampling');
    }
    
    // Process sampling request with tenant context
    const result = await this.processSampling(request.params, context);
    
    return {
      type: 'sampling_result',
      sampling_result: result,
    };
  }
  
  private async checkRateLimit(agentId: string, operation: string): Promise<boolean> {
    const key = `rate_limit:${agentId}:${operation}`;
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, 60); // 1 minute window
    }
    
    const limit = await this.getAgentRateLimit(agentId, operation);
    return current <= limit;
  }
  
  private async auditLog(entry: AuditLogEntry): Promise<void> {
    await db.insert(schema.agentAuditLog).values(entry);
  }
}
```

### Frontend Agent Interaction

```typescript
// frontend/hooks/useAgent.ts
export const useAgent = () => {
  const [agentStatus, setAgentStatus] = useState<'idle' | 'working' | 'error'>('idle');
  
  const executeAgentTask = async (task: AgentTask) => {
    setAgentStatus('working');
    
    try {
      // Connect to MCP server via WebSocket
      const ws = new WebSocket(`${WS_URL}/mcp`);
      
      const result = await new Promise((resolve, reject) => {
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'result') {
            resolve(data.result);
          }
        };
        
        ws.onerror = reject;
        
        // Send task to agent
        ws.send(JSON.stringify({
          type: 'tool',
          tool: task.tool,
          params: task.params
        }));
      });
      
      setAgentStatus('idle');
      return result;
    } catch (error) {
      setAgentStatus('error');
      throw error;
    }
  };
  
  return { executeAgentTask, agentStatus };
};

// Usage in component
const DashboardPage = () => {
  const { executeAgentTask } = useAgent();
  
  const handleGenerateReport = async () => {
    const report = await executeAgentTask({
      tool: 'generate_report',
      params: {
        tenantId: currentTenant.id,
        reportType: 'comprehensive',
        format: 'pdf'
      }
    });
    
    // Display or download report
  };
  
  return (
    <Button onClick={handleGenerateReport}>
      Generate AI Report
    </Button>
  );
};
```

## Multi-Tenant Security Considerations

### Row-Level Security (RLS) in PostgreSQL
```sql
-- Enable RLS on tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create policy for tenant isolation
CREATE POLICY tenant_isolation ON organizations
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Set tenant context in application
SET LOCAL app.current_tenant_id = 'tenant-uuid-here';
```

### Billing & Usage Tracking
```typescript
export const usageMetrics = pgTable("usage_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  metricType: varchar("metric_type", { length: 50 }), // api_calls, storage, users
  value: integer("value"),
  period: date("period"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const billingPlans = pgTable("billing_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }),
  maxUsers: integer("max_users"),
  maxOrganizations: integer("max_organizations"),
  maxApiCalls: integer("max_api_calls"),
  priceMonthly: decimal("price_monthly", { precision: 10, scale: 2 }),
  features: jsonb("features"),
});
```

## Agent-Native Benefits

### Why MCP Server Integration Matters

1. **Full Automation**: Agents can perform any operation a human user can
2. **Workflow Orchestration**: Complex multi-step processes automated end-to-end
3. **Intelligent Insights**: Agents can analyze data and provide recommendations
4. **24/7 Operations**: Continuous monitoring and management without human intervention
5. **Custom Integrations**: Easy to extend with new tools and capabilities

### Use Cases for Agent Control

- **Automated Reporting**: Generate and distribute reports on schedule
- **Data Analysis**: Continuous analysis of contracts, metrics, and trends
- **Deployment Management**: Intelligent scheduling and execution of deployments
- **Anomaly Detection**: Real-time monitoring for unusual patterns
- **Customer Support**: Agent-powered support and troubleshooting
- **Data Entry**: Bulk import and validation of organization data
- **Compliance Monitoring**: Automated compliance checks and alerts

## Conclusion

The migration to a modern **agent-native, multi-tenant** full-stack architecture with:
- **Frontend**: Vite + TanStack (Router, Query, Table, Form)
- **Backend**: Bun + Elysia + Drizzle ORM + PostgreSQL
- **Multi-Tenancy**: Hybrid approach with row-level security
- **MCP Server**: Built-in Model Context Protocol for agent control

This provides:
- **Agent-Native Platform**: AI agents can fully control and operate the system
- **Multi-tenant SaaS platform** with tenant isolation
- **MCP Protocol Support**: Industry-standard agent communication
- **Real-time WebSocket** connections for agent interactions
- **Comprehensive audit logging** for agent actions
- **Subscription/billing** support for different plans
- **End-to-end type safety** with shared schemas
- **Tenant-aware caching** and data fetching
- **Custom domains** per tenant
- **Role-based access control** for both humans and agents
- **10-100x faster** development experience
- **Scalable architecture** for growth
- Foundation for **autonomous operations**

The phased approach minimizes risk while ensuring continuous delivery of value. With proper planning and execution, this migration will position the application for long-term success.

## Next Steps

1. Review and approve migration proposal
2. Set up backend infrastructure (PostgreSQL, Drizzle schemas)
3. Implement core API endpoints with Elysia
4. Begin frontend migration with TanStack setup
5. Establish weekly progress reviews
6. Create detailed component inventory for migration tracking

## Immediate Action Items

### Backend (Week 1) - Multi-Tenant & Agent-Native Foundation
- [ ] Set up PostgreSQL with Docker Compose
- [ ] Create Drizzle schema files with tenant support
- [ ] Implement tenant middleware for API isolation
- [ ] Set up Row-Level Security (RLS) policies
- [ ] **Implement MCP server with core tools**
- [ ] **Set up WebSocket endpoint for agent connections**
- [ ] **Create agent permission system**
- [ ] **Implement agent audit logging**
- [ ] Implement tenant-aware CRUD operations
- [ ] Set up JWT authentication with tenant & agent context
- [ ] Create tenant onboarding flow
- [ ] Implement billing/subscription models
- [ ] Create Swagger documentation with tenant context
- [ ] **Document MCP tools and resources for agents**

### Frontend (Week 2+) - Multi-Tenant & Agent-Enabled UI
- [ ] Initialize Vite project with TanStack Router
- [ ] Set up TanStack Query with tenant-aware caching
- [ ] Create TenantContext and provider
- [ ] **Implement useAgent hook for MCP interactions**
- [ ] **Create agent status indicator component**
- [ ] **Build agent task queue UI**
- [ ] Implement tenant switcher component
- [ ] Create tenant-scoped routing (subdomain/path-based)
- [ ] Add tenant branding/theming support
- [ ] **Create agent-assisted form components**
- [ ] **Build agent workflow builder UI**
- [ ] Create shared type definitions with tenant & agent models
- [ ] Migrate components with tenant context
- [ ] Implement tenant-aware data fetching hooks
- [ ] **Add real-time agent activity feed**