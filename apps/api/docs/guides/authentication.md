# Authentication Guide

## Overview

GoldenGate API uses JWT (JSON Web Token) based authentication with support for OAuth 2.0. All protected endpoints require a valid JWT token in the Authorization header.

## Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database
    
    Client->>API: POST /auth/register or /auth/login
    API->>Database: Validate credentials
    Database-->>API: User data
    API->>API: Generate JWT token
    API-->>Client: Return token + user data
    Client->>API: Request with Bearer token
    API->>API: Verify JWT
    API-->>Client: Protected resource
```

## Endpoints

### Register New User

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePassword123!",
  "fullName": "John Doe",
  "tenantId": "658146d8-2572-4fdb-9cb3-350ddab5893a" // Optional
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "tenantId": "658146d8-2572-4fdb-9cb3-350ddab5893a",
    "role": "user",
    "organizationId": null
  }
}
```

**Error Responses:**
- `409 Conflict` - User already exists
- `400 Bad Request` - Invalid input data
- `500 Internal Server Error` - Registration failed

### User Login

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "tenantId": "658146d8-2572-4fdb-9cb3-350ddab5893a",
    "role": "user",
    "organizationId": null
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing required fields
- `500 Internal Server Error` - Login failed

### Get Current User

**Endpoint:** `GET /api/v1/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "fullName": "John Doe",
  "tenantId": "658146d8-2572-4fdb-9cb3-350ddab5893a",
  "organizationId": null,
  "role": "user"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `401 Unauthorized` - User not found or inactive

### Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Using Authentication in Requests

### Bearer Token Authentication

Include the JWT token in the Authorization header for all protected endpoints:

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
     http://localhost:4001/api/v1/contractor-profiles
```

### JavaScript/TypeScript Example

```typescript
// Login and store token
async function login(email: string, password: string) {
  const response = await fetch('http://localhost:4001/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store token securely
    localStorage.setItem('access_token', data.access_token);
    return data;
  } else {
    throw new Error(data.error || 'Login failed');
  }
}

// Make authenticated request
async function getContractorProfiles() {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('http://localhost:4001/api/v1/contractor-profiles', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
}
```

## Token Management

### Token Structure

The JWT token contains the following claims:

```json
{
  "sub": "user-id",           // Subject (User ID)
  "sessionId": "session-id",   // Session identifier
  "email": "user@example.com", // User email
  "iat": 1704067200,          // Issued at timestamp
  "exp": 1704070800,          // Expiration timestamp
  "iss": "http://localhost:4001" // Issuer
}
```

### Token Expiration

- Default expiration: 1 hour
- Configurable via `JWT_EXPIRES_IN` environment variable
- Format examples: "1h", "30m", "7d"

### Token Refresh Strategy

Currently, the API doesn't implement refresh tokens. When a token expires:

1. User must login again to get a new token
2. Implement client-side token expiration checking:

```typescript
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

// Check before making requests
if (isTokenExpired(token)) {
  // Redirect to login or refresh token
  await login(email, password);
}
```

## OAuth 2.0 Support

### Authorization Endpoint

**Endpoint:** `GET /api/v1/auth/oauth/authorize`

**Query Parameters:**
- `client_id` - OAuth client identifier
- `redirect_uri` - Callback URL
- `response_type` - "code" for authorization code flow
- `scope` - Space-separated scopes (default: "openid profile email")
- `state` - CSRF protection token
- `code_challenge` - PKCE challenge (optional)
- `code_challenge_method` - "S256" (optional)

### Token Exchange

**Endpoint:** `POST /api/v1/auth/oauth/token`

**Request Body:**
```json
{
  "grant_type": "authorization_code",
  "code": "authorization-code",
  "client_id": "client-id",
  "client_secret": "client-secret",
  "redirect_uri": "http://localhost:3000/callback",
  "code_verifier": "pkce-verifier" // If using PKCE
}
```

**Response:**
```json
{
  "access_token": "token",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh-token",
  "scope": "openid profile email"
}
```

## Security Best Practices

### Password Requirements

- Minimum 8 characters
- Should include uppercase, lowercase, numbers, and special characters
- Stored using Argon2id hashing algorithm

### Token Storage

**DO:**
- Store tokens in memory for web applications
- Use secure storage (Keychain/Keystore) for mobile apps
- Implement token expiration checking

**DON'T:**
- Store tokens in localStorage for sensitive applications
- Include tokens in URL parameters
- Log tokens in console or error messages

### HTTPS in Production

Always use HTTPS in production to prevent token interception:

```env
# Production configuration
API_URL=https://api.goldengate.com
CORS_ALLOWED_ORIGINS=https://app.goldengate.com
```

### Rate Limiting

The API implements rate limiting to prevent brute force attacks:
- Login attempts: 5 per minute per IP
- Registration: 3 per hour per IP

## Multi-Tenant Authentication

### Tenant Context

Users are associated with tenants and organizations:

```typescript
interface AuthenticatedUser {
  id: string;
  email: string;
  tenantId: string;      // Current tenant
  organizationId?: string; // Current organization
  role: string;          // Role within tenant
}
```

### Switching Tenants

If a user belongs to multiple tenants, implement tenant switching in your client:

```typescript
// Store current tenant
localStorage.setItem('current_tenant', tenantId);

// Include in requests
fetch('/api/v1/contractor-profiles', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Tenant-Id': tenantId, // Optional tenant override
  },
});
```

## Troubleshooting

### Common Issues

#### "Invalid credentials" on login
- Verify email and password are correct
- Check if user account is active
- Ensure password meets requirements

#### "Unauthorized" on protected endpoints
- Check token is included in Authorization header
- Verify token hasn't expired
- Ensure "Bearer " prefix is included

#### "User already exists" on registration
- Email address is already registered
- Use login endpoint instead
- Try password reset if password forgotten

### Debug Token Issues

```bash
# Decode JWT token (without verification)
echo "eyJhbGciOiJIUzI1NiJ9..." | cut -d. -f2 | base64 -d

# Test token validity
curl -H "Authorization: Bearer <token>" \
     http://localhost:4001/api/v1/auth/me
```

## API Client Libraries

### TypeScript/JavaScript

```typescript
class GoldenGateAPI {
  private token?: string;
  private baseURL = 'http://localhost:4001/api/v1';
  
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    this.token = data.access_token;
    return data;
  }
  
  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.token}`,
      },
    });
    
    if (response.status === 401) {
      // Token expired, redirect to login
      throw new Error('Authentication required');
    }
    
    return response.json();
  }
}
```

## Next Steps

- [Contractor Profiles API](../api/contractor-profiles.md)
- [Contractor Lists API](../api/contractor-lists.md)
- [Snowflake Integration](./snowflake.md)
- [Security Best Practices](./security.md)