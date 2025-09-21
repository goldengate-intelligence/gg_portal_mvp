# GoldenGate API Documentation

## Overview

GoldenGate is a Federal Contractor Intelligence Platform that provides comprehensive data about government contractors, their contracts, and performance metrics. This API serves as the backend for managing contractor profiles, portfolios, and integrating with Snowflake for advanced data analytics.

## Table of Contents

- [Getting Started](./guides/getting-started.md)
- [Authentication](./guides/authentication.md)
- [API Reference](./api/README.md)
- [Database Schema](./schemas/README.md)
- [Deployment Guide](./guides/deployment.md)
- [Configuration](./guides/configuration.md)

## Quick Start

### Prerequisites

- Node.js 18+ or Bun runtime
- PostgreSQL 14+
- Snowflake account (optional, for data analytics)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd apps/api

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env

# Run database migrations
bun run db:migrate

# Start the development server
bun run dev
```

### Base URL

Development: `http://localhost:4001`

### API Documentation

Interactive API documentation is available at `http://localhost:4001/docs` when the server is running.

## Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- OAuth 2.0 support
- Role-based access control (RBAC)
- Multi-tenant architecture

### 📊 Contractor Management
- **Contractor Profiles**: Aggregated view of contractor data
- **Portfolio Management**: Create and manage lists of contractors
- **Favorites System**: Quick access to important contractors
- **Search & Filter**: Advanced search capabilities

### ❄️ Snowflake Integration
- Direct query execution
- Query builder for safe operations
- Result caching for performance
- Permission-based data access

### 🏢 Multi-Tenant Support
- Tenant isolation
- Organization management
- User role management

## API Endpoints Overview

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout user

### Contractor Profiles
- `GET /api/v1/contractor-profiles` - List profiles
- `GET /api/v1/contractor-profiles/:id` - Get profile details
- `GET /api/v1/contractor-profiles/search` - Search profiles
- `GET /api/v1/contractor-profiles/:id/contracts` - Get contractor's contracts

### Contractor Lists (Portfolios)
- `GET /api/v1/contractor-lists` - Get user's lists
- `POST /api/v1/contractor-lists` - Create new list
- `PUT /api/v1/contractor-lists/:id` - Update list
- `DELETE /api/v1/contractor-lists/:id` - Delete list
- `POST /api/v1/contractor-lists/:id/items` - Add contractor to list
- `DELETE /api/v1/contractor-lists/:id/items/:itemId` - Remove from list

### Snowflake Data Operations
- `GET /api/v1/snowflake/connection/test` - Test connection
- `POST /api/v1/snowflake/query/execute` - Execute raw query
- `POST /api/v1/snowflake/query/select` - Build & execute SELECT
- `GET /api/v1/snowflake/metadata/tables` - List tables
- `GET /api/v1/snowflake/cache/stats` - Cache statistics

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "message": "Human-readable error description",
  "code": "ERROR_CODE"
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:
- **Default**: 100 requests per minute per IP
- **Authenticated**: 1000 requests per minute per user
- **Snowflake queries**: 10 queries per minute per user

## Support

For issues, questions, or feature requests, please contact the development team or create an issue in the repository.

## License

© 2024 GoldenGate. All rights reserved.