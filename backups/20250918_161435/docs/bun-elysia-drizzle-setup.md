# Complete Bun + Elysia + PostgreSQL + Drizzle Setup

## Project Structure

```
my-api/
├── src/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── users.ts         # User table schema
│   │   │   ├── posts.ts         # Posts table schema
│   │   │   ├── teams.ts         # Teams table schema
│   │   │   └── index.ts         # Export all schemas
│   │   ├── migrations/
│   │   │   └── .gitkeep
│   │   ├── seeds/
│   │   │   ├── users.seed.ts    # User seed data
│   │   │   └── index.ts         # Seed runner
│   │   ├── index.ts             # Database connection
│   │   └── migrate.ts           # Migration runner
│   ├── modules/
│   │   ├── users/
│   │   │   ├── users.routes.ts  # User routes
│   │   │   ├── users.service.ts # Business logic
│   │   │   └── users.dto.ts     # Validation schemas
│   │   ├── posts/
│   │   │   ├── posts.routes.ts
│   │   │   ├── posts.service.ts
│   │   │   └── posts.dto.ts
│   │   └── auth/
│   │       ├── auth.routes.ts
│   │       ├── auth.service.ts
│   │       └── auth.middleware.ts
│   ├── lib/
│   │   ├── errors.ts            # Custom error classes
│   │   └── utils.ts             # Utility functions
│   ├── config/
│   │   └── index.ts             # Configuration management
│   └── index.ts                 # Main application entry
├── drizzle/
│   └── migrations/              # Generated migrations
├── .env
├── .env.example
├── docker-compose.yml
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 1. Initial Setup

### package.json
```json
{
  "name": "my-api",
  "version": "1.0.0",
  "module": "src/index.ts",
  "type": "module",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "start": "bun run src/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "bun run src/db/migrate.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "bun run src/db/seeds/index.ts",
    "test": "bun test",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "elysia": "^1.0.0",
    "@elysiajs/cors": "^1.0.0",
    "@elysiajs/swagger": "^1.0.0",
    "@elysiajs/jwt": "^1.0.0",
    "drizzle-orm": "^0.29.0",
    "postgres": "^3.4.0",
    "zod": "^3.22.0",
    "argon2": "^0.31.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "drizzle-kit": "^0.20.0",
    "typescript": "^5.3.0"
  }
}
```

### .env
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/myapp
DATABASE_POOL_MAX=10

# Application
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# API
API_VERSION=v1
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@db/*": ["./src/db/*"],
      "@modules/*": ["./src/modules/*"]
    },
    "types": ["bun-types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## 2. Database Configuration

### drizzle.config.ts
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### src/config/index.ts
```typescript
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MAX: z.string().transform(Number).default("10"),
  PORT: z.string().transform(Number).default("3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JWT_SECRET: z.string().min(32),
  API_VERSION: z.string().default("v1"),
});

export const config = envSchema.parse(process.env);

export const isDevelopment = config.NODE_ENV === "development";
export const isProduction = config.NODE_ENV === "production";
```

## 3. Database Schema

### src/db/schema/users.ts
```typescript
import { pgTable, uuid, varchar, text, timestamp, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { posts } from "./posts";
import { usersToTeams } from "./teams";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }),
  passwordHash: text("password_hash").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").default(true).notNull(),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  emailVerifiedAt: timestamp("email_verified_at"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    emailIdx: index("email_idx").on(table.email),
    usernameIdx: index("username_idx").on(table.username),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  };
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  usersToTeams: many(usersToTeams),
}));

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### src/db/schema/posts.ts
```typescript
import { pgTable, uuid, varchar, text, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content"),
  excerpt: text("excerpt"),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20, enum: ["draft", "published", "archived"] }).default("draft").notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    authorIdx: index("author_idx").on(table.authorId),
    slugIdx: uniqueIndex("slug_idx").on(table.slug),
    statusIdx: index("status_idx").on(table.status),
    publishedAtIdx: index("published_at_idx").on(table.publishedAt),
  };
});

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

### src/db/schema/teams.ts
```typescript
import { pgTable, uuid, varchar, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Junction table for many-to-many relationship
export const usersToTeams = pgTable("users_to_teams", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50, enum: ["owner", "admin", "member"] }).default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.teamId] }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  usersToTeams: many(usersToTeams),
}));

