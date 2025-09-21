# GoldenGate API - Comprehensive Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Design](#architecture--design)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [Multi-Tenancy](#multi-tenancy)
7. [API Endpoints](#api-endpoints)
8. [Middleware System](#middleware-system)
9. [Security Implementation](#security-implementation)
10. [Development Environment](#development-environment)
11. [Deployment & Configuration](#deployment--configuration)
12. [Frontend Integration](#frontend-integration)
13. [Testing](#testing)
14. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

### Vision
GoldenGate is a **multi-tenant, agent-native platform** designed to enable AI agent orchestration and management at scale. Built from the ground up with enterprise-grade security, fine-grained access control, and OAuth 2.0 compliance.

### Key Features
- **🏢 Multi-Tenant Architecture**: Complete tenant isolation with row-level security
- **🤖 Agent-Native Design**: Built for AI agent orchestration via MCP and ATF
- **🔐 Enterprise Security**: OAuth 2.0, JWT, fine-grained RBAC, rate limiting
- **⚡ High Performance**: Bun runtime, Elysia framework, optimized database queries
- **🔄 Standards Compliant**: OAuth 2.0 RFC 6749, OpenAPI, RESTful design
- **📊 Comprehensive Logging**: Audit trails, security events, performance metrics

### Current Status
- ✅ **Complete Backend API** with authentication and user management
- ✅ **Database Schema** with 37 tables covering all business domains
- ✅ **Multi-tenant middleware** with tenant resolution strategies
- ✅ **RBAC system** with 22 policies and 4 default roles
- ✅ **OAuth 2.0 server** with authorization code flow
- ✅ **Docker development environment** with PostgreSQL, Redis, Adminer
- 🚧 **MCP server integration** (planned)
- 🚧 **Agent Taskflow integration** (schema ready, endpoints planned)

---

## 🏗️ Architecture & Design

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │   Mobile App    │    │  Third-Party    │
│  (React/Vite)   │    │   (React Native)│    │  Applications   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │    API Gateway/Proxy      │
                    │   (Rate Limiting, CORS)   │
                    └─────────────┬─────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
    ┌─────┴─────┐         ┌───────┴───────┐      ┌────────┴────────┐
    │   Auth    │         │  GoldenGate   │      │   MCP Server    │
    │ Service   │         │  API Server   │      │ (Agent Control) │
    │(OAuth2.0) │         │   (Elysia)    │      │                 │
    └─────┬─────┘         └───────┬───────┘      └────────┬────────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │    Database Layer         │
                    │   (PostgreSQL + Redis)    │
                    └───────────────────────────┘
```

### Design Principles

1. **Multi-Tenancy First**: Every operation is tenant-aware
2. **Security by Default**: Fail-closed security model
3. **Agent-Native**: Designed for AI agent orchestration
4. **Standards Compliance**: OAuth 2.0, OpenAPI, HTTP standards
5. **Scalability**: Horizontal scaling capabilities built-in
6. **Observability**: Comprehensive logging and monitoring

---

## 🔧 Technology Stack

### Runtime & Framework
- **[Bun](https://bun.sh)**: High-performance JavaScript runtime
- **[Elysia](https://elysiajs.com)**: Type-safe web framework for Bun
- **TypeScript**: Type safety and developer experience

### Database & ORM
- **[PostgreSQL 16](https://postgresql.org)**: Primary database with JSON support
- **[Drizzle ORM](https://orm.drizzle.team)**: Type-safe ORM with migrations
- **[Redis 7](https://redis.io)**: Caching and session storage

### Security & Authentication
- **[Argon2](https://github.com/P-H-C/phc-winner-argon2)**: Password hashing
- **[Jose](https://github.com/panva/jose)**: JWT operations
- **[Nanoid](https://github.com/ai/nanoid)**: Secure ID generation

### Development & DevOps
- **[Docker Compose](https://docs.docker.com/compose/)**: Local development environment
- **[Biome](https://biomejs.dev)**: Linting and formatting
- **[Adminer](https://www.adminer.org)**: Database administration UI

### Monitoring & Observability
- **Structured Logging**: JSON format with correlation IDs
- **Health Checks**: Database and service health endpoints
- **Metrics Collection**: Performance and usage metrics

---

## 🗄️ Database Schema

### Schema Overview
The database consists of **37 tables** organized into **7 logical domains**:

#### 1. Multi-Tenancy (1 table)
- `tenants` - Root tenant configuration and limits

#### 2. User Management (5 tables)
- `users` - Core user accounts
- `user_profiles` - Extended user information
- `user_sessions` - Active user sessions
- `user_tenants` - User-tenant relationships
- `user_organizations` - User-organization memberships

#### 3. Organizations (6 tables)
- `organizations` - Company/organization entities
- `contracts` - Business contracts and agreements
- `contract_items` - Contract line items
- `metrics` - Business metrics and KPIs
- `deployments` - System deployments
- `deployment_logs` - Deployment audit trails

#### 4. Agent Management (11 tables)
- `user_agents` - User-owned agents (ATF integration)
- `agents` - System-level agents (MCP integration)
- `agent_executions` - Agent execution history
- `agent_permissions` - Agent access controls
- `agent_sessions` - Active agent connections
- `agent_workflows` - Workflow definitions
- `workflow_executions` - Workflow runs
- `workflow_logs` - Workflow execution logs
- `agent_audit_log` - Agent activity audit trail

#### 5. Authentication & OAuth (4 tables)
- `oauth_clients` - OAuth 2.0 client applications
- `oauth_access_tokens` - Active access tokens
- `oauth_refresh_tokens` - Refresh tokens
- `oauth_authorization_codes` - Authorization codes (PKCE)

#### 6. RBAC System (4 tables)
- `policies` - Permission policies
- `roles` - User roles
- `role_policies` - Role-policy mappings
- `user_roles` - User role assignments

#### 7. Billing & Subscriptions (6 tables)
- `subscription_plans` - Available subscription tiers
- `tenant_subscriptions` - Active subscriptions
- `invoices` - Billing invoices
- `invoice_line_items` - Invoice details
- `payment_methods` - Stored payment methods
- `payment_transactions` - Payment history
- `usage_records` - Metered billing data
- `credit_adjustments` - Account credits/debits

### Key Design Features

#### UUID Primary Keys
All tables use UUID primary keys for:
- **Security**: Non-enumerable, non-predictable IDs
- **Distribution**: Globally unique across systems
- **Performance**: Better for distributed systems

#### JSONB Fields
Strategic use of JSONB for flexible data:
- `settings`, `metadata`, `preferences` - Configuration data
- `conditions` - Dynamic RBAC policy conditions
- `capabilities` - Agent feature descriptions

#### Timestamps
Consistent timestamp fields:
- `created_at` - Record creation (non-null, default now)
- `updated_at` - Last modification (non-null, default now)
- `expires_at` - Expiration times for tokens/sessions

#### Indexing Strategy
Optimized indexes for:
- **Tenant isolation**: All queries filtered by tenant_id
- **Authentication**: Email, username, token lookups
- **Time-based queries**: Created/updated timestamp ranges
- **Multi-column**: Composite indexes for common query patterns

---

## 🔐 Authentication & Authorization

### OAuth 2.0 Implementation

#### Supported Flows
1. **Authorization Code Flow** (Primary)
   - PKCE support for public clients
   - State parameter for CSRF protection
   - Refresh token rotation

2. **Client Credentials Flow** (Planned)
   - For service-to-service authentication
   - Machine-to-machine integrations

#### OAuth 2.0 Endpoints
```
GET  /api/v1/auth/oauth/authorize  - Authorization endpoint
POST /api/v1/auth/oauth/token      - Token exchange endpoint
GET  /.well-known/oauth-info       - OAuth server metadata (planned)
GET  /.well-known/jwks.json        - Public keys for token verification (planned)
```

#### Token Types
- **Access Tokens**: JWT format, 1-hour expiry
- **Refresh Tokens**: Opaque strings, 30-day expiry
- **Authorization Codes**: 10-minute expiry, one-time use

### Authentication Strategies

#### 1. JWT Bearer Tokens
```typescript
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **Algorithm**: HS256 (HMAC SHA-256)
- **Expiry**: 1 hour (configurable)
- **Claims**: sub, email, sessionId, iat, exp, iss

#### 2. Session Tokens
```typescript
X-Session-Token: AbC123XyZ789...
```
- **Format**: Secure random string (32 characters)
- **Storage**: Database with expiration
- **Use Case**: Mobile apps, long-lived sessions

#### 3. OAuth Access Tokens
```typescript
Authorization: Bearer AbC123XyZ789...
```
- **Format**: Opaque strings
- **Validation**: Database lookup required
- **Scopes**: openid, profile, email, agents

### RBAC (Role-Based Access Control)

#### Policy Structure
```json
{
  "name": "users:read:own",
  "description": "Read own user profile",
  "resource": "users",
  "action": "read",
  "effect": "allow",
  "conditions": [
    {
      "field": "user.id",
      "operator": "eq", 
      "value": "context.user.id"
    }
  ],
  "priority": 100
}
```

#### Default Roles & Permissions

##### 1. **user** (Default Role)
**Capabilities:**
- ✅ Read/update own profile
- ✅ Manage own agents (create, read, update, delete)
- ✅ Read organization information
- ❌ Cannot manage other users
- ❌ Cannot access admin functions

**Use Case:** Standard end users, individual contributors

##### 2. **org_admin** (Organization Administrator)
**Capabilities:**
- ✅ All user permissions
- ✅ Read all users in organization
- ✅ Create and update users in organization
- ✅ Manage all agents in organization
- ✅ Update organization settings
- ❌ Cannot delete users
- ❌ Cannot access system-wide settings

**Use Case:** Department heads, team leads

##### 3. **admin** (System Administrator)
**Capabilities:**
- ✅ All org_admin permissions
- ✅ Full user lifecycle management (create, read, update, delete)
- ✅ Organization management (create, update, delete)
- ✅ System agent management
- ✅ Tenant configuration access
- ✅ Role and permission management
- ✅ Audit log access
- ❌ Cross-tenant access (still tenant-bound)

**Use Case:** System administrators, DevOps teams

##### 4. **super_admin** (Super Administrator)
**Capabilities:**
- ✅ **Unrestricted access** (bypasses RBAC checks)
- ✅ Cross-tenant operations
- ✅ System maintenance functions
- ✅ Emergency access capabilities

**Use Case:** Platform owners, emergency access

#### Permission Evaluation Algorithm
1. **Fetch user roles** for the tenant
2. **Collect all policies** assigned to those roles
3. **Sort by priority** (higher priority first)
4. **Evaluate conditions** in order:
   - Check field operators (eq, ne, gt, gte, lt, lte, in, contains)
   - Resolve context values (user.id, tenant.id, etc.)
5. **Return first matching policy result** (allow/deny)
6. **Default to deny** if no policies match

---

## 🏢 Multi-Tenancy

### Tenant Resolution Strategies

#### 1. Header-Based (Default)
```http
X-Tenant-ID: 658146d8-2572-4fdb-9cb3-350ddab5893a
```
- **Use Case**: API clients, mobile apps
- **Security**: Validated against user's tenant access
- **Flexibility**: Easy to implement and test

#### 2. Subdomain-Based
```
https://acme.goldengate.app/api/v1/users
```
- **Use Case**: SaaS applications
- **DNS**: Requires wildcard DNS configuration
- **Branding**: Custom subdomains for enterprises

#### 3. Path-Based
```
https://api.goldengate.app/acme/v1/users
```
- **Use Case**: API gateways, proxy services
- **Routing**: Path segment extraction
- **Compatibility**: Works with all clients

#### 4. Domain-Based
```
https://acme-api.goldengate.app/v1/users
```
- **Use Case**: Enterprise installations
- **SSL**: Requires certificate management
- **Isolation**: Complete domain separation

### Tenant Isolation

#### Database Level
- **Row-Level Security**: Every query filtered by tenant_id
- **Foreign Keys**: All relationships include tenant_id
- **Indexes**: Tenant-aware indexes for performance

#### Application Level
- **Middleware Validation**: Tenant access verified on each request
- **Context Propagation**: Tenant context passed through request pipeline
- **Error Isolation**: Tenant-specific error handling and logging

#### Resource Limits
```json
{
  "limits": {
    "maxUsers": 100,
    "maxOrganizations": 10, 
    "maxAgents": 50,
    "storageGB": 10,
    "apiCallsPerHour": 10000
  }
}
```

---

## 🛠️ API Endpoints

### Authentication Endpoints

#### POST /api/v1/auth/register
**Purpose**: Register new user account

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securePassword123",
  "fullName": "John Doe",
  "tenantId": "uuid" // optional
}
```

**Response**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe", 
    "fullName": "John Doe"
  }
}
```

**Validation**:
- Email format validation
- Username: 3-50 characters, alphanumeric + underscore
- Password: Minimum 8 characters
- Duplicate email/username checking

---

#### POST /api/v1/auth/login
**Purpose**: Authenticate user and create session

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe"
  }
}
```

**Security Features**:
- Argon2 password verification
- Rate limiting (5 attempts per 15 minutes)
- Session creation with expiry
- Last login timestamp update

---

#### GET /api/v1/auth/me
**Purpose**: Get current user information

**Headers**:
```http
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com", 
  "username": "johndoe",
  "fullName": "John Doe",
  "tenantId": "uuid",
  "role": "user"
}
```

---

#### POST /api/v1/auth/logout
**Purpose**: Invalidate current session

**Headers**:
```http
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "message": "Logged out successfully"
}
```

**Actions Performed**:
- Session invalidation in database
- Token blacklisting (planned)
- Audit log entry

---

### OAuth 2.0 Endpoints

#### GET /api/v1/auth/oauth/authorize
**Purpose**: OAuth 2.0 authorization endpoint (RFC 6749)

**Query Parameters**:
```
client_id=goldengate-web
redirect_uri=https://app.example.com/callback  
response_type=code
scope=openid profile email agents
state=randomState123
code_challenge=base64url_encoded_challenge
code_challenge_method=S256
```

**Response** (Success):
```json
{
  "client_id": "goldengate-web",
  "redirect_uri": "https://app.example.com/callback",
  "response_type": "code",
  "scope": "openid profile email agents", 
  "state": "randomState123",
  "authorize_url": "https://api.goldengate.app/auth/login?client_id=..."
}
```

**Validation**:
- Client ID verification
- Redirect URI validation against registered URIs
- PKCE challenge validation (optional but recommended)

---

#### POST /api/v1/auth/oauth/token
**Purpose**: Exchange authorization code for tokens

**Request Body**:
```json
{
  "grant_type": "authorization_code",
  "code": "auth_code_from_previous_step",
  "client_id": "goldengate-web",
  "client_secret": "client_secret",
  "redirect_uri": "https://app.example.com/callback",
  "code_verifier": "original_code_verifier"
}
```

**Response**:
```json
{
  "access_token": "opaque_access_token",
  "token_type": "Bearer", 
  "expires_in": 3600,
  "refresh_token": "opaque_refresh_token",
  "scope": "openid profile email agents"
}
```

**Security Features**:
- Authorization code single-use validation
- PKCE code verifier validation
- Client authentication (secret or PKCE)
- Scope validation and filtering

---

### User Management Endpoints

#### GET /api/v1/users
**Purpose**: List all users (admin only)

**Headers**:
```http
Authorization: Bearer <token>
X-Tenant-ID: <tenant_uuid>
```

**Response**:
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe", 
      "fullName": "John Doe",
      "isActive": true,
      "isEmailVerified": true,
      "lastLoginAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "role": "user",
      "profileBio": "Software Developer",
      "profileAvatarUrl": "https://..."
    }
  ]
}
```

**RBAC**: Requires `users:read` permission

---

#### GET /api/v1/users/:id
**Purpose**: Get single user details

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe", 
    "isActive": true,
    "isEmailVerified": true,
    "lastLoginAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "role": "user",
    "profile": {
      "bio": "Software Developer",
      "avatarUrl": "https://...",
      "phone": "+1-555-0123",
      "timezone": "America/New_York",
      "preferences": {
        "theme": "dark",
        "notifications": true
      }
    },
    "organizations": "uuid",
    "organizationName": "Acme Corp",
    "roles": [
      {
        "roleName": "user",
        "roleDescription": "Standard user with basic permissions"
      }
    ]
  }
}
```

**RBAC**: Own profile (always allowed) or `users:read` permission

---

#### POST /api/v1/users
**Purpose**: Create new user (admin only)

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "username": "newuser", 
  "password": "securePassword123",
  "fullName": "New User",
  "role": "user", // optional, defaults to "user"
  "organizationId": "uuid" // optional
}
```

