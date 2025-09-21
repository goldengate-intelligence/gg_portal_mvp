# Production Dockerfile for GoldenGate API
# Using Bun runtime with Elysia framework

FROM oven/bun:1-alpine AS base

# Install dependencies for production
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install production dependencies only
RUN bun install --frozen-lockfile --production

# Build stage
FROM base AS builder
WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Drizzle migrations if needed
RUN bun run db:generate || true

# Build the application (if there's a build step)
# RUN bun run build

# Production stage
FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install PostgreSQL client for migrations
RUN apk add --no-cache postgresql-client

# Copy production dependencies
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs package.json ./
COPY --chown=nodejs:nodejs drizzle.config.ts ./
COPY --chown=nodejs:nodejs tsconfig.json ./
COPY --chown=nodejs:nodejs src ./src
COPY --chown=nodejs:nodejs drizzle ./drizzle

# Create necessary directories
RUN mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app/logs

# Set environment to production
ENV NODE_ENV=production

# Switch to non-root user
USER nodejs

# Expose the port the app runs on
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4001/health || exit 1

# Start the application
CMD ["bun", "run", "src/index.ts"]