export const usersToTeamsRelations = relations(usersToTeams, ({ one }) => ({
  user: one(users, {
    fields: [usersToTeams.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [usersToTeams.teamId],
    references: [teams.id],
  }),
}));

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type UserToTeam = typeof usersToTeams.$inferSelect;
```

### src/db/schema/index.ts
```typescript
// Central export for all schemas
export * from "./users";
export * from "./posts";
export * from "./teams";
```

## 4. Database Connection

### src/db/index.ts
```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { config } from "@/config";

// Create postgres connection
const client = postgres(config.DATABASE_URL, {
  max: config.DATABASE_POOL_MAX,
  onnotice: () => {}, // Silence notices in production
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Export schema for use in other files
export { schema };

// Type for transactions
export type Database = typeof db;
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
```

## 5. Migration Management

### src/db/migrate.ts
```typescript
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "@/config";

async function runMigrations() {
  console.log("🔄 Running migrations...");
  
  const migrationClient = postgres(config.DATABASE_URL, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    await migrate(db, { migrationsFolder: "./drizzle/migrations" });
    console.log("✅ Migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runMigrations();
```

## 6. Seed Data

### src/db/seeds/users.seed.ts
```typescript
import { db } from "@/db";
import { users, posts, teams, usersToTeams } from "@/db/schema";
import { hash } from "argon2";

export async function seedUsers() {
  console.log("🌱 Seeding users...");

  // Create users
  const hashedPassword = await hash("password123");
  
  const [user1, user2, user3] = await db
    .insert(users)
    .values([
      {
        email: "john@example.com",
        username: "johndoe",
        fullName: "John Doe",
        passwordHash: hashedPassword,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
      {
        email: "jane@example.com",
        username: "janesmith",
        fullName: "Jane Smith",
        passwordHash: hashedPassword,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
      {
        email: "bob@example.com",
        username: "bobwilson",
        fullName: "Bob Wilson",
        passwordHash: hashedPassword,
      },
    ])
    .returning();

  console.log(`✅ Created ${3} users`);

  // Create teams
  const [team1, team2] = await db
    .insert(teams)
    .values([
      {
        name: "Engineering Team",
        slug: "engineering",
        description: "The engineering team builds amazing products",
      },
      {
        name: "Marketing Team",
        slug: "marketing",
        description: "The marketing team promotes our products",
      },
    ])
    .returning();

  console.log(`✅ Created ${2} teams`);

  // Add users to teams
  await db.insert(usersToTeams).values([
    { userId: user1.id, teamId: team1.id, role: "owner" },
    { userId: user2.id, teamId: team1.id, role: "admin" },
    { userId: user3.id, teamId: team1.id, role: "member" },
    { userId: user2.id, teamId: team2.id, role: "owner" },
  ]);

  console.log("✅ Added users to teams");

  // Create posts
  await db.insert(posts).values([
    {
      title: "Getting Started with Drizzle ORM",
      slug: "getting-started-drizzle",
      content: "Drizzle ORM is a TypeScript ORM that's lightweight and performant...",
      excerpt: "Learn how to use Drizzle ORM with Bun",
      authorId: user1.id,
      status: "published",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: "Building APIs with Elysia",
      slug: "building-apis-elysia",
      content: "Elysia is a fast and friendly Bun web framework...",
      excerpt: "Discover the power of Elysia",
      authorId: user2.id,
      status: "published",
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: "Draft Post",
      slug: "draft-post",
      content: "This is a draft post...",
      authorId: user1.id,
      status: "draft",
    },
  ]);

  console.log("✅ Created posts");
}
```

### src/db/seeds/index.ts
```typescript
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { seedUsers } from "./users.seed";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data (be careful in production!)
    if (process.env.NODE_ENV === "development") {
      console.log("🧹 Clearing existing data...");
      await db.execute(sql`TRUNCATE TABLE users_to_teams, posts, teams, users CASCADE`);
    }

    // Run seeds
    await seedUsers();

    console.log("✅ Database seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
```

## 7. DTOs and Validation

### src/modules/users/users.dto.ts
```typescript
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  fullName: z.string().optional(),
  bio: z.string().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).max(50).optional(),
  fullName: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
```

## 8. Service Layer

### src/modules/users/users.service.ts
```typescript
import { db, schema } from "@/db";
import { eq, desc, and, or, like } from "drizzle-orm";
import { hash, verify } from "argon2";
import type { CreateUserDTO, UpdateUserDTO } from "./users.dto";

export class UserService {
  async findAll(limit = 10, offset = 0) {
    return await db
      .select()
      .from(schema.users)
      .orderBy(desc(schema.users.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async findById(id: string) {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    
    return user;
  }

  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));
    
    return user;
  }

  async findWithPosts(userId: string) {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      with: {
        posts: {
          orderBy: desc(schema.posts.createdAt),
        },
      },
    });
  }

  async findWithTeams(userId: string) {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      with: {
        usersToTeams: {
          with: {
            team: true,
          },
        },
      },
    });
  }

  async create(data: CreateUserDTO) {
    const hashedPassword = await hash(data.password);
    
    const [user] = await db
      .insert(schema.users)
      .values({
        ...data,
        passwordHash: hashedPassword,
      })
      .returning({
        id: schema.users.id,
        email: schema.users.email,
        username: schema.users.username,
        fullName: schema.users.fullName,
        createdAt: schema.users.createdAt,
      });
    
    return user;
  }

  async update(id: string, data: UpdateUserDTO) {
    const [user] = await db
      .update(schema.users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, id))
      .returning();
    
    return user;
  }

  async delete(id: string) {
    const [deleted] = await db
      .delete(schema.users)
      .where(eq(schema.users.id, id))
      .returning({ id: schema.users.id });
    
    return deleted;
  }

  async verifyPassword(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValid = await verify(user.passwordHash, password);
    if (!isValid) return null;

    // Update last login
    await db
      .update(schema.users)
      .set({ lastLoginAt: new Date() })
      .where(eq(schema.users.id, user.id));

    return user;
  }

  async search(query: string) {
    return await db
      .select()
      .from(schema.users)
      .where(
        or(
          like(schema.users.email, `%${query}%`),
          like(schema.users.username, `%${query}%`),
          like(schema.users.fullName, `%${query}%`)
        )
      );
  }
}

export const userService = new UserService();
```

## 9. Routes

### src/modules/users/users.routes.ts
```typescript
import { Elysia, t } from "elysia";
import { userService } from "./users.service";
import { createUserSchema, updateUserSchema } from "./users.dto";

export const userRoutes = new Elysia({ prefix: "/users" })
  .get("/", async ({ query }) => {
    const { limit = 10, offset = 0 } = query;
    const users = await userService.findAll(limit, offset);
    return { data: users };
  }, {
    query: t.Object({
      limit: t.Optional(t.Number()),
      offset: t.Optional(t.Number()),
    }),
  })
  
  .get("/:id", async ({ params: { id } }) => {
    const user = await userService.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return { data: user };
  })
  
  .get("/:id/posts", async ({ params: { id } }) => {
    const userWithPosts = await userService.findWithPosts(id);
    if (!userWithPosts) {
      throw new Error("User not found");
    }
    return { data: userWithPosts };
  })
  
  .get("/:id/teams", async ({ params: { id } }) => {
    const userWithTeams = await userService.findWithTeams(id);
    if (!userWithTeams) {
      throw new Error("User not found");
    }
    return { data: userWithTeams };
  })
  
  .post("/", async ({ body }) => {
    const validated = createUserSchema.parse(body);
    const user = await userService.create(validated);
    return { data: user, message: "User created successfully" };
  })
  
  .patch("/:id", async ({ params: { id }, body }) => {
    const validated = updateUserSchema.parse(body);
    const user = await userService.update(id, validated);
    if (!user) {
      throw new Error("User not found");
    }
    return { data: user, message: "User updated successfully" };
  })
  
  .delete("/:id", async ({ params: { id } }) => {
    const deleted = await userService.delete(id);
    if (!deleted) {
      throw new Error("User not found");
    }
    return { message: "User deleted successfully" };
  })
  
  .get("/search", async ({ query }) => {
    const { q } = query;
    if (!q) {
      return { data: [] };
    }
    const users = await userService.search(q);
    return { data: users };
  }, {
    query: t.Object({
      q: t.String(),
    }),
  });
```

## 10. Main Application

### src/index.ts
```typescript
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { config } from "./config";
import { userRoutes } from "./modules/users/users.routes";
// Import other route modules

const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "My API Documentation",
          version: "1.0.0",
        },
      },
    })
  )
  .use(cors())
  
  // Global error handler
  .onError(({ code, error, set }) => {
    console.error(error);
    
    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "Validation Error", message: error.message };
    }
    
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Not Found", message: error.message };
    }
    
    set.status = 500;
    return { error: "Internal Server Error", message: error.message };
  })
  
  // Health check
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  
  // API versioning
  .group(`/api/${config.API_VERSION}`, (app) => 
    app
      .use(userRoutes)
      // .use(postRoutes)
      // .use(authRoutes)
  )
  
  .listen(config.PORT);