**RBAC**: Requires `users:create` permission

---

#### PATCH /api/v1/users/:id
**Purpose**: Update user information

**Request Body**:
```json
{
  "email": "updated@example.com", // optional
  "username": "updatedname", // optional
  "fullName": "Updated Name", // optional
  "isActive": true, // optional, admin only
  "role": "org_admin" // optional, admin only
}
```

**RBAC**: Own profile (limited fields) or `users:update` permission

---

#### PATCH /api/v1/users/:id/profile
**Purpose**: Update user profile information

**Request Body**:
```json
{
  "bio": "Updated bio text",
  "avatarUrl": "https://new-avatar-url.com/image.jpg",
  "phone": "+1-555-0199", 
  "timezone": "Europe/London",
  "preferences": {
    "theme": "light",
    "notifications": false,
    "language": "en"
  }
}
```

**RBAC**: Own profile (always allowed) or `users:update` permission

---

#### DELETE /api/v1/users/:id
**Purpose**: Soft delete user (deactivate)

**RBAC**: Requires `users:delete` permission

**Note**: This performs a soft delete by setting `isActive = false`

---

#### POST /api/v1/users/:id/change-password
**Purpose**: Change user password

**Request Body**:
```json
{
  "currentPassword": "oldPassword123", // required for own password
  "newPassword": "newSecurePassword456"
}
```

