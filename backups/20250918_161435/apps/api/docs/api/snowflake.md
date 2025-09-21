# Snowflake API

API endpoints for Snowflake data warehouse integration and analytics.

## Overview

The Snowflake API provides secure access to the data warehouse for advanced analytics, custom queries, and data synchronization. All queries are subject to permission checks and rate limiting.

## Configuration

Snowflake integration requires the following environment variables:

```env
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_USERNAME=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=GOLDENGATE
SNOWFLAKE_SCHEMA=PUBLIC
SNOWFLAKE_ROLE=ANALYST
```

## Endpoints

### Test Connection

Verify Snowflake connectivity and credentials.

**Endpoint:** `GET /api/v1/snowflake/connection/test`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "connected": true,
  "timestamp": "2024-01-16T00:00:00.000Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Connection test failed",
  "details": "Authentication failed: Incorrect username or password"
}
```

### Execute Query

Execute a raw SQL query against Snowflake.

**Endpoint:** `POST /api/v1/snowflake/query/execute`

**Authentication:** Required

**Permissions:** Requires `snowflake.query.execute` permission

**Request Body:**

```json
{
  "query": "SELECT * FROM contractors WHERE state = ? LIMIT ?",
  "binds": ["VA", 100],
  "timeout": 30000,
  "maxRows": 1000,
  "streamResult": false
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | SQL query to execute |
| binds | array | No | Parameter bindings for prepared statement |
| timeout | number | No | Query timeout in milliseconds (default: 60000) |
| maxRows | number | No | Maximum rows to return (default: 10000) |
| streamResult | boolean | No | Stream large result sets (default: false) |

**Response:**

```json
{
  "success": true,
  "rows": [
    {
      "UEI": "ZQGGHJH74DW7",
      "NAME": "ACME TECHNOLOGIES INC",
      "STATE": "VA",
      "TOTAL_CONTRACT_VALUE": 125000000,
      "EMPLOYEE_COUNT": 150
    }
  ],
  "metadata": {
    "rowCount": 1,
    "columnCount": 5,
    "columns": [
      {
        "name": "UEI",
        "type": "VARCHAR",
        "nullable": false
      },
      {
        "name": "NAME",
        "type": "VARCHAR",
        "nullable": false
      },
      {
        "name": "STATE",
        "type": "VARCHAR",
        "nullable": true
      },
      {
        "name": "TOTAL_CONTRACT_VALUE",
        "type": "NUMBER",
        "nullable": true
      },
      {
        "name": "EMPLOYEE_COUNT",
        "type": "NUMBER",
        "nullable": true
      }
    ],
    "executionTime": 245
  },
  "cached": false
}
```

### Validate Query

Validate SQL syntax without executing the query.

**Endpoint:** `POST /api/v1/snowflake/query/validate`

**Authentication:** Required

**Request Body:**

```json
{
  "query": "SELECT * FROM contractors WHERE state = 'VA'"
}
```

**Response:**

```json
{
  "valid": true,
  "message": "Query syntax is valid"
}
```

**Error Response:**

```json
{
  "valid": false,
  "error": "SQL compilation error: Table 'CONTRACTORZ' does not exist",
  "line": 1,
  "position": 14
}
```

### Build and Execute SELECT Query

Build and execute a SELECT query using a safe query builder.

**Endpoint:** `POST /api/v1/snowflake/query/select`

**Authentication:** Required

**Request Body:**

```json
{
  "table": "contractors",
  "columns": ["uei", "name", "state", "total_contract_value"],
  "where": {
    "state": "VA",
    "employee_count": { "$gte": 100 }
  },
  "orderBy": [
    {
      "column": "total_contract_value",
      "direction": "DESC"
    }
  ],
  "limit": 50,
  "offset": 0,
  "joins": [
    {
      "type": "INNER",
      "table": "contracts",
      "on": "contractors.uei = contracts.contractor_uei"
    }
  ],
  "groupBy": ["uei", "name", "state"],
  "having": "SUM(total_contract_value) > 1000000"
}
```

**Response:**

```json
{
  "success": true,
  "rows": [...],
  "metadata": {...},
  "sql": "SELECT uei, name, state, total_contract_value FROM contractors WHERE state = 'VA' AND employee_count >= 100 ORDER BY total_contract_value DESC LIMIT 50",
  "cached": false
}
```

### Build and Execute INSERT Query

Insert data into Snowflake tables.

**Endpoint:** `POST /api/v1/snowflake/query/insert`

**Authentication:** Required

**Permissions:** Requires `snowflake.data.write` permission

**Request Body:**

```json
{
  "table": "contractor_notes",
  "data": {
    "contractor_uei": "ZQGGHJH74DW7",
    "note": "Excellent past performance",
    "created_by": "user-001",
    "created_at": "2024-01-16T00:00:00Z"
  },
  "returning": ["id", "created_at"]
}
```

**Response:**

```json
{
  "success": true,
  "rows": [
    {
      "id": 12345,
      "created_at": "2024-01-16T00:00:00Z"
    }
  ],
  "metadata": {
    "rowCount": 1,
    "affectedRows": 1
  },
  "sql": "INSERT INTO contractor_notes ..."
}
```

### Build and Execute UPDATE Query

Update data in Snowflake tables.

**Endpoint:** `POST /api/v1/snowflake/query/update`

**Authentication:** Required

**Permissions:** Requires `snowflake.data.write` permission

**Request Body:**

```json
{
  "table": "contractor_notes",
  "data": {
    "note": "Updated note content",
    "updated_at": "2024-01-16T10:00:00Z"
  },
  "where": {
    "id": 12345
  },
  "returning": ["id", "updated_at"]
}
```

**Response:**

```json
{
  "success": true,
  "rows": [
    {
      "id": 12345,
      "updated_at": "2024-01-16T10:00:00Z"
    }
  ],
  "metadata": {
    "rowCount": 1,
    "affectedRows": 1
  },
  "sql": "UPDATE contractor_notes SET ..."
}
```

### Build and Execute DELETE Query

Delete data from Snowflake tables.

**Endpoint:** `POST /api/v1/snowflake/query/delete`

**Authentication:** Required

**Permissions:** Requires `snowflake.data.delete` permission

**Request Body:**

```json
{
  "table": "contractor_notes",
  "where": {
    "id": 12345
  },
  "returning": ["id"]
}
```

**Response:**

```json
{
  "success": true,
  "rows": [
    {
      "id": 12345
    }
  ],
  "metadata": {
    "rowCount": 1,
    "affectedRows": 1
  },
  "sql": "DELETE FROM contractor_notes WHERE ..."
}
```

### Get Query History

Retrieve query execution history.

**Endpoint:** `GET /api/v1/snowflake/query/history`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Number of queries to return (default: 100) |

**Response:**

```json
{
  "success": true,
  "rows": [
    {
      "QUERY_ID": "01b0c1d2-0000-1234-0000-000000000001",
      "QUERY_TEXT": "SELECT * FROM contractors LIMIT 10",
      "DATABASE_NAME": "GOLDENGATE",
      "SCHEMA_NAME": "PUBLIC",
      "QUERY_TYPE": "SELECT",
      "USER_NAME": "API_USER",
      "WAREHOUSE_NAME": "COMPUTE_WH",
      "WAREHOUSE_SIZE": "SMALL",
      "EXECUTION_STATUS": "SUCCESS",
      "ERROR_CODE": null,
      "ERROR_MESSAGE": null,
      "START_TIME": "2024-01-16T09:00:00Z",
      "END_TIME": "2024-01-16T09:00:01Z",
      "TOTAL_ELAPSED_TIME": 1000,
      "BYTES_SCANNED": 1048576,
      "ROWS_PRODUCED": 10,
      "COMPILATION_TIME": 50,
      "EXECUTION_TIME": 950
    }
  ],
  "metadata": {
    "rowCount": 1,
    "columnCount": 17
  }
}
```

### Get Table Metadata

Retrieve metadata about tables in the Snowflake schema.

**Endpoint:** `GET /api/v1/snowflake/metadata/tables`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| schema | string | No | Schema name (default: PUBLIC) |

**Response:**

```json
{
  "success": true,
  "rows": [
    {
      "TABLE_CATALOG": "GOLDENGATE",
      "TABLE_SCHEMA": "PUBLIC",
      "TABLE_NAME": "CONTRACTORS",
      "TABLE_TYPE": "BASE TABLE",
      "ROW_COUNT": 293847,
      "BYTES": 134217728,
      "CREATED": "2024-01-01T00:00:00Z",
      "LAST_ALTERED": "2024-01-15T00:00:00Z"
    }
  ],
  "metadata": {
    "rowCount": 1,
    "columnCount": 8
  }
}
```

### Get Column Metadata

Retrieve column information for a specific table.

**Endpoint:** `GET /api/v1/snowflake/metadata/columns/:table`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| table | string | Yes | Table name |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| schema | string | No | Schema name (default: PUBLIC) |

**Response:**

```json
{
  "success": true,
  "rows": [
    {
      "COLUMN_NAME": "UEI",
      "DATA_TYPE": "VARCHAR",
      "IS_NULLABLE": "NO",
      "COLUMN_DEFAULT": null,
      "CHARACTER_MAXIMUM_LENGTH": 12,
      "NUMERIC_PRECISION": null,
      "NUMERIC_SCALE": null,
      "ORDINAL_POSITION": 1
    },
    {
      "COLUMN_NAME": "NAME",
      "DATA_TYPE": "VARCHAR",
      "IS_NULLABLE": "NO",
      "COLUMN_DEFAULT": null,
      "CHARACTER_MAXIMUM_LENGTH": 255,
      "NUMERIC_PRECISION": null,
      "NUMERIC_SCALE": null,
      "ORDINAL_POSITION": 2
    }
  ],
  "metadata": {
    "rowCount": 2,
    "columnCount": 8
  }
}
```

### Get Cache Statistics

Get statistics about the query cache.

**Endpoint:** `GET /api/v1/snowflake/cache/stats`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "stats": {
    "entries": 45,
    "size": 2097152,
    "maxSize": 10485760,
    "hits": 1250,
    "misses": 300,
    "hitRate": 0.806,
    "evictions": 15,
    "oldestEntry": "2024-01-16T08:00:00Z",
    "newestEntry": "2024-01-16T10:30:00Z"
  }
}
```

### Clear Cache

Clear the query result cache.

**Endpoint:** `DELETE /api/v1/snowflake/cache/clear`

**Authentication:** Required

**Permissions:** Requires `snowflake.cache.manage` permission

**Response:**

```json
{
  "success": true,
  "message": "Cache cleared successfully"
}
```

## Query Builder Syntax

### WHERE Clause Operators

The query builder supports MongoDB-style operators:

```json
{
  "where": {
    "field": "value",                    // Equals
    "field": { "$eq": "value" },        // Equals
    "field": { "$ne": "value" },        // Not equals
    "field": { "$gt": 100 },            // Greater than
    "field": { "$gte": 100 },           // Greater than or equal
    "field": { "$lt": 100 },            // Less than
    "field": { "$lte": 100 },           // Less than or equal
    "field": { "$in": [1, 2, 3] },      // In array
    "field": { "$nin": [1, 2, 3] },     // Not in array
    "field": { "$like": "%pattern%" },   // LIKE pattern
    "field": { "$ilike": "%pattern%" },  // Case-insensitive LIKE
    "field": { "$between": [10, 20] },   // Between values
    "field": { "$isNull": true },        // IS NULL
    "field": { "$isNotNull": true }      // IS NOT NULL
  }
}
```

### Complex Conditions

```json
{
  "where": {
    "$and": [
      { "state": "VA" },
      { "employee_count": { "$gte": 100 } }
    ],
    "$or": [
      { "certification": "8a" },
      { "certification": "HUBZone" }
    ]
  }
}
```

## Permissions

Snowflake queries are subject to permission checks:

| Permission | Description |
|------------|-------------|
| `snowflake.query.execute` | Execute raw SQL queries |
| `snowflake.query.select` | Execute SELECT queries |
| `snowflake.data.write` | Execute INSERT/UPDATE queries |
| `snowflake.data.delete` | Execute DELETE queries |
| `snowflake.metadata.read` | Read table/column metadata |
| `snowflake.cache.manage` | Manage query cache |

## Query Limits

Default query limits to prevent resource exhaustion:

| Limit | Default | Maximum | Configurable |
|-------|---------|---------|--------------|
| Query Timeout | 60s | 300s | Yes |
| Max Rows | 10,000 | 100,000 | Yes |
| Max Query Length | 100KB | 1MB | Yes |
| Queries per Minute | 10 | 100 | Per user |
| Cache TTL | 5 min | 60 min | Yes |

## Best Practices

### 1. Use Parameterized Queries

Always use parameter binding to prevent SQL injection:

```json
{
  "query": "SELECT * FROM contractors WHERE state = ? AND employees > ?",
  "binds": ["VA", 100]
}
```

### 2. Implement Result Caching

Results are cached for 5 minutes by default. Use cache for frequently accessed data:

```json
{
  "success": true,
  "data": [...],
  "cached": true,
  "cacheKey": "query_hash_123",
  "cachedAt": "2024-01-16T10:00:00Z"
}
```

### 3. Use Query Builder for Safety

Prefer the query builder over raw SQL for better security:

```json
{
  "table": "contractors",
  "where": {
    "state": "VA",
    "certifications": { "$contains": "8a" }
  }
}
```

### 4. Optimize Large Result Sets

For large result sets, use streaming or pagination:

```json
{
  "query": "SELECT * FROM large_table",
  "streamResult": true,
  "maxRows": 1000,
  "offset": 0
}
```

### 5. Monitor Query Performance

Check query history regularly to identify slow queries:

```bash
GET /api/v1/snowflake/query/history?limit=100
```

## Error Handling

### Common Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `SNOWFLAKE_NOT_CONFIGURED` | Missing configuration | Set environment variables |
| `AUTHENTICATION_FAILED` | Invalid credentials | Check username/password |
| `PERMISSION_DENIED` | Insufficient permissions | Request necessary permissions |
| `QUERY_TIMEOUT` | Query exceeded timeout | Optimize query or increase timeout |
| `RATE_LIMIT_EXCEEDED` | Too many queries | Wait before retrying |
| `INVALID_QUERY` | SQL syntax error | Fix query syntax |
| `TABLE_NOT_FOUND` | Table doesn't exist | Verify table name and schema |

### Error Response Format

```json
{
  "success": false,
  "error": "QUERY_TIMEOUT",
  "message": "Query execution exceeded 60 second timeout",
  "details": {
    "queryId": "01b0c1d2-0000-1234-0000-000000000001",
    "elapsedTime": 60000,
    "warehouse": "COMPUTE_WH"
  }
}
```

## Webhooks for Data Sync

Configure webhooks to receive notifications about data changes:

```json
POST /api/v1/snowflake/webhooks
{
  "table": "contractors",
  "events": ["INSERT", "UPDATE", "DELETE"],
  "url": "https://your-server.com/webhook",
  "filters": {
    "state": "VA"
  }
}
```

## Related APIs

- [Contractor Profiles API](./contractor-profiles.md) - Synchronized contractor data
- [Authentication API](./authentication.md) - User authentication
- [Contractor Lists API](./contractor-lists.md) - Portfolio management