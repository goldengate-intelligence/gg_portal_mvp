# GoldenGate Platform - Documentation Hub

Complete documentation for the GoldenGate federal contractor intelligence platform.

## 📚 Quick Navigation

### New to GoldenGate?
- **[Business Guide](BUSINESS_GUIDE.md)** - Non-technical overview for stakeholders and executives
- **[Integration Guide](INTEGRATION_GUIDE.md)** - How gg-mvp works with gg-infra infrastructure
- **[Visual Guide](VISUAL_GUIDE.md)** - Interactive diagrams and architecture flows

### Technical Documentation
- **[Technical Overview](#technical-overview)** - System architecture and design (below)
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Complete deployment procedures
- **[Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)** - Common issues and solutions
- **[API Documentation](../apps/api/README.md)** - Backend API reference

### Specialized Guides
- **[Frontend Architecture](FRONTEND_ARCHITECTURE.md)** - React application architecture
- **[User Guide](USER_GUIDE.md)** - Platform usage and features
- **[Bun + Elysia Setup](bun-elysia-drizzle-setup.md)** - Development stack guide

---

## 📊 Documentation Types

| Document | Audience | Purpose |
|----------|----------|---------|
| [Business Guide](BUSINESS_GUIDE.md) | Executives, stakeholders | Business value, ROI, use cases |
| [Integration Guide](INTEGRATION_GUIDE.md) | DevOps, architects | Platform integration |
| [Visual Guide](VISUAL_GUIDE.md) | All technical users | Architecture diagrams |
| [Deployment Guide](DEPLOYMENT_GUIDE.md) | Operations teams | Production deployment |
| [Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md) | Support teams | Issue resolution |

---

# Technical Overview

## 📚 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagrams](#architecture-diagrams)
3. [Technology Stack](#technology-stack)
4. [API Architecture](#api-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Data Flow](#data-flow)
7. [Authentication & Security](#authentication--security)
8. [Database Design](#database-design)
9. [Deployment Architecture](#deployment-architecture)
10. [Development Guide](#development-guide)

## System Overview

GoldenGate is a multi-tenant, agent-native platform designed for federal contractor intelligence and portfolio management. The system provides autonomous intelligence capabilities for institutional allocators through AI agent orchestration, comprehensive data analytics, and enterprise-grade security.

### Key Capabilities

- **Multi-Tenant SaaS Platform**: Complete tenant isolation with row-level security
- **Federal Contractor Intelligence**: Comprehensive contractor profiles, analytics, and insights
- **AI Agent Orchestration**: MCP and ATF integration for autonomous operations
- **Enterprise Security**: OAuth 2.0, JWT, fine-grained RBAC with 22+ policies
- **Real-time Analytics**: Snowflake integration with advanced query capabilities
- **Portfolio Management**: Contractor lists, favorites, and collaboration features

## Architecture Diagrams

### High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React UI<br/>Vite + TypeScript]
        Mobile[Mobile App<br/>Future]
        API_Client[Third-Party<br/>API Clients]
    end
    
    subgraph "Gateway Layer"
        LB[Load Balancer<br/>SSL Termination]
        Gateway[API Gateway<br/>Rate Limiting]
    end
    
    subgraph "Application Layer"
        Auth[Auth Service<br/>OAuth 2.0]
        API[GoldenGate API<br/>Elysia + Bun]
        MCP[MCP Server<br/>Agent Control]
        Worker[Background Workers<br/>Data Sync]
    end
    
    subgraph "Data Layer"
        PG[(PostgreSQL<br/>Primary DB)]
        Redis[(Redis<br/>Cache & Sessions)]
        SF[(Snowflake<br/>Analytics)]
    end
    
    subgraph "External Services"
        SAM[SAM.gov API]
        USASpend[USASpending API]
        FPDS[FPDS Data]
    end
    
    UI --> LB
    Mobile --> LB
    API_Client --> LB
    
    LB --> Gateway
    Gateway --> Auth
    Gateway --> API
    Gateway --> MCP
    
    API --> PG
    API --> Redis
    API --> SF
    
    Worker --> PG
    Worker --> SAM
    Worker --> USASpend
    Worker --> FPDS
    
    Auth --> PG
    Auth --> Redis
    
    MCP --> API
    MCP --> PG
```

### Microservices Communication Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Gateway
    participant Auth
    participant API
    participant DB
    participant Cache
    
    User->>UI: Access Application
    UI->>Gateway: Request with JWT
    Gateway->>Gateway: Rate Limit Check
    Gateway->>Auth: Validate Token
    Auth->>Cache: Check Session
    Cache-->>Auth: Session Valid
    Auth-->>Gateway: Token Valid
    Gateway->>API: Forward Request
    API->>DB: Query Data
    DB-->>API: Return Data
    API->>Cache: Cache Response
    API-->>Gateway: Response
    Gateway-->>UI: Response
    UI-->>User: Display Data
```

## Technology Stack

### Backend Stack

```mermaid
graph LR
    subgraph "Runtime & Framework"
        Bun[Bun Runtime<br/>High Performance]
        Elysia[Elysia Framework<br/>Type-Safe]
        TS1[TypeScript<br/>Type Safety]
    end
    
    subgraph "Data Layer"
        Drizzle[Drizzle ORM<br/>Type-Safe ORM]
        PG[PostgreSQL 16<br/>Primary DB]
        Redis[Redis<br/>Caching]
        Snowflake[Snowflake SDK<br/>Analytics]
    end
    
    subgraph "Security"
        JWT[JWT Auth<br/>Token-Based]
        OAuth[OAuth 2.0<br/>Standards]
        Argon[Argon2<br/>Password Hash]
    end
    
    Bun --> Elysia
    Elysia --> TS1
    Elysia --> Drizzle
    Drizzle --> PG
    Elysia --> Redis
    Elysia --> Snowflake
    Elysia --> JWT
    JWT --> OAuth
    OAuth --> Argon
```

### Frontend Stack

```mermaid
graph LR
    subgraph "Core"
        React[React 19<br/>UI Library]
        TS2[TypeScript<br/>Type Safety]
        Vite[Vite<br/>Build Tool]
    end
    
    subgraph "State & Routing"
        Router[TanStack Router<br/>Type-Safe Routes]
        Query[TanStack Query<br/>Data Fetching]
        Context[React Context<br/>Global State]
    end
    
    subgraph "UI & Styling"
        Tailwind[Tailwind CSS v4<br/>Utility CSS]
        CVA[Class Variance<br/>Variants]
        Lucide[Lucide Icons<br/>Icons]
    end
    
    React --> TS2
    React --> Vite
    React --> Router
    React --> Query
    React --> Context
    React --> Tailwind
    Tailwind --> CVA
    React --> Lucide
```

## API Architecture

### API Layer Structure

```mermaid
graph TD
    subgraph "API Server"
        Entry[index.ts<br/>Entry Point]
        
        subgraph "Middleware Stack"
            CORS[CORS Middleware]
            RateLimit[Rate Limiting]
            Auth_MW[Auth Middleware]
            Tenant[Tenant Resolution]
            RBAC[RBAC Middleware]
        end
        
        subgraph "Route Handlers"
            AuthRoutes[/auth/*<br/>Authentication]
            UserRoutes[/users/*<br/>User Management]
            ContractorRoutes[/contractors/*<br/>Contractor Data]
            ListRoutes[/contractor-lists/*<br/>Portfolio Mgmt]
            SnowflakeRoutes[/snowflake/*<br/>Analytics]
        end
        
        subgraph "Services"
            AuthService[Auth Service]
            ContractorService[Contractor Service]
            ListService[List Manager]
            SnowflakeService[Snowflake Query]
            ProfileAggregator[Profile Aggregator]
        end
        
        subgraph "Data Access"
            DrizzleORM[Drizzle ORM]
            QueryBuilder[Query Builder]
            CacheManager[Cache Manager]
        end
    end
    
    Entry --> CORS
    CORS --> RateLimit
    RateLimit --> Auth_MW
    Auth_MW --> Tenant
    Tenant --> RBAC
    
    RBAC --> AuthRoutes
    RBAC --> UserRoutes
    RBAC --> ContractorRoutes
    RBAC --> ListRoutes
    RBAC --> SnowflakeRoutes
    
    AuthRoutes --> AuthService
    UserRoutes --> AuthService
    ContractorRoutes --> ContractorService
    ListRoutes --> ListService
    SnowflakeRoutes --> SnowflakeService
    
    ContractorService --> ProfileAggregator
    
    AuthService --> DrizzleORM
    ContractorService --> DrizzleORM
    ListService --> DrizzleORM
    SnowflakeService --> QueryBuilder
    
    DrizzleORM --> CacheManager
    QueryBuilder --> CacheManager
```

### API Endpoint Categories

```mermaid
mindmap
  root((API v1))
    Auth
      POST /register
      POST /login
      POST /logout
      GET /me
      POST /refresh
      POST /oauth/authorize
      POST /oauth/token
    Users
      GET /users
      GET /users/:id
      POST /users
      PATCH /users/:id
      DELETE /users/:id
      PATCH /users/:id/profile
      POST /users/:id/change-password
    Contractors
      GET /contractors
      GET /contractors/:uei
      GET /contractors/search/:term
      GET /contractors/top/:metric
      GET /contractors/filters/options
      GET /contractors/stats/summary
    Contractor Profiles
      GET /contractor-profiles
      GET /contractor-profiles/:id
      GET /contractor-profiles/by-name/:name
      GET /contractor-profiles/top/:metric
      GET /contractor-profiles/filters/options
    Contractor Lists
      GET /contractor-lists
      POST /contractor-lists
      GET /contractor-lists/:id
      PATCH /contractor-lists/:id
      DELETE /contractor-lists/:id
      POST /contractor-lists/:id/items
      DELETE /contractor-lists/:id/items/:profileId
      POST /contractor-lists/toggle-favorite
      GET /contractor-lists/favorites
    Snowflake
      POST /snowflake/query
      GET /snowflake/schemas
      GET /snowflake/tables/:schema
      GET /snowflake/cache/:queryId
```

## Frontend Architecture

### Component Hierarchy

```mermaid
graph TD
    App[App.tsx<br/>Root Component]
    
    App --> AuthProvider[AuthProvider<br/>Authentication Context]
    AuthProvider --> QueryProvider[TanStack Query Provider<br/>Data Fetching]
    QueryProvider --> Router[Router Provider<br/>Navigation]
    
    Router --> PublicRoutes[Public Routes]
    Router --> ProtectedRoutes[Protected Routes]
    
    PublicRoutes --> Home[Home Page]
    PublicRoutes --> Login[Login Page]
    PublicRoutes --> Register[Register Page]
    
    ProtectedRoutes --> Dashboard[Dashboard]
    ProtectedRoutes --> Platform[Platform]
    
    Platform --> Identify[Identify Targets<br/>Contractor Discovery]
    Platform --> Portfolio[Portfolio<br/>List Management]
    Platform --> Analysis[Analysis<br/>Analytics Dashboard]
    
    Identify --> ContractorGrid[Contractor Grid<br/>Card View]
    Identify --> ContractorTable[Contractor Table<br/>Table View]
    Identify --> FilterSidebar[Filter Sidebar<br/>Search Filters]
    
    Portfolio --> PortfolioList[Portfolio Lists<br/>Drag & Drop]
    Portfolio --> Favorites[Favorites<br/>Quick Access]
    
    Analysis --> Charts[Analytics Charts]
    Analysis --> Reports[Report Generation]
```

### State Management Flow

```mermaid
graph LR
    subgraph "Client State"
        UI_State[UI State<br/>Modals, Sidebars]
        Auth_State[Auth State<br/>User, Tokens]
        Filter_State[Filter State<br/>Active Filters]
    end
    
    subgraph "Server State"
        Query_Cache[TanStack Query<br/>Cache]
        API_Data[API Responses<br/>Contractors, Lists]
    end
    
    subgraph "Persistent State"
        LocalStorage[LocalStorage<br/>Tokens, Prefs]
        SessionStorage[SessionStorage<br/>Temp Data]
    end
    
    UI_State --> React_Context
    Auth_State --> React_Context
    Filter_State --> React_Context
    
    React_Context --> Components
    
    Components --> Query_Cache
    Query_Cache --> API_Data
    
    Auth_State --> LocalStorage
    Filter_State --> SessionStorage
    
    LocalStorage --> Auth_State
    SessionStorage --> Filter_State
```

## Data Flow

### Contractor Data Pipeline

```mermaid
graph LR
    subgraph "Data Sources"
        SAM[SAM.gov]
        FPDS[FPDS]
        USASpending[USASpending]
    end
    
    subgraph "Import & Processing"
        Importer[Data Importer<br/>CSV/API]
        Validator[Data Validator<br/>Quality Check]
        Aggregator[Profile Aggregator<br/>Entity Resolution]
    end
    
    subgraph "Storage"
        Raw[contractors_cache<br/>Raw Data]
        Profiles[contractor_profiles<br/>Aggregated]
        Analytics[contractor_analytics<br/>Metrics]
    end
    
    subgraph "API Layer"
        Cache[Redis Cache<br/>Hot Data]
        API_Endpoints[API Endpoints<br/>REST]
    end
    
    subgraph "UI Consumption"
        Search[Search & Filter]
        Details[Detail Views]
        Export[Export Tools]
    end
    
    SAM --> Importer
    FPDS --> Importer
    USASpending --> Importer
    
    Importer --> Validator
    Validator --> Aggregator
    
    Aggregator --> Raw
    Aggregator --> Profiles
    Profiles --> Analytics
    
    Raw --> Cache
    Profiles --> Cache
    Analytics --> Cache
    
    Cache --> API_Endpoints
    
    API_Endpoints --> Search
    API_Endpoints --> Details
    API_Endpoints --> Export
```

### Real-time Data Synchronization

```mermaid
sequenceDiagram
    participant External as External APIs
    participant Worker as Sync Worker
    participant DB as PostgreSQL
    participant Cache as Redis
    participant API as API Server
    participant UI as Frontend
    
    loop Every 24 hours
        Worker->>External: Fetch Updates
        External-->>Worker: New Data
        Worker->>Worker: Validate & Transform
        Worker->>DB: Bulk Update
        Worker->>Cache: Invalidate Stale
    end
    
    UI->>API: Request Data
    API->>Cache: Check Cache
    
    alt Cache Hit
        Cache-->>API: Cached Data
    else Cache Miss
        API->>DB: Query Database
        DB-->>API: Fresh Data
        API->>Cache: Update Cache
    end
    
    API-->>UI: Response Data
    
    Note over UI: TanStack Query<br/>manages client cache
```

## Authentication & Security

### OAuth 2.0 Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Frontend
    participant Auth as Auth Service
    participant DB as Database
    participant Third as Third Party App
    
    User->>UI: Login Request
    UI->>Auth: POST /auth/login
    Auth->>DB: Validate Credentials
    DB-->>Auth: User Data
    Auth->>Auth: Generate JWT
    Auth-->>UI: Access Token + Refresh Token
    UI->>UI: Store Tokens
    
    Note over UI,Auth: OAuth 2.0 Authorization Code Flow
    
    Third->>Auth: GET /oauth/authorize
    Auth->>User: Consent Screen
    User->>Auth: Grant Access
    Auth-->>Third: Authorization Code
    Third->>Auth: POST /oauth/token
    Auth->>DB: Validate Code
    Auth-->>Third: Access Token
    Third->>Auth: API Request with Token
    Auth->>Auth: Validate Token
    Auth-->>Third: Protected Resource
```

### RBAC Permission Matrix

```mermaid
graph TD
    subgraph "Roles"
        Admin[Admin<br/>Full Access]
        Manager[Manager<br/>Org Management]
        Analyst[Analyst<br/>Data Access]
        Viewer[Viewer<br/>Read Only]
    end
    
    subgraph "Resources"
        Users[Users]
        Contractors[Contractors]
        Lists[Lists]
        Analytics[Analytics]
        Settings[Settings]
    end
    
    subgraph "Permissions"
        Create[Create]
        Read[Read]
        Update[Update]
        Delete[Delete]
        Export[Export]
    end
    
    Admin --> Create
    Admin --> Read
    Admin --> Update
    Admin --> Delete
    Admin --> Export
    
    Manager --> Create
    Manager --> Read
    Manager --> Update
    Manager --> Export
    
    Analyst --> Read
    Analyst --> Export
    
    Viewer --> Read
    
    Create --> Users
    Create --> Contractors
    Create --> Lists
    
    Read --> Users
    Read --> Contractors
    Read --> Lists
    Read --> Analytics
    Read --> Settings
    
    Update --> Users
    Update --> Contractors
    Update --> Lists
    Update --> Settings
    
    Delete --> Users
    Delete --> Contractors
    Delete --> Lists
    
    Export --> Contractors
    Export --> Analytics
```

## Database Design

### Core Entity Relationships

```mermaid
erDiagram
    TENANTS ||--o{ USERS : contains
    TENANTS ||--o{ ORGANIZATIONS : has
    TENANTS ||--o{ CONTRACTOR_PROFILES : owns
    
    USERS ||--o{ USER_SESSIONS : has
    USERS ||--o{ CONTRACTOR_LISTS : creates
    USERS ||--o{ AUDIT_LOGS : generates
    
    ORGANIZATIONS ||--o{ USERS : employs
    ORGANIZATIONS ||--o{ CONTRACTS : manages
    
    CONTRACTOR_PROFILES ||--o{ CONTRACTOR_UEIS : aggregates
    CONTRACTOR_PROFILES ||--o{ CONTRACTOR_AGENCIES : has_relationships
    CONTRACTOR_PROFILES ||--o{ CONTRACTOR_LIST_ITEMS : appears_in
    
    CONTRACTOR_LISTS ||--o{ CONTRACTOR_LIST_ITEMS : contains
    
    CONTRACTS ||--o{ CONTRACT_ITEMS : includes
    CONTRACTS }o--|| CONTRACTOR_PROFILES : with
    
    ROLES ||--o{ USER_ROLES : assigned_to
    ROLES ||--o{ ROLE_PERMISSIONS : has
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : granted_to
```

### Database Schema Layers

```mermaid
graph TD
    subgraph "Core Business Layer"
        Contractors[contractors_cache<br/>Raw contractor data]
        Profiles[contractor_profiles<br/>Aggregated profiles]
        Agencies[contractor_agencies<br/>Agency relationships]
        Lists[contractor_lists<br/>User portfolios]
        ListItems[contractor_list_items<br/>Portfolio contents]
    end
    
    subgraph "Multi-Tenancy Layer"
        Tenants[tenants<br/>Tenant accounts]
        Organizations[organizations<br/>Org hierarchy]
        Users[users<br/>User accounts]
        UserProfiles[user_profiles<br/>User details]
    end
    
    subgraph "Security Layer"
        Roles[roles<br/>Role definitions]
        Permissions[permissions<br/>Permission types]
        RolePerms[role_permissions<br/>Role-permission mapping]
        UserRoles[user_roles<br/>User-role assignment]
        Sessions[user_sessions<br/>Active sessions]
    end
    
    subgraph "OAuth Layer"
        OAuthClients[oauth_clients<br/>OAuth applications]
        OAuthCodes[oauth_authorization_codes<br/>Auth codes]
        OAuthTokens[oauth_tokens<br/>Access tokens]
    end
    
    subgraph "Audit Layer"
        AuditLogs[audit_logs<br/>User actions]
        SecurityEvents[security_events<br/>Security logs]
        DataChanges[data_change_logs<br/>Change tracking]
    end
```

## Deployment Architecture

### Container Architecture

```mermaid
graph TD
    subgraph "Docker Compose Stack"
        subgraph "Application Containers"
            API_Container[API Container<br/>Bun + Elysia<br/>Port 4001]
            UI_Container[UI Container<br/>Nginx + React<br/>Port 3600]
            Worker_Container[Worker Container<br/>Background Jobs]
        end
        
        subgraph "Data Containers"
            PG_Container[PostgreSQL<br/>Port 5432]
            Redis_Container[Redis<br/>Port 6379]
            Adminer[Adminer<br/>DB Admin<br/>Port 8080]
        end
        
        subgraph "Networking"
            Internal_Network[goldengate_network<br/>Internal Bridge]
        end
    end
    
    API_Container --> Internal_Network
    UI_Container --> Internal_Network
    Worker_Container --> Internal_Network
    PG_Container --> Internal_Network
    Redis_Container --> Internal_Network
    Adminer --> Internal_Network
    
    Internal_Network --> Host_Network[Host Network<br/>External Access]
```

### Production Deployment

```mermaid
graph LR
    subgraph "CDN Layer"
        CloudFlare[CloudFlare CDN<br/>Static Assets]
    end
    
    subgraph "Load Balancer"
        ALB[Application LB<br/>SSL Termination]
    end
    
    subgraph "Application Tier"
        API1[API Instance 1]
        API2[API Instance 2]
        APIn[API Instance N]
    end
    
    subgraph "Data Tier"
        PG_Primary[(PostgreSQL<br/>Primary)]
        PG_Replica[(PostgreSQL<br/>Read Replica)]
        Redis_Cluster[(Redis Cluster)]
    end
    
    subgraph "Analytics"
        Snowflake[(Snowflake<br/>Data Warehouse)]
    end
    
    CloudFlare --> ALB
    ALB --> API1
    ALB --> API2
    ALB --> APIn
    
    API1 --> PG_Primary
    API2 --> PG_Replica
    APIn --> Redis_Cluster
    
    API1 --> Snowflake
    API2 --> Snowflake
    
    PG_Primary -.->|Replication| PG_Replica
```

### CI/CD Pipeline

```mermaid
graph LR
    subgraph "Development"
        Dev[Developer<br/>Local Environment]
        Git[Git Push]
    end
    
    subgraph "CI Pipeline"
        GitHub[GitHub Actions]
        Tests[Run Tests<br/>Unit + Integration]
        Lint[Code Quality<br/>Biome + TypeScript]
        Build[Build Artifacts<br/>Docker Images]
    end
    
    subgraph "CD Pipeline"
        Registry[Container Registry<br/>ECR/Docker Hub]
        Staging[Staging Deploy<br/>Auto]
        Prod[Production Deploy<br/>Manual Approval]
    end
    
    subgraph "Monitoring"
        Logs[CloudWatch/DataDog]
        Metrics[Performance Metrics]
        Alerts[Alert Manager]
    end
    
    Dev --> Git
    Git --> GitHub
    GitHub --> Tests
    Tests --> Lint
    Lint --> Build
    Build --> Registry
    Registry --> Staging
    Staging --> Prod
    
    Staging --> Logs
    Prod --> Logs
    Logs --> Metrics
    Metrics --> Alerts
```

## Development Guide

### Local Development Setup

```mermaid
graph TD
    Start[Start Development]
    
    Start --> Clone[Clone Repository]
    Clone --> Install[Install Dependencies<br/>bun install]
    
    Install --> Docker[Start Docker Services]
    Docker --> DB_Setup[Database Setup]
    
    DB_Setup --> Migrate[Run Migrations<br/>bun run db:migrate]
    Migrate --> Seed[Seed Data<br/>bun run db:seed]
    
    Seed --> Start_API[Start API Server<br/>bun run dev]
    Seed --> Start_UI[Start UI Server<br/>bun run dev]
    
    Start_API --> Ready[Development Ready<br/>API: localhost:4001<br/>UI: localhost:3600]
    Start_UI --> Ready
```

### Development Workflow

```mermaid
gitGraph
    commit id: "main"
    branch feature/new-feature
    checkout feature/new-feature
    commit id: "Add component"
    commit id: "Add API endpoint"
    commit id: "Add tests"
    checkout main
    merge feature/new-feature
    commit id: "Deploy to staging"
    branch hotfix/bug-fix
    checkout hotfix/bug-fix
    commit id: "Fix critical bug"
    checkout main
    merge hotfix/bug-fix
    commit id: "Deploy to production"
```

## API Documentation

### Request/Response Flow

```mermaid
sequenceDiagram
    participant Client
    participant Gateway
    participant Middleware
    participant Handler
    participant Service
    participant Database
    
    Client->>Gateway: HTTP Request
    Gateway->>Middleware: Apply Middleware Stack
    
    Note over Middleware: CORS Check
    Note over Middleware: Rate Limiting
    Note over Middleware: Auth Validation
    Note over Middleware: Tenant Resolution
    Note over Middleware: RBAC Check
    
    Middleware->>Handler: Route Handler
    Handler->>Service: Business Logic
    Service->>Database: Data Operation
    Database-->>Service: Query Result
    Service->>Service: Transform Data
    Service-->>Handler: Service Response
    Handler->>Handler: Format Response
    Handler-->>Middleware: Handler Response
    Middleware-->>Gateway: Final Response
    Gateway-->>Client: HTTP Response
```

## Performance Optimization

### Caching Strategy

```mermaid
graph TD
    Request[API Request]
    
    Request --> L1{L1 Cache<br/>Memory}
    L1 -->|Hit| Response1[Return Data]
    L1 -->|Miss| L2{L2 Cache<br/>Redis}
    
    L2 -->|Hit| UpdateL1[Update L1]
    UpdateL1 --> Response2[Return Data]
    
    L2 -->|Miss| DB[(Database)]
    DB --> Transform[Transform Data]
    Transform --> UpdateL2[Update L2]
    UpdateL2 --> UpdateL1_2[Update L1]
    UpdateL1_2 --> Response3[Return Data]
    
    subgraph "Cache Invalidation"
        Write[Write Operation] --> InvalidateL1[Invalidate L1]
        Write --> InvalidateL2[Invalidate L2]
    end
```

## Monitoring & Observability

### Metrics Collection

```mermaid
graph LR
    subgraph "Application Metrics"
        API_Metrics[API Server<br/>Requests, Latency]
        UI_Metrics[Frontend<br/>Page Load, Errors]
        DB_Metrics[Database<br/>Queries, Connections]
    end
    
    subgraph "Infrastructure Metrics"
        CPU[CPU Usage]
        Memory[Memory Usage]
        Disk[Disk I/O]
        Network[Network I/O]
    end
    
    subgraph "Business Metrics"
        Users[Active Users]
        Contractors[Contractor Views]
        Lists[List Operations]
        Exports[Data Exports]
    end
    
    API_Metrics --> Collector[Metrics Collector<br/>Prometheus/DataDog]
    UI_Metrics --> Collector
    DB_Metrics --> Collector
    
    CPU --> Collector
    Memory --> Collector
    Disk --> Collector
    Network --> Collector
    
    Users --> Collector
    Contractors --> Collector
    Lists --> Collector
    Exports --> Collector
    
    Collector --> Dashboard[Monitoring Dashboard]
    Collector --> Alerts[Alert System]
```

## Available Documentation

| Document | Description | Location |
|----------|-------------|----------|
| Frontend Architecture | Complete frontend technical documentation | [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) |
| API Documentation | Comprehensive API documentation | [apps/api/README.md](../apps/api/README.md) |
| Data Model | Complete database schema and ERDs | [apps/DATA_MODEL.md](../apps/DATA_MODEL.md) |
| Comprehensive Docs | Full platform documentation | [apps/COMPREHENSIVE_DOCUMENTATION.md](../apps/COMPREHENSIVE_DOCUMENTATION.md) |
| Frontend Integration | UI/API integration guide | [apps/FRONTEND_INTEGRATION.md](../apps/FRONTEND_INTEGRATION.md) |
| Bun Setup Guide | Bun, Elysia, Drizzle setup | [bun-elysia-drizzle-setup.md](./bun-elysia-drizzle-setup.md) |

## Quick Links

### Development
- **API Server**: http://localhost:4001
- **UI Application**: http://localhost:3600
- **API Documentation**: http://localhost:4001/docs
- **Database Admin**: http://localhost:8080
- **Drizzle Studio**: http://localhost:4983

### Resources
- [Bun Documentation](https://bun.sh/docs)
- [Elysia Documentation](https://elysiajs.com)
- [React Documentation](https://react.dev)
- [TanStack Documentation](https://tanstack.com)
- [Drizzle ORM Documentation](https://orm.drizzle.team)

## Support

For questions, issues, or contributions:
- Create an issue in the repository
- Contact the GoldenGate development team
- Review the contributing guidelines

---

*Last Updated: January 2025*  
*Version: 1.0.0*  
*© GoldenGate Platform - Midas Intelligence System*