**Security Features**:
- Current password verification for own account
- Admin can change any password without current password
- Password strength validation
- Session invalidation after password change

---

## 🔒 Middleware System

### Authentication Middleware (`authMiddleware`)

**Purpose**: Extract and validate authentication tokens

**Token Sources**:
1. `Authorization: Bearer <token>` header (primary)
2. `X-Session-Token: <token>` header (alternative)

**Validation Process**:
1. **Extract token** from request headers
2. **Determine token type** (JWT vs session token)
3. **Validate token**:
   - JWT: Verify signature and expiration
   - Session: Database lookup and expiration check
4. **Load user data** from database
5. **Add to context**: `user`, `userId`, `sessionId`, `token`

**Error Handling**:
- Invalid tokens: 401 Unauthorized
- Expired tokens: 401 Unauthorized with specific error
- Database errors: 500 Internal Server Error

---

### Tenant Middleware (`tenantMiddleware`)

**Purpose**: Resolve and validate tenant context

**Configuration Options**:
```typescript
{
  strategy: "header" | "subdomain" | "path" | "domain",
  headerName?: string, // default: "x-tenant-id"
  pathSegment?: number, // for path strategy
  required?: boolean // default: true
}
```

**Resolution Process**:
1. **Extract tenant identifier** based on strategy
2. **Resolve tenant** from database (by slug or ID)
3. **Validate tenant status** (must be active)
4. **Check user access** (if authenticated)
5. **Add to context**: `tenant`, `tenantId`

