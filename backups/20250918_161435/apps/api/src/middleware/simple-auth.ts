import { Elysia } from "elysia";
import { jwtVerify } from "jose";
import { db } from "../db";
import { users, userTenants, userOrganizations } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { config } from "../config";

const jwtSecret = new TextEncoder().encode(config.jwt.secret);

// Simple auth middleware that actually works with contractor-lists
export const simpleAuthMiddleware = () =>
  new Elysia({ name: "simple-auth" })
    .derive(async ({ request }) => {
      console.log('🚀 SIMPLE AUTH MIDDLEWARE CALLED');
      const authHeader = request.headers.get("authorization");
      console.log('🚀 Auth header:', authHeader?.substring(0, 30) + '...');
      
      if (!authHeader?.startsWith("Bearer ")) {
        console.log('🚀 No valid auth header');
        return { user: null, userId: null };
      }

      const token = authHeader.replace("Bearer ", "");
      
      try {
        // Verify JWT using jose (same as /auth/me endpoint)
        const { payload } = await jwtVerify(token, jwtSecret);
        const userId = payload.sub as string;
        
        console.log('🚀 JWT verified, userId:', userId);
        
        // Get user from database
        const result = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.fullName,
            username: users.username,
            role: userTenants.role,
            tenantId: userTenants.tenantId,
            organizationId: userOrganizations.organizationId,
          })
          .from(users)
          .leftJoin(userTenants, eq(users.id, userTenants.userId))
          .leftJoin(userOrganizations, eq(users.id, userOrganizations.userId))
          .where(and(
            eq(users.id, userId),
            eq(users.isActive, true)
          ))
          .limit(1);

        const user = result[0];
        
        if (!user) {
          console.log('🚀 User not found in database');
          return { user: null, userId: null };
        }
        
        console.log('🚀 User authenticated:', user.email);
        
        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name || user.username || '',
            role: user.role || 'member',
            tenantId: user.tenantId || '',
            organizationId: user.organizationId || null,
          },
          userId: user.id,
        };
      } catch (error) {
        console.log('🚀 JWT verification failed:', error);
        return { user: null, userId: null };
      }
    });

// Simple require auth middleware
export const simpleRequireAuth = () =>
  new Elysia({ name: "simple-require-auth" })
    .derive(({ user }) => {
      console.log('🔒 Simple require auth - user:', user?.id);
      if (!user) {
        throw new Error("Authentication required");
      }
      return { user };
    });