console.log(
  `🦊 Elysia is running at http://localhost:${app.server?.port}/swagger`
);
```

## 11. Docker Compose for Development

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: myapp-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql # Optional: initial SQL
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Optional: pgAdmin for database management
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: myapp-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

## 12. Commands Reference

```bash
# Install dependencies
bun install

# Start PostgreSQL (Docker)
docker-compose up -d postgres

# Generate migrations (after schema changes)
bun run db:generate

# Run migrations
bun run db:migrate

# Push schema directly (development only)
bun run db:push

# Seed database
bun run db:seed

# Start Drizzle Studio (DB GUI)
bun run db:studio

# Start development server
bun run dev

# Run tests
bun test

# Type checking
bun run typecheck
```

## 13. Advanced Patterns

### Transaction Example
```typescript
async function transferFunds(fromUserId: string, toUserId: string, amount: number) {
  return await db.transaction(async (tx) => {
    // Deduct from sender
    await tx
      .update(schema.accounts)
      .set({ balance: sql`balance - ${amount}` })
      .where(eq(schema.accounts.userId, fromUserId));
    
    // Add to receiver
    await tx
      .update(schema.accounts)
      .set({ balance: sql`balance + ${amount}` })
      .where(eq(schema.accounts.userId, toUserId));
    
    // Log transaction
    await tx.insert(schema.transactions).values({
      fromUserId,
      toUserId,
      amount,
      type: "transfer",
    });
  });
}
```

### Complex Queries with Joins
```typescript
async function getPostsWithAuthors() {
  return await db
    .select({
      id: schema.posts.id,
      title: schema.posts.title,
      content: schema.posts.content,
      author: {
        id: schema.users.id,
        name: schema.users.fullName,
        email: schema.users.email,
      },
    })
    .from(schema.posts)
    .leftJoin(schema.users, eq(schema.posts.authorId, schema.users.id))
    .where(eq(schema.posts.isPublished, true))
    .orderBy(desc(schema.posts.publishedAt));
}
```

### Pagination Helper
```typescript
export async function paginate<T>(
  query: any,
  page: number = 1,
  limit: number = 10
) {
  const offset = (page - 1) * limit;
  
  const [data, [{ count }]] = await Promise.all([
    query.limit(limit).offset(offset),
    db.select({ count: sql`count(*)` }).from(query.as("subquery")),
  ]);
  
  return {
    data,
    meta: {
      page,
      limit,
      total: Number(count),
      totalPages: Math.ceil(Number(count) / limit),
    },
  };
}
```

## 14. Production Deployment Tips

1. **Environment Variables**: Use a service like AWS Secrets Manager or HashiCorp Vault
2. **Connection Pooling**: Configure based on your server capacity
3. **Migrations**: Run migrations as part of your CI/CD pipeline
4. **Monitoring**: Add application monitoring (e.g., Sentry, DataDog)
5. **Database Backups**: Set up automated backups
6. **SSL**: Always use SSL connections in production
7. **Rate Limiting**: Add rate limiting middleware
8. **Caching**: Consider Redis for caching frequently accessed data

## 15. Testing Setup

### src/modules/users/users.test.ts
```typescript
import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { db } from "@/db";
import { userService } from "./users.service";

describe("User Service", () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    // Cleanup
  });

  test("should create a user", async () => {
    const user = await userService.create({
      email: "test@example.com",
      username: "testuser",
      password: "password123",
    });

    expect(user).toBeDefined();
    expect(user.email).toBe("test@example.com");
  });

  test("should find user by email", async () => {
    const user = await userService.findByEmail("test@example.com");
    expect(user).toBeDefined();
  });
});
```

This setup provides a production-ready foundation with proper separation of concerns, type safety, and scalability in mind.