**Tenant Validation**:
- Tenant exists and is active
- User has access to the tenant (if authenticated)
- Tenant limits not exceeded

---

### RBAC Middleware (`rbacMiddleware`)

**Purpose**: Load user permissions and roles

**Process**:
1. **Require authentication** (user must be authenticated)
2. **Load user roles** for current tenant
3. **Collect policies** from roles
4. **Build permission list** (`resource:action` format)
5. **Add to context**: `permissions`, `userRoles`

**Permission Format**:
```typescript
[
  "users:read:own",
  "users:update:own", 
  "agents:create:own",
  "agents:read:own",
  "organizations:read"
]
```

---

### Permission Check Middleware (`requirePermission`)

**Purpose**: Enforce specific permission requirements

**Usage**:
```typescript
.get("/users", handler, {
  beforeHandle: [
    requireAuth(),
    requireTenant(), 
    requirePermission("users", "read")
  ]
})
```

**Evaluation Process**:
1. **Get applicable policies** for user/tenant/resource/action
2. **Sort by priority** (higher first)
3. **Evaluate conditions**:
   - Field extraction from context
   - Operator evaluation (eq, ne, gt, etc.)
   - Context value resolution
4. **Return first match** (allow/deny)
5. **Default to deny** if no matches

**Condition Evaluation**:
```typescript
// Example condition: user can only read own profile
{
  "field": "user.id",
  "operator": "eq",
  "value": "context.user.id"
}

// Context resolution
const contextValue = getContextValue("user.id", context); // current user ID
const targetValue = getContextValue("context.user.id", context); // same
return contextValue === targetValue; // true = allow
```

---

### Rate Limiting Middleware (`rateLimiting`)

**Purpose**: Protect against abuse and ensure fair usage

**Rate Limiting Strategies**:

#### 1. IP-based Limiting
```typescript
rateLimitByIP(100, 900000) // 100 requests per 15 minutes
```

#### 2. User-based Limiting  
```typescript
rateLimitByUser(1000, 3600000) // 1000 requests per hour
```

#### 3. Tenant-based Limiting
```typescript
rateLimitByTenant(10000, 3600000) // 10k requests per hour per tenant
```

#### 4. Endpoint-based Limiting
```typescript
rateLimitByEndpoint(10, 60000) // 10 requests per minute per endpoint
```

#### 5. Burst Limiting
```typescript
burstRateLimit(20, 100, 3600000) // 20 burst, 100 sustained per hour
```

**Storage**: In-memory Map (development) / Redis (production)

**Response Headers**:
```http
X-Rate-Limit-Limit: 1000
X-Rate-Limit-Remaining: 742  
X-Rate-Limit-Reset: 2024-01-15T11:00:00Z
Retry-After: 1800
```

---

## 🛡️ Security Implementation

### Password Security

#### Hashing Algorithm
- **Algorithm**: Argon2id (winner of Password Hashing Competition)
- **Configuration**: 
  - Memory: 64MB
  - Iterations: 3
  - Parallelism: 4 threads
- **Salt**: Automatically generated per password
- **Verification**: Constant-time comparison

```typescript
// Password hashing
const passwordHash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 64MB
  timeCost: 3,
  parallelism: 4,
});

// Password verification  
const isValid = await argon2.verify(storedHash, inputPassword);
```

---

### Token Security

#### JWT Tokens
- **Algorithm**: HS256 (HMAC SHA-256)
- **Secret**: 32+ character random string
- **Expiry**: 1 hour (short-lived)
- **Claims**: Minimal necessary data only

```json
{
  "sub": "user-uuid",
  "sessionId": "session-uuid", 
  "email": "user@example.com",
  "iat": 1704614400,
  "exp": 1704618000,
  "iss": "https://api.goldengate.app"
}
```

#### Session Tokens
- **Format**: Cryptographically secure random strings (32 chars)
- **Storage**: Database with expiration
- **Expiry**: 7 days (configurable)
- **Invalidation**: Immediate upon logout

#### OAuth Tokens
- **Access Tokens**: Opaque strings, 1-hour expiry
- **Refresh Tokens**: Opaque strings, 30-day expiry, single-use
- **Authorization Codes**: 10-minute expiry, single-use, PKCE support

---

