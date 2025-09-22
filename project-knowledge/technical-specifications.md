# Technical Specifications - GoldenGate Platform

## Technology Stack

### Backend (API)
- **Runtime**: Bun (fast JavaScript runtime)
- **Framework**: Elysia (type-safe web framework)
- **Database**: PostgreSQL 16 with Drizzle ORM
- **Authentication**: OAuth 2.0 compliant with JWT
- **Caching**: Redis for session and data caching
- **Integration**: Snowflake SDK for data analytics

### Frontend (UI)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite for fast development
- **Routing**: TanStack Router for type-safe routing
- **State Management**: TanStack Query for data fetching
- **Styling**: Tailwind CSS v4 with custom components
- **UI Components**: Custom component library with shadcn/ui patterns

## Architecture

### Project Structure
```
gg-mvp/
  apps/
    api/              # Backend API server
      src/            # Source code
      db/             # Database schemas and migrations
      docs/           # API documentation
      scripts/        # Utility scripts
    ui/               # Frontend React application
      src/            # Source code
      components/     # React components
      public/         # Static assets
    ui-old/           # Legacy UI (deprecated)
  docs/               # Project documentation
  sample_data/        # Sample contractor data
```

### Database Schema
- **37+ tables** covering:
  - Multi-tenancy: Tenants, organizations, users
  - RBAC: Roles, permissions, policies
  - Business Domain: Contractors, contracts, deployments, metrics
  - Authentication: OAuth clients, tokens, sessions
  - Agent Management: MCP servers, tools, agent configurations

## Security & Authentication

### Authentication Flow
- **OAuth 2.0**: Full implementation with authorization code flow
- **JWT Tokens**: Secure token-based authentication
- **Multi-tenant**: Complete data isolation between tenants

### Authorization
- **RBAC System**: 22 policies with 4 default roles
  - Admin: Full system access
  - Manager: Organizational management
  - Analyst: Data analysis and reporting
  - Viewer: Read-only access
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **Tenant Isolation**: Row-level security ensuring data separation

## Development Environment

### Prerequisites
- Bun (latest version)
- Docker and Docker Compose
- Node.js (for UI development)
- Git

### Local Development Setup
1. **API Server**:
   ```bash
   cd apps/api
   bun install
   bun run dev  # Runs on http://localhost:3001
   ```

2. **UI Application**:
   ```bash
   cd apps/ui
   bun install
   bun run dev  # Runs on http://localhost:3600
   ```

3. **Database Setup**:
   ```bash
   ./scripts/dev.sh setup  # Sets up Docker containers and database
   ```

## API Endpoints

### Core Services
- **Authentication**: Login, register, OAuth flows
- **Contractor Management**: CRUD operations, search, filtering
- **Portfolio Management**: Lists, favorites, sharing
- **Snowflake Integration**: Data queries, caching, permissions
- **User Management**: Profile, settings, permissions

### Documentation
- Interactive API documentation available at: `http://localhost:3001/docs`

## Performance Considerations

### Optimization Features
- **Bun Runtime**: High-performance JavaScript execution
- **Database Optimization**: Optimized queries with Drizzle ORM
- **Caching Strategy**: Redis caching for frequently accessed data
- **Bundle Optimization**: Vite for efficient frontend builds

### Monitoring
- **Code Reduction**: 93% reduction achieved in key components
- **Bundle Size**: Continuous monitoring and optimization
- **Load Performance**: Optimized component loading

## Integration Points

### External Systems
- **Snowflake**: Data warehouse integration for analytics
- **OAuth Providers**: External authentication systems
- **MCP Servers**: Model Context Protocol for AI agent communication

### Agent Framework
- **Model Context Protocol (MCP)**: AI agent communication standard
- **Agent Taskflow (ATF)**: Workflow orchestration for AI agents
- **Multi-agent Orchestration**: Coordinated AI agent operations