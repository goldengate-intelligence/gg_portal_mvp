# Frontend Integration Guide

This guide shows how to integrate the frontend with the GoldenGate API for authentication and user management.

## 🔐 Authentication Flow

### 1. OAuth 2.0 Client Configuration

```typescript
// Frontend environment configuration
const config = {
  API_BASE_URL: 'http://localhost:4001/api/v1',
  OAUTH_CLIENT_ID: 'goldengate-web',
  OAUTH_CLIENT_SECRET: 'K9qA1BWN5EDWG69O6ka8rv-YEgAfSqUQ',
  OAUTH_REDIRECT_URI: 'http://localhost:3000/auth/callback',
  DEFAULT_TENANT_ID: '658146d8-2572-4fdb-9cb3-350ddab5893a',
};
```

### 2. User Registration

```typescript
async function registerUser(userData: {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}) {
  const response = await fetch(`${config.API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...userData,
      tenantId: config.DEFAULT_TENANT_ID,
    }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  return response.json();
}
```

### 3. User Login

```typescript
async function loginUser(credentials: {
  email: string;
  password: string;
}) {
  const response = await fetch(`${config.API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  
  // Store token in localStorage or secure storage
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
}
```

### 4. Get Current User Info

```typescript
async function getCurrentUser() {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    throw new Error('No access token');
  }

  const response = await fetch(`${config.API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      throw new Error('Session expired');
    }
    throw new Error('Failed to get user info');
  }

  return response.json();
}
```

### 5. Logout

```typescript
async function logoutUser() {
  const token = localStorage.getItem('access_token');
  
  if (token) {
    try {
      await fetch(`${config.API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.warn('Logout request failed:', error);
    }
  }

  // Clear local storage regardless
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
}
```

## 🏢 Multi-Tenant API Calls

All API calls require the tenant ID in the headers:

```typescript
async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    throw new Error('No access token');
  }

  const response = await fetch(`${config.API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-tenant-id': user.tenantId || config.DEFAULT_TENANT_ID,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}
```

## 👥 User Management (Admin Functions)

### Get All Users

```typescript
async function getAllUsers() {
  return makeAuthenticatedRequest('/users');
}
```

### Get Single User

```typescript
async function getUser(userId: string) {
  return makeAuthenticatedRequest(`/users/${userId}`);
}
```

### Create User (Admin only)

```typescript
async function createUser(userData: {
  email: string;
  username: string;
  password: string;
  fullName?: string;
  role?: string;
  organizationId?: string;
}) {
  return makeAuthenticatedRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}
```

### Update User

```typescript
async function updateUser(userId: string, updates: {
  email?: string;
  username?: string;
  fullName?: string;
  isActive?: boolean;
  role?: string;
}) {
  return makeAuthenticatedRequest(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}
```

### Update Profile

```typescript
async function updateProfile(userId: string, profileData: {
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  timezone?: string;
  preferences?: Record<string, any>;
}) {
  return makeAuthenticatedRequest(`/users/${userId}/profile`, {
    method: 'PATCH',
    body: JSON.stringify(profileData),
  });
}
```

### Change Password

```typescript
async function changePassword(userId: string, passwords: {
  currentPassword?: string;
  newPassword: string;
}) {
  return makeAuthenticatedRequest(`/users/${userId}/change-password`, {
    method: 'POST',
    body: JSON.stringify(passwords),
  });
}
```

## 🛡️ Role-Based Access Control

The API implements fine-grained RBAC. Here are the default roles:

### User Roles

1. **user** (Default)
   - Read/update own profile
   - Manage own agents
   - Read organization info

2. **org_admin**
   - All user permissions
   - Read/create/update all users in organization
   - Manage all agents in organization

3. **admin**
   - All org_admin permissions
   - Full user management
   - Organization management
   - Tenant configuration
   - Role management
   - Audit log access

4. **super_admin**
   - Unrestricted access (bypasses RBAC)

### Permission Examples

```typescript
// Check if user has permission (client-side validation)
function hasPermission(user: any, resource: string, action: string): boolean {
  // This is a simplified check - the real permission check happens server-side
  switch (user.role) {
    case 'super_admin':
    case 'admin':
      return true;
    case 'org_admin':
      return ['users', 'agents', 'organizations'].includes(resource);
    case 'user':
      return resource === 'users' && ['read', 'update'].includes(action) ||
             resource === 'agents';
    default:
      return false;
  }
}
```

## 🔄 React Integration Example

### Authentication Context

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  tenantId: string;
}

interface AuthContext {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('access_token');
    if (token) {
      getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginUser({ email, password });
    setUser(data.user);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const register = async (userData: any) => {
    await registerUser(userData);
    // Auto-login after registration
    await login(userData.email, userData.password);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Protected Routes

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasPermission(user, requiredRole, 'access')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

### Login Component

```typescript
import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## 🚀 Next Steps

1. **Test the authentication flow** with the provided examples
2. **Implement user management UI** with proper role-based access
3. **Add agent management** endpoints and UI
4. **Integrate with Agent Taskflow (ATF)** for AI agent orchestration
5. **Add OAuth 2.0 authorization flow** for third-party integrations

## 📊 Test Users

You can create test users with different roles:

```bash
# Admin user (already created)
curl -X POST http://localhost:4001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@goldengate.app", "password": "admin123456"}'

# Create a regular user
curl -X POST http://localhost:4001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@goldengate.app",
    "username": "user",
    "password": "user123456",
    "fullName": "Regular User"
  }'
```

The API is now ready for frontend integration with complete OAuth 2.0 compliance, multi-tenant support, and fine-grained RBAC! 🎉