### HTTPS & TLS

**Development**:
- HTTP acceptable for localhost development
- HTTPS required for production deployment

**Production Requirements**:
- TLS 1.2+ only
- Strong cipher suites
- HSTS headers
- Certificate pinning recommended

---

### CORS Configuration

**Development Settings**:
```typescript
{
  origin: [
    "http://localhost:3000",  // React dev server
    "http://localhost:5173",  // Vite dev server  
  ],
  credentials: true, // Allow cookies/auth headers
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-ID"]
}
```

**Production Settings**:
- Restrict origins to production domains only
- Use HTTPS origins exclusively
- Implement preflight caching

---

### Input Validation & Sanitization

#### Request Validation
- **Schema Validation**: Elysia + TypeScript runtime validation
- **Type Safety**: Compile-time and runtime type checking
- **Size Limits**: Request body size limits
- **Format Validation**: Email, URL, UUID format checking

```typescript
{
  body: t.Object({
    email: t.String({ format: "email", maxLength: 255 }),
    username: t.String({ minLength: 3, maxLength: 50, pattern: "^[a-zA-Z0-9_]+$" }),
    password: t.String({ minLength: 8, maxLength: 128 }),
    fullName: t.Optional(t.String({ maxLength: 255 }))
  })
}
```

#### SQL Injection Prevention
- **Parameterized Queries**: Drizzle ORM prevents SQL injection
- **No Raw SQL**: All queries through type-safe ORM
- **Input Escaping**: Automatic parameter escaping

---

### Error Handling & Information Disclosure

#### Error Response Format
```json
{
  "error": "User-friendly error message",
  "code": "SPECIFIC_ERROR_CODE", 
  "statusCode": 400
}
```

#### Information Disclosure Prevention
- Generic error messages in production
- No stack traces in API responses
- No database error details exposed
- Consistent error response timing

#### Logging Strategy
- **Security Events**: Authentication failures, authorization denials
- **Sensitive Data**: Never log passwords, tokens, or PII
- **Structured Logging**: JSON format with correlation IDs
- **Log Levels**: DEBUG (dev only), INFO, WARN, ERROR

---

## 🏠 Development Environment

### Docker Compose Services

#### PostgreSQL (Development)
```yaml
postgres:
  image: postgres:16-alpine
  ports: ["5432:5432"]
  environment:
    POSTGRES_DB: goldengate
    POSTGRES_USER: postgres 
    POSTGRES_PASSWORD: postgres
```

#### PostgreSQL (Testing)
```yaml
postgres-test:
  image: postgres:16-alpine
  ports: ["5433:5432"] 
  environment:
    POSTGRES_DB: goldengate_test
```

#### Redis (Caching)
```yaml
redis:
  image: redis:7-alpine
  ports: ["6379:6379"]
```

#### Adminer (Database UI)
```yaml  
adminer:
  image: adminer:4.8.1
  ports: ["8080:8080"]
```

### Development Scripts

#### Database Operations
```bash
# Generate new migrations
bun run db:generate

# Run migrations
bun run db:migrate  

# Push schema changes (dev only)
bun run db:push

# Open Drizzle Studio
bun run db:studio

# Database shell access
bun run db:shell          # Development DB
bun run db:shell:test     # Test DB

# Seed database with default data
bun run db:seed
```

#### Docker Management
```bash
# Start all services
bun run docker:up

# Stop all services
bun run docker:down

# Reset services (removes data)
bun run docker:reset
```

#### Development Helper
```bash
# Full environment setup  
./scripts/dev.sh setup

# Check service health
./scripts/dev.sh health

# View logs
./scripts/dev.sh logs
./scripts/dev.sh logs postgres

# Database shell  
./scripts/dev.sh db
./scripts/dev.sh db test
```

### Environment Configuration

#### Development (.env)
```bash
# Server
NODE_ENV=development
PORT=3001

# Database  
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=goldengate
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Authentication
JWT_SECRET=dev-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=1h

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Testing (.env.test)
```bash
NODE_ENV=test
DATABASE_PORT=5433
DATABASE_NAME=goldengate_test
JWT_EXPIRES_IN=5m
LOG_LEVEL=error
```

---

## 🚀 Deployment & Configuration

### Production Environment

#### Environment Variables
```bash
# Server
NODE_ENV=production
PORT=8080

# Database (use connection string)
DATABASE_HOST=prod-db.goldengate.app
DATABASE_PORT=5432
DATABASE_NAME=goldengate_prod
DATABASE_USER=goldengate_api
DATABASE_PASSWORD=${DATABASE_PASSWORD}
DATABASE_SSL=true
DATABASE_MAX_CONNECTIONS=50

# Redis
REDIS_URL=redis://prod-redis.goldengate.app:6379

# Authentication  
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# OAuth
OAUTH_ISSUER=https://api.goldengate.app

# CORS
CORS_ALLOWED_ORIGINS=https://app.goldengate.app,https://dashboard.goldengate.app

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000  
RATE_LIMIT_MAX_REQUESTS=1000

# External Services
ATF_API_BASE_URL=https://api.agenttaskflow.com
ATF_API_KEY=${ATF_API_KEY}
ATF_WEBHOOK_SECRET=${ATF_WEBHOOK_SECRET}

# Monitoring
LOG_LEVEL=info
LOG_FORMAT=json
```

### Container Deployment

#### Dockerfile
```dockerfile
FROM oven/bun:1.2-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Copy source
COPY . .

# Build application
RUN bun run build

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Run application
CMD ["bun", "run", "start"]
```

#### Docker Compose (Production)
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER} 
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    
  redis:
    image: redis:7-alpine  
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes Deployment

#### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: goldengate-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: goldengate-api
  template:
    metadata:
      labels:
        app: goldengate-api
    spec:
      containers:
      - name: api
        image: goldengate/api:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: goldengate-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: goldengate-secrets  
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Database Migration Strategy

#### Development/Staging
```bash
# Generate and run migrations automatically
bun run db:generate
bun run db:migrate
```

#### Production  
```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup.sql

