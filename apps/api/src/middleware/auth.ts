import { Elysia, Context } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { db } from "../db";
import { users, userSessions, oauthAccessTokens } from "../db/schema";
import { eq, and, gt } from "drizzle-orm";
import { config } from "../config";

export interface AuthContext {
  userId: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
    organizationId: string;
  } | null;
  sessionId: string | null;
  token: string | null;
}

// JWT Authentication middleware
export const authMiddleware = () =>
  new Elysia({ name: "auth" })
    .use(
      jwt({
        name: "jwt",
        secret: config.jwt.secret,
        exp: config.jwt.expiresIn,
      })
    )
    .derive(async (context: Context & { jwt: any }) => {
      console.log('🔐 AUTH MIDDLEWARE DERIVE FUNCTION CALLED');
      console.log('🔐 Path:', context.path || context.request?.url);
      const authHeader = context.request.headers.get("authorization");
      console.log('Auth middleware - authHeader:', authHeader);
      
      if (!authHeader) {
        console.log('Auth middleware - no auth header');
        return { userId: null, user: null, sessionId: null, token: null };
      }

      const token = authHeader.replace("Bearer ", "");
      console.log('Auth middleware - token extracted:', token.substring(0, 20) + '...');
      
      try {
        // Try JWT token first
        const jwtPayload = await context.jwt.verify(token);
        console.log('Auth middleware - JWT payload:', jwtPayload);
        
        if (jwtPayload) {
          const user = await getUserById(jwtPayload.sub);
          console.log('Auth middleware - user found:', user);
          const result = {
            userId: jwtPayload.sub,
            user,
            sessionId: jwtPayload.sessionId || null,
            token,
          };
          console.log('Auth middleware - returning result:', result);
          return result;
        }
      } catch (error) {
        console.log('Auth middleware - JWT verification failed:', error);
        // JWT verification failed, try OAuth access token
        const oauthUser = await validateOAuthToken(token);
        if (oauthUser) {
          console.log('Auth middleware - OAuth user found:', oauthUser);
          return {
            userId: oauthUser.id,
            user: oauthUser,
            sessionId: null,
            token,
          };
        }
      }

      console.log('Auth middleware - no valid authentication found');
      return { userId: null, user: null, sessionId: null, token: null };
    })
    .onError(({ error, code }) => {
      if (error.message.includes("unauthorized") || error.message.includes("token")) {
        return {
          error: "Unauthorized",
          code: "UNAUTHORIZED",
          statusCode: 401,
        };
      }
    });

// Require authentication middleware
export const requireAuth = () =>
  new Elysia({ name: "require-auth" })
    .derive((context: Context & AuthContext) => {
      console.log('requireAuth middleware - checking user:', context.user);
      if (!context.user) {
        console.log('requireAuth middleware - NO USER FOUND');
        throw new Error("Authentication required");
      }
      console.log('requireAuth middleware - user authenticated:', context.user.id);
      return context;
    });

// Require specific role middleware
export const requireRole = (roles: string | string[]) =>
  new Elysia({ name: "require-role" })
    .derive((context: Context & AuthContext) => {
      if (!context.user) {
        throw new Error("Authentication required");
      }

      const userRoles = Array.isArray(roles) ? roles : [roles];
      if (!userRoles.includes(context.user.role)) {
        throw new Error(`Insufficient permissions. Required: ${userRoles.join(" or ")}`);
      }

      return context;
    });

// Session-based authentication middleware
export const sessionAuth = () =>
  new Elysia({ name: "session-auth" })
    .derive(async (context: Context) => {
      const sessionToken = 
        context.request.headers.get("x-session-token") ||
        context.request.headers.get("authorization")?.replace("Bearer ", "");

      if (!sessionToken) {
        return { userId: null, user: null, sessionId: null };
      }

      const session = await validateSession(sessionToken);
      
      if (!session) {
        return { userId: null, user: null, sessionId: null };
      }

      const user = await getUserById(session.userId);

      return {
        userId: session.userId,
        user,
        sessionId: session.id,
        token: sessionToken,
      };
    });

// Helper functions
async function getUserById(userId: string) {
  try {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        tenantId: users.tenantId,
        organizationId: users.primaryOrganizationId,
      })
      .from(users)
      .where(and(
        eq(users.id, userId),
        eq(users.isActive, true)
      ))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

async function validateSession(sessionToken: string) {
  try {
    const result = await db
      .select()
      .from(userSessions)
      .where(and(
        eq(userSessions.sessionToken, sessionToken),
        gt(userSessions.expiresAt, new Date()),
        eq(userSessions.isActive, true)
      ))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error validating session:", error);
    return null;
  }
}

async function validateOAuthToken(token: string) {
  try {
    const result = await db
      .select({
        userId: oauthAccessTokens.userId,
        scopes: oauthAccessTokens.scopes,
        expiresAt: oauthAccessTokens.expiresAt,
      })
      .from(oauthAccessTokens)
      .where(and(
        eq(oauthAccessTokens.token, token),
        gt(oauthAccessTokens.expiresAt, new Date())
      ))
      .limit(1);

    if (!result[0]) {
      return null;
    }

    const user = await getUserById(result[0].userId);
    return user;
  } catch (error) {
    console.error("Error validating OAuth token:", error);
    return null;
  }
}

// Utility functions
export function getUser(context: Context & AuthContext) {
  return context.user;
}

export function getUserId(context: Context & AuthContext): string {
  if (!context.userId) {
    throw new Error("No authenticated user");
  }
  return context.userId;
}

export function requireAuthenticatedUser(context: Context & AuthContext) {
  if (!context.user) {
    throw new Error("Authentication required");
  }
  return context.user;
}

export default authMiddleware;