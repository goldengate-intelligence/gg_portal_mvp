import { Elysia, t } from "elysia";
import { db } from "../db";
import { users, userProfiles, userTenants, userRoles, roles, userOrganizations, organizations } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import argon2 from "argon2";
import { authMiddleware, requireAuth } from "../middleware/auth";
import { tenantMiddleware, requireTenant } from "../middleware/tenant";
import { rbacMiddleware, requirePermission } from "../middleware/rbac";

export const userRoutes = new Elysia({ prefix: "/users" })
  .use(authMiddleware())
  .use(tenantMiddleware({ strategy: "header", required: true }))
  .use(rbacMiddleware())
  
  // Get all users (admin only)
  .get("/", async ({ user, tenantId }) => {
    const usersList = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        isActive: users.isActive,
        isEmailVerified: users.isEmailVerified,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        role: userTenants.role,
        profileBio: userProfiles.bio,
        profileAvatarUrl: userProfiles.avatarUrl,
      })
      .from(users)
      .leftJoin(userTenants, eq(users.id, userTenants.userId))
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(userTenants.tenantId, tenantId))
      .orderBy(desc(users.createdAt));

    return { users: usersList };
  }, {
    beforeHandle: [requireAuth(), requireTenant(), requirePermission("users", "read")],
  })
  
  // Get single user
  .get("/:id", async ({ params: { id }, tenantId }) => {
    const [userInfo] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        isActive: users.isActive,
        isEmailVerified: users.isEmailVerified,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        role: userTenants.role,
        profile: {
          bio: userProfiles.bio,
          avatarUrl: userProfiles.avatarUrl,
          phone: userProfiles.phone,
          timezone: userProfiles.timezone,
          preferences: userProfiles.preferences,
        },
        organizations: userOrganizations.organizationId,
        organizationName: organizations.name,
      })
      .from(users)
      .leftJoin(userTenants, eq(users.id, userTenants.userId))
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .leftJoin(userOrganizations, eq(users.id, userOrganizations.userId))
      .leftJoin(organizations, eq(userOrganizations.organizationId, organizations.id))
      .where(and(eq(users.id, id), eq(userTenants.tenantId, tenantId)))
      .limit(1);

    if (!userInfo) {
      return { error: "User not found" };
    }

    // Get user roles
    const userRolesList = await db
      .select({
        roleName: roles.name,
        roleDescription: roles.description,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(eq(userRoles.userId, id), eq(userRoles.tenantId, tenantId)));

    return {
      user: {
        ...userInfo,
        roles: userRolesList,
      },
    };
  }, {
    params: t.Object({ id: t.String() }),
    beforeHandle: [requireAuth(), requireTenant(), requirePermission("users", "read")],
  })
  
  // Create new user (admin only)
  .post("/", async ({ body, tenantId, set }) => {
    try {
      const { email, username, password, fullName, role = "user", organizationId } = body;

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        set.status = 400;
        return { error: "User already exists" };
      }

      // Hash password
      const passwordHash = await argon2.hash(password);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          username,
          fullName,
          passwordHash,
        })
        .returning();

      // Add to tenant
      await db.insert(userTenants).values({
        userId: newUser.id,
        tenantId,
        role,
        isDefault: true,
      });

      // Create profile
      await db.insert(userProfiles).values({
        userId: newUser.id,
      });

      // Add to organization if specified
      if (organizationId) {
        await db.insert(userOrganizations).values({
          userId: newUser.id,
          organizationId,
          tenantId,
          role: "member",
          isPrimary: true,
        });
      }

      return {
        message: "User created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          fullName: newUser.fullName,
        },
      };
    } catch (error) {
      console.error("User creation error:", error);
      set.status = 500;
      return { error: "User creation failed" };
    }
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      username: t.String({ minLength: 3, maxLength: 50 }),
      password: t.String({ minLength: 8 }),
      fullName: t.Optional(t.String({ maxLength: 255 })),
      role: t.Optional(t.String()),
      organizationId: t.Optional(t.String()),
    }),
    beforeHandle: [requireAuth(), requireTenant(), requirePermission("users", "create")],
  })
  
  // Update user
  .patch("/:id", async ({ params: { id }, body, user, tenantId, set }) => {
    try {
      const { email, username, fullName, isActive, role } = body;
      
      // Check if user can update this user
      const canUpdateAny = user?.role === "admin" || user?.role === "org_admin";
      const isOwnProfile = user?.id === id;
      
      if (!canUpdateAny && !isOwnProfile) {
        set.status = 403;
        return { error: "Insufficient permissions" };
      }

      // Update user
      const updateData: any = {};
      if (email !== undefined) updateData.email = email;
      if (username !== undefined) updateData.username = username;
      if (fullName !== undefined) updateData.fullName = fullName;
      if (isActive !== undefined && canUpdateAny) updateData.isActive = isActive;
      updateData.updatedAt = new Date();

      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      // Update role if specified and user has permission
      if (role !== undefined && canUpdateAny) {
        await db
          .update(userTenants)
          .set({ role })
          .where(and(eq(userTenants.userId, id), eq(userTenants.tenantId, tenantId)));
      }

      return {
        message: "User updated successfully",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          isActive: updatedUser.isActive,
        },
      };
    } catch (error) {
      console.error("User update error:", error);
      set.status = 500;
      return { error: "User update failed" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      email: t.Optional(t.String({ format: "email" })),
      username: t.Optional(t.String({ minLength: 3, maxLength: 50 })),
      fullName: t.Optional(t.String({ maxLength: 255 })),
      isActive: t.Optional(t.Boolean()),
      role: t.Optional(t.String()),
    }),
    beforeHandle: [requireAuth(), requireTenant()],
  })
  
  // Update user profile
  .patch("/:id/profile", async ({ params: { id }, body, user, set }) => {
    try {
      // Check if user can update this profile
      const canUpdateAny = user?.role === "admin" || user?.role === "org_admin";
      const isOwnProfile = user?.id === id;
      
      if (!canUpdateAny && !isOwnProfile) {
        set.status = 403;
        return { error: "Insufficient permissions" };
      }

      const { bio, avatarUrl, phone, timezone, preferences } = body;

      const updateData: any = {};
      if (bio !== undefined) updateData.bio = bio;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
      if (phone !== undefined) updateData.phone = phone;
      if (timezone !== undefined) updateData.timezone = timezone;
      if (preferences !== undefined) updateData.preferences = preferences;
      updateData.updatedAt = new Date();

      await db
        .update(userProfiles)
        .set(updateData)
        .where(eq(userProfiles.userId, id));

      return { message: "Profile updated successfully" };
    } catch (error) {
      console.error("Profile update error:", error);
      set.status = 500;
      return { error: "Profile update failed" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      bio: t.Optional(t.String({ maxLength: 1000 })),
      avatarUrl: t.Optional(t.String()),
      phone: t.Optional(t.String({ maxLength: 50 })),
      timezone: t.Optional(t.String({ maxLength: 50 })),
      preferences: t.Optional(t.Record(t.String(), t.Any())),
    }),
    beforeHandle: [requireAuth(), requireTenant()],
  })
  
  // Delete user (admin only)
  .delete("/:id", async ({ params: { id }, tenantId, set }) => {
    try {
      // Soft delete - just deactivate the user
      await db
        .update(users)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(users.id, id));

      return { message: "User deleted successfully" };
    } catch (error) {
      console.error("User deletion error:", error);
      set.status = 500;
      return { error: "User deletion failed" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    beforeHandle: [requireAuth(), requireTenant(), requirePermission("users", "delete")],
  })
  
  // Change password
  .post("/:id/change-password", async ({ params: { id }, body, user, set }) => {
    try {
      // Check if user can change this password
      const canUpdateAny = user?.role === "admin";
      const isOwnProfile = user?.id === id;
      
      if (!canUpdateAny && !isOwnProfile) {
        set.status = 403;
        return { error: "Insufficient permissions" };
      }

      const { currentPassword, newPassword } = body;

      // Verify current password for own profile changes
      if (isOwnProfile && !canUpdateAny) {
        const [userRecord] = await db
          .select({ passwordHash: users.passwordHash })
          .from(users)
          .where(eq(users.id, id))
          .limit(1);

        if (!userRecord) {
          set.status = 404;
          return { error: "User not found" };
        }

        const isValidPassword = await argon2.verify(userRecord.passwordHash, currentPassword);
        if (!isValidPassword) {
          set.status = 400;
          return { error: "Current password is incorrect" };
        }
      }

      // Hash new password
      const passwordHash = await argon2.hash(newPassword);

      // Update password
      await db
        .update(users)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(users.id, id));

      return { message: "Password changed successfully" };
    } catch (error) {
      console.error("Password change error:", error);
      set.status = 500;
      return { error: "Password change failed" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      currentPassword: t.Optional(t.String()),
      newPassword: t.String({ minLength: 8 }),
    }),
    beforeHandle: [requireAuth(), requireTenant()],
  });

export default userRoutes;