# 2. Run migrations in transaction
bun run db:migrate:prod

# 3. Verify migration success
bun run db:verify

# 4. Deploy new application version
kubectl set image deployment/goldengate-api api=goldengate/api:v1.2.0
```

### Monitoring & Observability

#### Health Checks
```typescript
GET /health
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z", 
  "database": "connected",
  "redis": "connected", 
  "environment": "production",
  "version": "1.2.0",
  "uptime": 86400
}
```

#### Metrics Collection
- **Request Metrics**: Response time, status codes, throughput
- **Database Metrics**: Connection pool, query performance
- **Authentication Metrics**: Login success/failure rates
- **Error Rates**: Application and infrastructure errors

#### Logging
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO", 
  "message": "User authenticated successfully",
  "correlationId": "req_abc123",
  "tenantId": "tenant_123",
  "userId": "user_456",
  "endpoint": "/api/v1/auth/login",
  "method": "POST",
  "statusCode": 200,
  "responseTime": 45
}
```

---

## 💻 Frontend Integration

### Authentication Implementation

#### React Context Setup
```typescript
// contexts/AuthContext.tsx
interface AuthContext {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  // Implementation with API integration
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

#### API Client Configuration
```typescript
// lib/api.ts
const API_BASE_URL = 'http://localhost:4001/api/v1';
const DEFAULT_TENANT_ID = '658146d8-2572-4fdb-9cb3-350ddab5893a';

