# GoldenGate API

Multi-tenant, agent-native platform API built with Bun + Elysia + Drizzle ORM + PostgreSQL.

## Features

- 🏢 **Multi-tenant architecture** with row-level security
- 🤖 **Agent-native** with MCP (Model Context Protocol) integration
- 🔐 **Fine-grained RBAC** with policy-based authorization
- 🔑 **OAuth 2.0 compliant** authentication server
- 📊 **Comprehensive data model** (30+ tables)
- ⚡ **High performance** with Bun runtime and Elysia framework
- 🔄 **Agent Taskflow (ATF)** integration for AI agent orchestration
- ❄️ **Snowflake integration** with query builder, caching, and permissions

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) installed
- [Docker](https://docker.com) and Docker Compose
- Git

### 1. Setup Development Environment

Run the automated setup script:

```bash
# From the apps directory
./scripts/dev.sh setup
```

This will:
- Start PostgreSQL (dev + test) and Redis containers
- Run database migrations
- Set up the development environment

### 2. Start the API Server

```bash
cd api
bun run dev
```

The API will be available at:
- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Database Admin**: http://localhost:8080 (Adminer)

## Development Scripts

### Docker Services

```bash
# Start all services
bun run docker:up

# Stop all services  
bun run docker:down

# Reset services (removes all data)
bun run docker:reset
```

### Database

```bash
# Generate new migrations
bun run db:generate

# Run migrations
bun run db:migrate

# Push schema directly (development only)
bun run db:push

# Open Drizzle Studio
bun run db:studio

# Database shell access
bun run db:shell        # Development DB
bun run db:shell:test   # Test DB
```

### Development Helper Script

The `./scripts/dev.sh` script provides additional commands:

```bash
# Full development setup
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

## Project Structure

```
api/
├── src/
│   ├── config/              # Environment configuration
│   ├── db/
│   │   ├── schema/          # Database schemas
│   │   ├── index.ts         # Database connection
│   │   └── migrate.ts       # Migration runner
│   ├── middleware/
│   │   ├── auth.ts          # Authentication
│   │   ├── tenant.ts        # Multi-tenancy
│   │   ├── rbac.ts          # Authorization
│   │   └── rateLimiting.ts  # Rate limiting
│   └── index.ts             # Main server
├── db/init/                 # Database initialization scripts
├── docker-compose.yml       # Docker services
└── drizzle.config.ts        # Drizzle ORM configuration
```

## Database Schema

The system includes comprehensive schemas for:

- **Multi-tenancy**: Tenants, subscriptions, billing
- **Users & Auth**: Users, sessions, organizations, OAuth 2.0
- **RBAC**: Policies, roles, permissions
- **Agents**: User agents (ATF), system agents (MCP), executions
- **Business Logic**: Organizations, contracts, metrics, deployments

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key configuration sections:
- Database connections (dev/test)
- JWT and OAuth settings
- CORS origins
- External service integrations (ATF, MCP)

## Testing

```bash
# Run tests
bun test

# Run tests in watch mode
bun test:watch

# End-to-end tests
bun run test:e2e
```

## Production Deployment

1. Set production environment variables
2. Use production-ready PostgreSQL and Redis
3. Enable SSL/TLS
4. Configure proper CORS origins
5. Set strong JWT secrets
6. Enable rate limiting and security headers

## API Documentation

Once running, API documentation is available at:
- Swagger UI: http://localhost:3001/swagger (when implemented)
- Health endpoint: http://localhost:3001/health
- [Snowflake Integration](./docs/SNOWFLAKE_INTEGRATION.md) - Complete guide for Snowflake data warehouse integration

## Architecture

### Multi-tenancy
- Tenant isolation via middleware
- Row-level security in PostgreSQL
- Tenant-aware database queries

### Authentication & Authorization
- JWT-based authentication
- OAuth 2.0 server implementation
- Fine-grained RBAC with conditional policies

### Agent Integration
- MCP server for system agents
- Agent Taskflow (ATF) for user agents
- Real-time agent communication

### Snowflake Integration
- Secure connection pooling
- Query builder with SQL injection prevention
- Result caching with TTL
- Role-based query permissions
- Streaming for large datasets

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all checks pass before submitting