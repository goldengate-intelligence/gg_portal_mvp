# Snowflake Integration Documentation

## Overview

This API provides comprehensive Snowflake data warehouse integration with secure query execution, result caching, and role-based access control.

## Table of Contents
- [Setup](#setup)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Security & Permissions](#security--permissions)
- [Query Builder](#query-builder)
- [Caching](#caching)
- [Examples](#examples)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Variables

Add the following variables to your `.env` file:

```env
# Required
SNOWFLAKE_ACCOUNT=xy12345.us-east-1  # Your Snowflake account identifier
SNOWFLAKE_USERNAME=your_username      # Snowflake username
SNOWFLAKE_PASSWORD=your_password      # Snowflake password
SNOWFLAKE_DATABASE=your_database      # Target database
SNOWFLAKE_WAREHOUSE=your_warehouse    # Compute warehouse

# Optional
SNOWFLAKE_SCHEMA=PUBLIC               # Default schema (default: PUBLIC)
SNOWFLAKE_ROLE=your_role             # Role to use
SNOWFLAKE_TIMEOUT=60000               # Query timeout in ms (default: 60000)
SNOWFLAKE_MAX_ROWS=10000              # Max rows per query (default: 10000)
```

### 3. Test Connection

```bash
curl -X GET http://localhost:3001/api/v1/snowflake/connection/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Configuration

### Connection Pool Settings

The connection pool is configured with:
- Maximum connections: 10
- Connection timeout: 60 seconds (configurable)
- Automatic cleanup of idle connections

### Role-Based Permissions

| Role | Permissions | Max Rows | Raw Queries |
|------|------------|----------|-------------|
| `admin` | SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER | 100,000 | ✅ |
| `analyst` | SELECT, INSERT, UPDATE | 50,000 | ✅ |
| `viewer` | SELECT only | 10,000 | ❌ |

## API Endpoints

### Connection Management

#### Test Connection
```http
GET /api/v1/snowflake/connection/test
```

Response:
```json
{
  "success": true,
  "connected": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Query Execution

#### Execute Raw Query
```http
POST /api/v1/snowflake/query/execute
```

Request:
```json
{
  "query": "SELECT * FROM customers WHERE state = ?",
  "binds": ["CA"],
  "maxRows": 1000,
  "timeout": 30000
}
```

Response:
```json
{
  "success": true,
  "rows": [...],
  "metadata": {
    "rowCount": 150,
    "columnCount": 5,
    "columns": [
      {
        "name": "customer_id",
        "type": "NUMBER",
        "nullable": false
      }
    ],
    "executionTime": 245,
    "queryId": "01234567-89ab-cdef-0123-456789abcdef"
  }
}
```

#### Validate Query
```http
POST /api/v1/snowflake/query/validate
```

Request:
```json
{
  "query": "SELECT * FROM customers"
}
```

### Query Builder

#### Select Query
```http
POST /api/v1/snowflake/query/select
```

Request:
```json
{
  "table": "customers",
  "columns": ["id", "name", "email"],
  "where": {
    "state": "CA",
    "age": { "$gte": 18 }
  },
  "orderBy": [
    { "column": "created_at", "direction": "DESC" }
  ],
  "limit": 100,
  "offset": 0
}
```

#### Insert Query
```http
POST /api/v1/snowflake/query/insert
```

Request:
```json
{
  "table": "customers",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "state": "CA"
  },
  "returning": ["id", "created_at"]
}
```

#### Update Query
```http
POST /api/v1/snowflake/query/update
```

Request:
```json
{
  "table": "customers",
  "data": {
    "status": "active",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "where": {
    "id": 123
  },
  "returning": ["id", "status"]
}
```

#### Delete Query
```http
POST /api/v1/snowflake/query/delete
```

Request:
```json
{
  "table": "customers",
  "where": {
    "status": "inactive"
  },
  "returning": ["id"]
}
```

### Metadata

#### List Tables
```http
GET /api/v1/snowflake/metadata/tables?schema=PUBLIC
```

Response:
```json
{
  "success": true,
  "rows": [
    {
      "TABLE_CATALOG": "DB",
      "TABLE_SCHEMA": "PUBLIC",
      "TABLE_NAME": "CUSTOMERS",
      "TABLE_TYPE": "BASE TABLE",
      "ROW_COUNT": 1000000,
      "BYTES": 52428800
    }
  ]
}
```

#### Get Column Information
```http
GET /api/v1/snowflake/metadata/columns/customers?schema=PUBLIC
```

### Query History

#### Get Query History
```http
GET /api/v1/snowflake/query/history?limit=100
```

### Cache Management

#### Get Cache Statistics
```http
GET /api/v1/snowflake/cache/stats
```

Response:
```json
{
  "success": true,
  "stats": {
    "size": 45,
    "maxSize": 100,
    "hitRate": 0.75,
    "entries": [...]
  }
}
```

#### Clear Cache
```http
DELETE /api/v1/snowflake/cache/clear
```

## Security & Permissions

### Query Sanitization

All queries are automatically sanitized to prevent SQL injection:
- Dangerous patterns are detected and blocked
- SQL comments are removed
- Parameter binding is enforced

### Permission Validation

Queries are validated against user permissions:
- Operation type (SELECT, INSERT, etc.)
- Database/schema/table access
- Row count limits
- Raw query execution rights

### Example Permission Check

```javascript
// Middleware automatically checks permissions
const permissions = {
  allowedOperations: ['SELECT'],
  allowedDatabases: ['ANALYTICS'],
  allowedSchemas: ['PUBLIC', 'REPORTS'],
  maxRowsPerQuery: 10000,
  readOnly: true
};
```

## Query Builder

### Supported Operations

#### WHERE Clause Operators
- `$gt`: Greater than
- `$gte`: Greater than or equal
- `$lt`: Less than
- `$lte`: Less than or equal
- `$ne`: Not equal
- `$like`: LIKE pattern matching
- `$ilike`: Case-insensitive LIKE
- `null`: IS NULL check
- Arrays: IN clause

### Complex Queries

#### Joins
```json
{
  "table": "orders",
  "joins": [
    {
      "type": "INNER",
      "table": "customers",
      "on": "orders.customer_id = customers.id"
    }
  ]
}
```

#### Aggregations
```json
{
  "table": "orders",
  "columns": ["customer_id", "COUNT(*) as order_count"],
  "groupBy": ["customer_id"],
  "having": "COUNT(*) > 5"
}
```

## Caching

### Cache Configuration
- Default TTL: 5 minutes
- Maximum cache size: 100 entries
- Automatic cleanup interval: 1 minute

### Cache Invalidation

Caches are automatically invalidated when:
- INSERT, UPDATE, or DELETE operations affect a table
- Manual cache clear is triggered
- TTL expires

## Examples

### JavaScript/TypeScript Client

```typescript
// Setup
const API_BASE = 'http://localhost:3001/api/v1';
const token = 'your-jwt-token';

// Execute a query
async function executeQuery(query: string, binds?: any[]) {
  const response = await fetch(`${API_BASE}/snowflake/query/execute`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, binds })
  });
  
  return response.json();
}

// Use query builder
async function selectCustomers(state: string) {
  const response = await fetch(`${API_BASE}/snowflake/query/select`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      table: 'customers',
      columns: ['id', 'name', 'email'],
      where: { state },
      limit: 100
    })
  });
  
  return response.json();
}
```

### Streaming Large Results

For large datasets, use streaming:

```typescript
async function streamQuery(query: string) {
  const response = await fetch(`${API_BASE}/snowflake/query/execute`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      streamResult: true
    })
  });
  
  const reader = response.body?.getReader();
  // Process stream...
}
```

## Error Handling

### Common Error Responses

#### Authentication Error
```json
{
  "success": false,
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

#### Permission Error
```json
{
  "success": false,
  "error": "Operation 'DELETE' is not allowed for your role"
}
```

#### Query Error
```json
{
  "success": false,
  "error": "SQL compilation error: Table 'UNKNOWN_TABLE' does not exist",
  "metadata": {
    "queryId": "...",
    "executionTime": 145
  }
}
```

## Best Practices

### 1. Use Parameter Binding
Always use parameter binding for dynamic values:
```javascript
// Good
{ query: "SELECT * FROM users WHERE id = ?", binds: [userId] }

// Bad - vulnerable to SQL injection
{ query: `SELECT * FROM users WHERE id = ${userId}` }
```

### 2. Leverage Query Builder
Use the query builder for standard operations:
```javascript
// Preferred
POST /api/v1/snowflake/query/select
{ table: "users", where: { id: 123 } }

// Instead of raw queries when possible
POST /api/v1/snowflake/query/execute
{ query: "SELECT * FROM users WHERE id = 123" }
```

### 3. Implement Pagination
For large datasets, always paginate:
```javascript
{
  table: "large_table",
  limit: 100,
  offset: page * 100
}
```

### 4. Monitor Cache Performance
Regularly check cache statistics to optimize performance:
```bash
curl -X GET http://localhost:3001/api/v1/snowflake/cache/stats \
  -H "Authorization: Bearer TOKEN"
```

### 5. Handle Errors Gracefully
Always check the `success` field in responses:
```javascript
const result = await executeQuery(query);
if (!result.success) {
  console.error('Query failed:', result.error);
  // Handle error appropriately
}
```

### 6. Use Appropriate Timeouts
Set reasonable timeouts for long-running queries:
```javascript
{
  query: "SELECT * FROM huge_table",
  timeout: 120000  // 2 minutes for large queries
}
```

## Troubleshooting

### Connection Issues

1. **Verify credentials**: Check SNOWFLAKE_* environment variables
2. **Test connection**: Use the `/connection/test` endpoint
3. **Check network**: Ensure Snowflake endpoints are accessible
4. **Verify account format**: Use full account identifier (e.g., `xy12345.us-east-1`)

### Performance Issues

1. **Enable caching**: Utilize the built-in cache for repeated queries
2. **Optimize queries**: Use appropriate indexes and filters
3. **Limit result sets**: Use `maxRows` parameter
4. **Monitor warehouse size**: Ensure adequate compute resources

### Permission Errors

1. **Check user role**: Verify the authenticated user's role
2. **Review permissions**: Check role-based permission configuration
3. **Validate query type**: Ensure operation is allowed for the role

## Support

For issues or questions:
1. Check the API logs for detailed error messages
2. Review Snowflake query history for execution details
3. Contact your system administrator for permission issues