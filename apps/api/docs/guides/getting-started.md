# Getting Started with GoldenGate API

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) or **Bun** runtime
- **PostgreSQL** (v14 or higher)
- **Git** for version control
- **Snowflake account** (optional, for data analytics features)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gg-mvp/apps/api
```

### 2. Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Using npm:
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the api directory:

```bash
cp .env.example .env
```

Configure the following environment variables:

```env
# Server Configuration
PORT=4001
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/goldengate
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=goldengate
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h

# Snowflake Configuration (Optional)
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_USERNAME=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=your_database
SNOWFLAKE_SCHEMA=PUBLIC
SNOWFLAKE_ROLE=PUBLIC

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Default Tenant Configuration
DEFAULT_TENANT_ID=658146d8-2572-4fdb-9cb3-350ddab5893a
DEFAULT_ORGANIZATION_ID=123e4567-e89b-12d3-a456-426614174000
```

### 4. Database Setup

#### Create the Database

```bash
createdb goldengate
```

#### Run Migrations

```bash
bun run db:generate
bun run db:migrate
```

#### Seed Initial Data (Optional)

```bash
bun run src/scripts/seed-db.ts
```

### 5. Setup Test User

Create a test user for development:

```bash
bun run src/scripts/setup-test-user.ts
```

This creates a user with:
- Email: `john@hedge.com`
- Password: `123123123`

## Running the Server

### Development Mode

```bash
bun run dev
```

The server will start at `http://localhost:4001` with hot-reloading enabled.

### Production Mode

```bash
bun run build
bun run start
```

## Verifying Installation

### 1. Check Server Health

```bash
curl http://localhost:4001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected",
  "environment": "development"
}
```

### 2. Access API Documentation

Open your browser and navigate to:
```
http://localhost:4001/docs
```

### 3. Test Authentication

Login with test credentials:

```bash
curl -X POST http://localhost:4001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@hedge.com",
    "password": "123123123"
  }'
```

You should receive a JWT token in the response.

## Project Structure

```
apps/api/
├── src/
│   ├── config/          # Configuration files
│   ├── db/              # Database models and migrations
│   │   ├── schema/      # Drizzle ORM schemas
│   │   └── migrations/  # Database migrations
│   ├── middleware/      # Express/Elysia middleware
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic services
│   ├── scripts/         # Utility scripts
│   └── index.ts         # Application entry point
├── docs/                # Documentation
├── tests/               # Test files
├── .env                 # Environment variables
├── .env.example         # Example environment file
├── drizzle.config.ts    # Drizzle ORM configuration
├── package.json         # Project dependencies
└── tsconfig.json        # TypeScript configuration
```

## Common Development Tasks

### Reset Database

```bash
bun run db:push   # Force push schema changes (destructive)
```

### Generate TypeScript Types from Schema

```bash
bun run db:generate
```

### View Database Studio

```bash
bun run db:studio
```

This opens Drizzle Studio at `https://local.drizzle.studio` for database management.

### Run Tests

```bash
bun test
```

### Lint Code

```bash
bun run lint
```

### Type Check

```bash
bun run typecheck
```

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running:
```bash
pg_isready
```

2. Check database exists:
```bash
psql -l | grep goldengate
```

3. Verify connection string in `.env`

### Port Already in Use

If port 4001 is already in use:

```bash
# Find process using port
lsof -i :4001

# Kill the process
kill -9 <PID>

# Or use a different port in .env
PORT=4002
```

### Snowflake Connection Issues

1. Verify Snowflake credentials in `.env`
2. Check network connectivity to Snowflake
3. Ensure your IP is whitelisted in Snowflake network policies

### Migration Issues

If migrations fail:

```bash
# Reset migrations
bun run db:push

# Re-run migrations
bun run db:migrate
```

## Next Steps

- [Understanding Authentication](./authentication.md)
- [API Reference](../api/README.md)
- [Database Schema](../schemas/README.md)
- [Deployment Guide](./deployment.md)

## Getting Help

- Check the [API Documentation](http://localhost:4001/docs)
- Review [Common Issues](./troubleshooting.md)
- Contact the development team

## Additional Resources

- [Elysia.js Documentation](https://elysiajs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Snowflake Documentation](https://docs.snowflake.com/)