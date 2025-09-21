# API Reference

Complete API documentation for all GoldenGate endpoints.

## Base URL

```
Development: http://localhost:4001/api/v1
Production: https://api.goldengate.com/api/v1
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Available APIs

### Core APIs

- [Authentication API](./authentication.md) - User registration, login, and session management
- [Contractor Profiles API](./contractor-profiles.md) - Aggregated contractor data and search
- [Contractor Lists API](./contractor-lists.md) - Portfolio and favorites management
- [Contractors API](./contractors.md) - Raw contractor records

### Data Integration APIs

- [Snowflake API](./snowflake.md) - Data warehouse queries and analytics

### System APIs

- [Health Check API](./health.md) - System status and monitoring

## Common Response Formats

### Successful Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error code or type",
  "message": "Human-readable error message",
  "details": { ... } // Optional additional error details
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  }
}
```

## HTTP Status Codes

| Status Code | Description |
|------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request successful, no content to return |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Access denied to resource |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Service temporarily unavailable |

## Request Headers

### Required Headers

| Header | Description | Example |
|--------|-------------|---------|
| Content-Type | Request body format | `application/json` |
| Authorization | JWT Bearer token | `Bearer eyJhbGci...` |

### Optional Headers

| Header | Description | Example |
|--------|-------------|---------|
| X-Tenant-Id | Override default tenant | `658146d8-2572-4fdb-9cb3-350ddab5893a` |
| X-Request-Id | Request tracking ID | `req_123456789` |
| Accept-Language | Preferred language | `en-US` |

## Rate Limiting

Rate limits are applied per user or IP address:

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Authentication | 5 requests | 1 minute |
| Read Operations | 1000 requests | 1 minute |
| Write Operations | 100 requests | 1 minute |
| Snowflake Queries | 10 requests | 1 minute |

Rate limit headers in response:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1704067200
```

## Pagination

For endpoints that return lists, use these query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number (1-based) |
| limit | number | 20 | Items per page (max: 100) |
| sort | string | created_at | Sort field |
| order | string | desc | Sort order (asc/desc) |

Example:
```
GET /api/v1/contractor-profiles?page=2&limit=50&sort=name&order=asc
```

## Filtering

Most list endpoints support filtering via query parameters:

```
GET /api/v1/contractor-profiles?state=VA&naics=541511&minRevenue=1000000
```

## Search

Search endpoints typically accept a `q` parameter:

```
GET /api/v1/contractor-profiles/search?q=technology+consulting&limit=10
```

## Date Formats

All dates are in ISO 8601 format:

```
2024-01-01T00:00:00.000Z
```

## Currency Values

All currency values are in USD and represented as strings to avoid floating-point precision issues:

```json
{
  "totalValue": "1234567.89",
  "averageContractValue": "98765.43"
}
```

## Batch Operations

Some endpoints support batch operations:

```json
POST /api/v1/contractor-lists/batch-add
{
  "listId": "uuid",
  "contractorIds": ["id1", "id2", "id3"]
}
```

## Webhooks

Configure webhooks for real-time notifications:

```json
POST /api/v1/webhooks
{
  "url": "https://your-server.com/webhook",
  "events": ["contractor.updated", "list.created"],
  "secret": "webhook_secret"
}
```

## API Versioning

The API uses URL-based versioning:

- Current version: `/api/v1`
- Legacy support: Minimum 6 months notice before deprecation
- Version header: `X-API-Version: 1.0.0`

## SDK Support

Official SDKs available:

- JavaScript/TypeScript: `@goldengate/api-client`
- Python: `goldengate-api`
- Go: `github.com/goldengate/go-client`

## Testing

Use the following test endpoints:

```
GET /api/v1/test/hello - Simple connectivity test
GET /api/v1/health - Health check with database status
```

## Support

- API Status: https://status.goldengate.com
- Documentation: https://docs.goldengate.com
- Support Email: api-support@goldengate.com