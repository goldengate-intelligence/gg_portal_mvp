import { Elysia, t } from "elysia";
import { db } from "../db";
import { users, userTenants, userOrganizations, userSessions, oauthClients, oauthAuthorizationCodes, oauthAccessTokens, oauthRefreshTokens, tenants, organizations } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { nanoid } from "nanoid";
import argon2 from "argon2";
import { config } from "../config";

const jwtSecret = new TextEncoder().encode(config.jwt.secret);

// OAuth 2.0 and Authentication Routes
export const authRoutes = new Elysia({ prefix: "/auth" })
  
  // User Registration
  .post("/register", async ({ body, set }) => {
    try {
      const { email, username, password, fullName, companyName } = body;

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        set.status = 409;
        return { 
          error: "User already exists",
          message: "An account with this email address already exists. Please login or use a different email."
        };
      }

      // Hash password
      const passwordHash = await argon2.hash(password);

      // Start a transaction to ensure all entities are created together
      const result = await db.transaction(async (tx) => {
        // Create user
        const [newUser] = await tx
          .insert(users)
          .values({
            email,
            username,
            fullName,
            passwordHash,
          })
          .returning();

        // Create a new tenant for the user
        // Generate a unique slug from the email or company name
        const baseSlug = companyName 
          ? companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim()
          : email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        // Ensure slug is unique by adding random suffix if needed
        const tenantSlug = `${baseSlug}-${nanoid(6)}`;
        
        const [newTenant] = await tx
          .insert(tenants)
          .values({
            slug: tenantSlug,
            name: companyName || `${fullName || username}'s Workspace`,
            plan: "trial", // Start with trial plan
            status: "active",
            maxUsers: 5,
            maxOrganizations: 100,
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
            settings: {},
          })
          .returning();

        // Create a default organization for the tenant
        const [newOrganization] = await tx
          .insert(organizations)
          .values({
            tenantId: newTenant.id,
            name: companyName || `${fullName || username}'s Organization`,
            status: "active",
            lifecycleStage: "initial",
          })
          .returning();

        // Add user to tenant with admin role (since they're creating it)
        await tx.insert(userTenants).values({
          userId: newUser.id,
          tenantId: newTenant.id,
          role: "admin", // Admin role since they created the tenant
          isDefault: true,
        });

        // Add user to organization with owner role
        await tx.insert(userOrganizations).values({
          userId: newUser.id,
          organizationId: newOrganization.id,
          tenantId: newTenant.id,
          role: "owner", // Owner role since they created the organization
          isPrimary: true,
        });

        return {
          user: newUser,
          tenant: newTenant,
          organization: newOrganization,
        };
      });

      // Get user with tenant and organization info for response
      const userWithDetails = await db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          fullName: users.fullName,
          tenantId: userTenants.tenantId,
          tenantName: tenants.name,
          role: userTenants.role,
          organizationId: userOrganizations.organizationId,
          organizationName: organizations.name,
        })
        .from(users)
        .leftJoin(userTenants, eq(users.id, userTenants.userId))
        .leftJoin(tenants, eq(userTenants.tenantId, tenants.id))
        .leftJoin(userOrganizations, eq(users.id, userOrganizations.userId))
        .leftJoin(organizations, eq(userOrganizations.organizationId, organizations.id))
        .where(eq(users.id, result.user.id))
        .limit(1);

      return {
        message: "User registered successfully",
        user: userWithDetails[0],
      };
    } catch (error) {
      console.error("Registration error:", error);
      set.status = 500;
      return { error: "Registration failed", details: error.message };
    }
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      username: t.String({ minLength: 3, maxLength: 50 }),
      password: t.String({ minLength: 8 }),
      fullName: t.Optional(t.String({ maxLength: 255 })),
      companyName: t.Optional(t.String({ maxLength: 255 })),
    }),
  })

  // User Login
  .post("/login", async ({ body, set }) => {
    try {
      const { email, password } = body;

      // Find user
      const [user] = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email), eq(users.isActive, true)))
        .limit(1);

      if (!user) {
        set.status = 401;
        return { error: "Invalid credentials" };
      }

      // Verify password
      const isValidPassword = await argon2.verify(user.passwordHash, password);
      if (!isValidPassword) {
        set.status = 401;
        return { error: "Invalid credentials" };
      }

      // Create session
      const sessionToken = nanoid(32);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const [session] = await db
        .insert(userSessions)
        .values({
          userId: user.id,
          sessionToken,
          expiresAt,
        })
        .returning();

      // Create JWT
      const jwt = await new SignJWT({
        sub: user.id,
        sessionId: session.id,
        email: user.email,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(config.jwt.expiresIn)
        .setIssuer(config.oauth.issuer)
        .sign(jwtSecret);

      // Update last login
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      // Get user details with tenant and organization info (use leftJoin for optional relations)
      const userDetails = await db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          fullName: users.fullName,
          tenantId: userTenants.tenantId,
          role: userTenants.role,
          organizationId: userOrganizations.organizationId,
        })
        .from(users)
        .leftJoin(userTenants, eq(users.id, userTenants.userId))
        .leftJoin(userOrganizations, eq(users.id, userOrganizations.userId))
        .where(eq(users.id, user.id))
        .limit(1);

      return {
        access_token: jwt,
        token_type: "Bearer",
        expires_in: 3600,
        user: userDetails[0] || {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          tenantId: null,
          role: null,
          organizationId: null,
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      set.status = 500;
      return { error: "Login failed" };
    }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  })

  // OAuth 2.0 Authorization Endpoint
  .get("/oauth/authorize", async ({ query, set }) => {
    try {
      const {
        client_id,
        redirect_uri,
        response_type,
        scope = "openid profile email",
        state,
        code_challenge,
        code_challenge_method = "S256"
      } = query;

      // Validate client
      const [client] = await db
        .select()
        .from(oauthClients)
        .where(eq(oauthClients.clientId, client_id))
        .limit(1);

      if (!client) {
        set.status = 400;
        return { error: "invalid_client" };
      }

      // Validate redirect URI
      const allowedRedirectUris = client.redirectUris as string[];
      if (!allowedRedirectUris.includes(redirect_uri)) {
        set.status = 400;
        return { error: "invalid_redirect_uri" };
      }

      // For now, return authorization parameters for frontend handling
      return {
        client_id,
        redirect_uri,
        response_type,
        scope,
        state,
        code_challenge,
        code_challenge_method,
        authorize_url: `${config.oauth.issuer}/auth/login?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}`,
      };
    } catch (error) {
      console.error("Authorization error:", error);
      set.status = 500;
      return { error: "server_error" };
    }
  }, {
    query: t.Object({
      client_id: t.String(),
      redirect_uri: t.String(),
      response_type: t.String(),
      scope: t.Optional(t.String()),
      state: t.Optional(t.String()),
      code_challenge: t.Optional(t.String()),
      code_challenge_method: t.Optional(t.String()),
    }),
  })

  // OAuth 2.0 Token Endpoint
  .post("/oauth/token", async ({ body, set }) => {
    try {
      const { grant_type, code, client_id, client_secret, redirect_uri, code_verifier } = body;

      if (grant_type === "authorization_code") {
        // Validate client credentials
        const [client] = await db
          .select()
          .from(oauthClients)
          .where(and(
            eq(oauthClients.clientId, client_id),
            eq(oauthClients.clientSecret, client_secret)
          ))
          .limit(1);

        if (!client) {
          set.status = 401;
          return { error: "invalid_client" };
        }

        // Find and validate authorization code
        const [authCode] = await db
          .select()
          .from(oauthAuthorizationCodes)
          .where(and(
            eq(oauthAuthorizationCodes.code, code),
            eq(oauthAuthorizationCodes.clientId, client.id)
          ))
          .limit(1);

        if (!authCode || authCode.usedAt || new Date() > authCode.expiresAt) {
          set.status = 400;
          return { error: "invalid_grant" };
        }

        // Mark code as used
        await db
          .update(oauthAuthorizationCodes)
          .set({ usedAt: new Date() })
          .where(eq(oauthAuthorizationCodes.id, authCode.id));

        // Create access token
        const accessToken = nanoid(32);
        const refreshToken = nanoid(32);
        const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

        const [token] = await db
          .insert(oauthAccessTokens)
          .values({
            token: accessToken,
            clientId: client.id,
            userId: authCode.userId,
            scopes: authCode.scopes,
            expiresAt,
          })
          .returning();

        await db.insert(oauthRefreshTokens).values({
          token: refreshToken,
          accessTokenId: token.id,
          clientId: client.id,
          userId: authCode.userId,
          scopes: authCode.scopes,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        return {
          access_token: accessToken,
          token_type: "Bearer",
          expires_in: 3600,
          refresh_token: refreshToken,
          scope: (authCode.scopes as string[]).join(" "),
        };
      }

      set.status = 400;
      return { error: "unsupported_grant_type" };
    } catch (error) {
      console.error("Token error:", error);
      set.status = 500;
      return { error: "server_error" };
    }
  }, {
    body: t.Object({
      grant_type: t.String(),
      code: t.Optional(t.String()),
      client_id: t.String(),
      client_secret: t.String(),
      redirect_uri: t.Optional(t.String()),
      code_verifier: t.Optional(t.String()),
    }),
  })

  // Get current user info
  .get("/me", async ({ headers, set }) => {
    try {
      const authHeader = headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const token = authHeader.replace("Bearer ", "");
      
      // Verify JWT
      const { payload } = await jwtVerify(token, jwtSecret);
      const userId = payload.sub as string;

      // Get user with tenant and organization information
      const user = await db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          fullName: users.fullName,
          isActive: users.isActive,
          tenantRole: userTenants.role,
          tenantId: userTenants.tenantId,
          organizationId: userOrganizations.organizationId,
        })
        .from(users)
        .leftJoin(userTenants, eq(users.id, userTenants.userId))
        .leftJoin(userOrganizations, eq(users.id, userOrganizations.userId))
        .where(eq(users.id, userId))
        .limit(1);

      if (!user[0] || !user[0].isActive) {
        set.status = 401;
        return { error: "User not found or inactive" };
      }

      return {
        id: user[0].id,
        email: user[0].email,
        username: user[0].username,
        fullName: user[0].fullName,
        tenantId: user[0].tenantId,
        organizationId: user[0].organizationId,
        role: user[0].tenantRole,
      };
    } catch (error) {
      console.error("User info error:", error);
      set.status = 401;
      return { error: "Invalid token" };
    }
  })

  // Logout
  .post("/logout", async ({ headers, set }) => {
    try {
      const authHeader = headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const token = authHeader.replace("Bearer ", "");
      
      // Verify JWT and get session
      const { payload } = await jwtVerify(token, jwtSecret);
      const sessionId = payload.sessionId as string;

      if (sessionId) {
        // Invalidate session
        await db
          .update(userSessions)
          .set({ expiresAt: new Date() })
          .where(eq(userSessions.id, sessionId));
      }

      return { message: "Logged out successfully" };
    } catch (error) {
      console.error("Logout error:", error);
      return { message: "Logged out" }; // Return success even if token is invalid
    }
  });

export default authRoutes;