class ApiClient {
  private getHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'X-Tenant-ID': user.tenantId || DEFAULT_TENANT_ID,
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...this.getHeaders(), ...options.headers },
    });

    if (response.status === 401) {
      // Handle token expiry
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: RegisterData) {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST', 
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request<User>('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // User management
  async getUsers() {
    return this.request<{ users: User[] }>('/users');
  }

  async getUser(id: string) {
    return this.request<{ user: User }>(`/users/${id}`);
  }

  async updateUser(id: string, data: Partial<User>) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
```

#### Login Component
```typescript
// components/LoginForm.tsx
export function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password" 
          value={form.password}
          onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

#### Protected Routes
```typescript
// components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  requiredPermission?: { resource: string; action: string };
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin' && user.role !== 'super_admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermission && !hasPermission(user, requiredPermission.resource, requiredPermission.action)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Permission check helper
function hasPermission(user: User, resource: string, action: string): boolean {
  // This is simplified client-side validation
  // Real permission checking happens server-side
  switch (user.role) {
    case 'super_admin':
    case 'admin':
      return true;
    case 'org_admin':
      return ['users', 'agents', 'organizations'].includes(resource);
    case 'user':
      return (resource === 'users' && ['read', 'update'].includes(action)) ||
             resource === 'agents';
    default:
      return false;
  }
}
```

#### Router Setup
```typescript
// App.tsx
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          } />
          
          {/* Role-specific routes */}
          <Route path="/users" element={
            <ProtectedRoute requiredPermission={{ resource: 'users', action: 'read' }}>
              <UserList />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

### User Management UI

#### User List Component
```typescript
// components/UserList.tsx
export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await api.updateUser(userId, { isActive });
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isActive } : u
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Login
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img 
                      className="h-10 w-10 rounded-full" 
                      src={user.profileAvatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=6366f1&color=fff`}
                      alt={user.fullName || user.username}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.fullName || user.username}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user.role === 'org_admin' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.lastLoginAt ? 
                  new Date(user.lastLoginAt).toLocaleDateString() : 
                  'Never'
                }
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => handleStatusChange(user.id, !user.isActive)}
                    className={`text-sm ${
                      user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🧪 Testing

### Unit Testing

#### Authentication Tests
```typescript
// tests/auth.test.ts
describe('Authentication', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedTestData();
  });

  test('should register new user successfully', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      fullName: 'Test User'
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(userData)
      .expect(200);

    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.user.id).toBeDefined();
  });

  test('should login with valid credentials', async () => {
    const user = await createTestUser();
    
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: user.email,
        password: 'password123'
      })
      .expect(200);

    expect(response.body.access_token).toBeDefined();
    expect(response.body.user.id).toBe(user.id);
  });

  test('should reject invalid credentials', async () => {
    const user = await createTestUser();
    
    await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: user.email,
        password: 'wrongpassword'
      })
      .expect(401);
  });

  test('should return user info with valid token', async () => {
    const { user, token } = await createAuthenticatedUser();
    
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.id).toBe(user.id);
    expect(response.body.email).toBe(user.email);
  });
});
```

#### RBAC Tests
```typescript
// tests/rbac.test.ts
describe('RBAC Authorization', () => {
  test('user role should access own profile only', async () => {
    const { user1, token1 } = await createUserWithRole('user');
    const { user2 } = await createUserWithRole('user');
    
    // Can access own profile
    await request(app)
      .get(`/api/v1/users/${user1.id}`)
      .set('Authorization', `Bearer ${token1}`)
      .set('X-Tenant-ID', user1.tenantId)
      .expect(200);
    
    // Cannot access other's profile  
    await request(app)
      .get(`/api/v1/users/${user2.id}`)
      .set('Authorization', `Bearer ${token1}`)
      .set('X-Tenant-ID', user1.tenantId)
      .expect(403);
  });

  test('admin role should access all users', async () => {
    const { user: admin, token } = await createUserWithRole('admin');
    const { user: regularUser } = await createUserWithRole('user');
    
    // Can access any user profile
    await request(app)
      .get(`/api/v1/users/${regularUser.id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Tenant-ID', admin.tenantId)
      .expect(200);
  });

  test('should enforce tenant isolation', async () => {
    const tenant1 = await createTenant();
    const tenant2 = await createTenant();
    
    const { user: adminT1, token } = await createUserWithRole('admin', tenant1.id);
    const { user: userT2 } = await createUserWithRole('user', tenant2.id);
    
    // Admin from tenant1 cannot access user from tenant2
    await request(app)
      .get(`/api/v1/users/${userT2.id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Tenant-ID', tenant1.id)
      .expect(404); // User not found in this tenant
  });
});
```

#### Multi-tenancy Tests
```typescript
// tests/tenancy.test.ts
describe('Multi-tenancy', () => {
  test('should resolve tenant from header', async () => {
    const tenant = await createTenant();
    const { user, token } = await createUserInTenant(tenant.id);
    
    const response = await request(app)
      .get('/api/v1/test/tenant/123')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Tenant-ID', tenant.id)
      .expect(200);

    expect(response.body.headers.tenantHeader).toBe(tenant.id);
  });

  test('should reject invalid tenant', async () => {
    const { user, token } = await createAuthenticatedUser();
    
    await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Tenant-ID', 'invalid-tenant-id')
      .expect(404);
  });

  test('should isolate data by tenant', async () => {
    const tenant1 = await createTenant();
    const tenant2 = await createTenant(); 
    
    const user1 = await createUserInTenant(tenant1.id);
    const user2 = await createUserInTenant(tenant2.id);
    
    // Each tenant should only see their own users
    const response1 = await authenticatedRequest('admin', tenant1.id)
      .get('/api/v1/users')
      .expect(200);
    
    const response2 = await authenticatedRequest('admin', tenant2.id)
      .get('/api/v1/users')
      .expect(200);
      
    expect(response1.body.users).toHaveLength(1);
    expect(response2.body.users).toHaveLength(1);
    expect(response1.body.users[0].id).toBe(user1.id);
    expect(response2.body.users[0].id).toBe(user2.id);
  });
});
```

### Integration Testing

#### End-to-End Authentication Flow
```typescript
// tests/e2e/auth-flow.test.ts
describe('E2E Authentication Flow', () => {
  test('complete user journey', async () => {
    // 1. Register new user
    const userData = {
      email: 'e2e@example.com',
      username: 'e2euser', 
      password: 'password123',
      fullName: 'E2E Test User'
    };
    
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(userData)
      .expect(200);
    
    const userId = registerResponse.body.user.id;
    
    // 2. Login with credentials
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      })
      .expect(200);
    
    const token = loginResponse.body.access_token;
    expect(token).toBeDefined();
    
    // 3. Access protected resource
    const meResponse = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(meResponse.body.id).toBe(userId);
    expect(meResponse.body.email).toBe(userData.email);
    
    // 4. Update profile
    await request(app)
      .patch(`/api/v1/users/${userId}/profile`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Tenant-ID', meResponse.body.tenantId)
      .send({
        bio: 'Updated bio from E2E test',
        timezone: 'America/New_York'
      })
      .expect(200);
    
    // 5. Logout
    await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    // 6. Verify token is invalidated
    await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });
});
```

### Test Utilities

#### Helper Functions
```typescript
// tests/helpers.ts
export async function createTenant(data?: Partial<Tenant>) {
  return await db.insert(tenants).values({
    name: 'Test Tenant',
    slug: `test-${Date.now()}`,
    plan: 'starter',
    status: 'active',
    ...data
  }).returning();
}

export async function createTestUser(tenantId?: string, role = 'user') {
  const tenant = tenantId ? { id: tenantId } : await createTenant();
  
  const passwordHash = await argon2.hash('password123');
  const [user] = await db.insert(users).values({
    email: `test${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    fullName: 'Test User',
    passwordHash
  }).returning();
  
  await db.insert(userTenants).values({
    userId: user.id,
    tenantId: tenant.id,
    role,
    isDefault: true
  });
  
  return { user: { ...user, tenantId: tenant.id }, tenant };
}

export async function createAuthenticatedUser(role = 'user', tenantId?: string) {
  const { user, tenant } = await createTestUser(tenantId, role);
  
  // Create JWT token
  const token = await new SignJWT({
    sub: user.id,
    email: user.email
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(config.jwt.secret));
  
  return { user, tenant, token };
}

export function authenticatedRequest(role = 'user', tenantId?: string) {
  return async (method: string, path: string) => {
    const { token, user } = await createAuthenticatedUser(role, tenantId);
    return request(app)[method](path)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Tenant-ID', user.tenantId);
  };
}
```

### Performance Testing

#### Load Testing with Artillery
```yaml
# artillery.yml
config:
  target: 'http://localhost:4001'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120  
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100

scenarios:
  - name: "Authentication flow"
    weight: 70
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "load-test@example.com"
            password: "password123"
          capture:
            - json: "$.access_token"
              as: "token"
      - get:
          url: "/api/v1/auth/me"
          headers:
            Authorization: "Bearer {{ token }}"
  
  - name: "User management"
    weight: 30
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "admin@example.com"  
            password: "password123"
          capture:
            - json: "$.access_token"
              as: "token"
            - json: "$.user.tenantId"  
              as: "tenantId"
      - get:
          url: "/api/v1/users"
          headers:
            Authorization: "Bearer {{ token }}"
            X-Tenant-ID: "{{ tenantId }}"
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
**Problem**: `EADDRINUSE` error when starting the server
**Cause**: Another process is using the port, or hot-reload conflict
**Solutions**:
```bash
# Check what's using the port
lsof -i :4001

# Kill the process
kill -9 <PID>

# Use a different port
PORT=4002 bun run dev

# Fix hot-reload issues
# Ensure export format is correct in src/index.ts
export default {
  port: config.port,
  fetch: app.fetch.bind(app),
};
```

#### 2. Database Connection Issues
**Problem**: `Cannot connect to database` errors
**Cause**: Docker services not running or wrong connection parameters
**Solutions**:
```bash
# Check Docker services status
docker-compose ps

# Restart services
docker-compose down && docker-compose up -d

# Check database connectivity
docker-compose exec postgres pg_isready -U postgres

# Verify environment variables
echo $DATABASE_HOST $DATABASE_PORT $DATABASE_NAME
```

#### 3. JWT Token Issues
**Problem**: `Invalid token` or `Token expired` errors
**Cause**: Wrong JWT secret, expired tokens, or clock skew
**Solutions**:
```bash
# Verify JWT secret length (minimum 32 characters)
echo $JWT_SECRET | wc -c

# Check token expiration time
# In browser dev tools, decode JWT at jwt.io

# Clear stored tokens
localStorage.removeItem('access_token');
localStorage.removeItem('user');

# Regenerate JWT secret for development
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4. RBAC Permission Denied
**Problem**: `Permission denied` errors for authorized actions
**Cause**: Incorrect role assignments, missing policies, or tenant isolation
**Solutions**:
```sql
-- Check user roles
SELECT u.email, ut.role, r.name as role_name
FROM users u
JOIN user_tenants ut ON u.id = ut.user_id  
JOIN roles r ON ut.role = r.name
WHERE u.email = 'user@example.com';

-- Check role policies
SELECT r.name as role, p.name as policy, p.resource, p.action
FROM roles r
JOIN role_policies rp ON r.id = rp.role_id
JOIN policies p ON rp.policy_id = p.id  
WHERE r.name = 'user';

-- Grant admin role for testing
UPDATE user_tenants 
SET role = 'admin' 
WHERE user_id = 'user-uuid' AND tenant_id = 'tenant-uuid';
```

#### 5. CORS Issues
**Problem**: `CORS policy` errors in browser
**Cause**: Frontend origin not in allowed origins list
**Solutions**:
```typescript
// Check CORS configuration in config
cors: {
  allowedOrigins: [
    "http://localhost:3000",   // React dev server
    "http://localhost:5173",   // Vite dev server
    "https://yourapp.com"      // Production domain
  ]
}

// Temporary fix for development (not for production)
cors: {
  allowedOrigins: "*", // Allow all origins
  credentials: false   // Don't send credentials
}
```

#### 6. Tenant Resolution Issues
**Problem**: `Tenant not found` or tenant isolation not working
**Cause**: Missing tenant header, wrong tenant ID, or middleware configuration
**Solutions**:
```bash
# Check tenant header in requests
curl -H "X-Tenant-ID: tenant-uuid" http://localhost:4001/api/v1/users

# List available tenants
psql -c "SELECT id, name, slug FROM tenants;"

# Create test tenant
psql -c "INSERT INTO tenants (name, slug, plan, status) VALUES ('Test', 'test', 'starter', 'active');"

# Verify middleware configuration
# Ensure tenantMiddleware is properly configured:
tenantMiddleware({ strategy: "header", required: true })
```

### Debugging Tools

#### 1. Database Inspection
```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d goldengate

# Useful queries
\dt                          -- List tables
\d users                     -- Describe users table
SELECT * FROM tenants;       -- Show all tenants
SELECT * FROM policies;      -- Show all policies
SELECT * FROM user_roles ur  -- Show user role assignments
JOIN roles r ON ur.role_id = r.id
JOIN users u ON ur.user_id = u.id;
```

#### 2. API Request Logging
```typescript
// Add request logging middleware
app.use((request) => {
  console.log(`${request.method} ${request.url}`, {
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString()
  });
});
```

#### 3. JWT Token Debugging
```javascript
// Decode JWT token (browser console)
function decodeJWT(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')
  );
  return JSON.parse(jsonPayload);
}

const token = localStorage.getItem('access_token');
console.log(decodeJWT(token));
```

#### 4. Health Check Monitoring
```bash
# Continuous health monitoring
watch -n 5 'curl -s http://localhost:4001/health | jq'

# Check specific service health
curl http://localhost:4001/health | jq '.database'
```

### Performance Monitoring

#### 1. Database Query Performance
```sql
-- Enable query logging (development only)
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Analyze table statistics
ANALYZE users;
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

#### 2. Memory Usage Monitoring
```bash
# Monitor Node.js memory usage
node --max-old-space-size=4096 --expose-gc src/index.ts

# Check database connections
psql -c "SELECT count(*) as connections FROM pg_stat_activity;"

# Monitor Redis memory
docker-compose exec redis redis-cli info memory
```

#### 3. Request Performance
```typescript
// Add performance timing middleware
app.use((request) => {
  const start = Date.now();
  
  request.addEventListener('response', () => {
    const duration = Date.now() - start;
    console.log(`${request.method} ${request.url} - ${duration}ms`);
  });
});
```

### Environment-Specific Issues

#### Development Environment
- **Hot reload conflicts**: Check export format in main file
- **Database seeding**: Run `bun run db:seed` after schema changes
- **CORS during development**: Use localhost origins
- **SSL certificates**: Not required for localhost

#### Production Environment
- **Environment variables**: Use secure secret management
- **Database connections**: Use connection pooling
- **HTTPS only**: Redirect all HTTP traffic to HTTPS
- **Error logging**: Use structured logging with correlation IDs
- **Health checks**: Implement proper health check endpoints
- **Rate limiting**: Use Redis for distributed rate limiting

---

## 🎯 Summary

The GoldenGate API represents a comprehensive, production-ready foundation for a multi-tenant, agent-native platform. With **37 database tables**, **OAuth 2.0 compliance**, **fine-grained RBAC**, and **complete authentication flows**, it provides enterprise-grade security and scalability.

### 📈 Key Metrics
- **37 Database Tables** across 7 logical domains
- **22 Fine-grained Policies** with conditional logic
- **4 Default Roles** (user, org_admin, admin, super_admin)
- **8 Authentication Endpoints** with OAuth 2.0 support
- **5+ Middleware Systems** for security and multi-tenancy
- **100% TypeScript** for type safety and developer experience

### 🔮 Future Roadmap
1. **MCP Server Integration** - Direct agent control and orchestration
2. **Agent Taskflow (ATF) APIs** - AI agent lifecycle management  
3. **Real-time WebSocket** - Live agent communication
4. **Advanced Analytics** - Usage metrics and business intelligence
5. **API Gateway Integration** - Rate limiting, monitoring, versioning
6. **Microservices Architecture** - Service decomposition for scale

The foundation is solid, secure, and ready to power the next generation of AI-native applications. 🚀