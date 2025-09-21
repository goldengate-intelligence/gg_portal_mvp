import { z } from "zod";

const envSchema = z.object({
  // Server
  PORT: z.string().transform(Number).default("4001"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // Database - Individual parameters (preferred)
  DATABASE_HOST: z.string().default("localhost"),
  DATABASE_PORT: z.string().transform(Number).default("5432"),
  DATABASE_NAME: z.string().default("goldengate"),
  DATABASE_USER: z.string().default("postgres"),
  DATABASE_PASSWORD: z.string().default("postgres"),
  DATABASE_SSL: z.string().transform(v => v === "true").default("false"),
  DATABASE_MAX_CONNECTIONS: z.string().transform(Number).default("20"),

  // Database - Legacy URL format (optional fallback)
  DATABASE_URL: z.string().url().optional(),

  // JWT & OAuth
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("1h"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  
  // OAuth 2.0
  OAUTH_ISSUER: z.string().url().default("http://localhost:4001"),
  OAUTH_AUTHORIZATION_ENDPOINT: z.string().default("/oauth/authorize"),
  OAUTH_TOKEN_ENDPOINT: z.string().default("/oauth/token"),
  OAUTH_USERINFO_ENDPOINT: z.string().default("/oauth/userinfo"),
  OAUTH_JWKS_ENDPOINT: z.string().default("/.well-known/jwks.json"),

  // CORS
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3000,http://localhost:5173,http://localhost:3600,http://localhost:3601"),

  // Default tenant and organization
  DEFAULT_TENANT_ID: z.string().default("658146d8-2572-4fdb-9cb3-350ddab5893a"),
  DEFAULT_ORGANIZATION_ID: z.string().default("123e4567-e89b-12d3-a456-426614174000"),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // MCP Server
  MCP_PORT: z.string().transform(Number).default("3002"),
  MCP_TRANSPORT: z.string().default("stdio"),

  // Agent Taskflow (ATF)
  ATF_API_BASE_URL: z.string().url().optional(),
  ATF_API_KEY: z.string().optional(),
  ATF_WEBHOOK_SECRET: z.string().optional(),

  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default("12"),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default("100"),

  // Snowflake
  SNOWFLAKE_ACCOUNT: z.string().optional(),
  SNOWFLAKE_USERNAME: z.string().optional(),
  SNOWFLAKE_PASSWORD: z.string().optional(),
  SNOWFLAKE_DATABASE: z.string().optional(),
  SNOWFLAKE_WAREHOUSE: z.string().optional(),
  SNOWFLAKE_SCHEMA: z.string().default("PUBLIC"),
  SNOWFLAKE_ROLE: z.string().optional(),
  SNOWFLAKE_TIMEOUT: z.string().transform(Number).default("60000"),
  SNOWFLAKE_MAX_ROWS: z.string().transform(Number).default("10000"),

  // Logging
  LOG_LEVEL: z.string().default("info"),
  LOG_FORMAT: z.string().default("json"),
});

const rawConfig = envSchema.parse(process.env);

export const config = {
  env: rawConfig.NODE_ENV,
  port: rawConfig.PORT,
  
  database: {
    host: rawConfig.DATABASE_HOST,
    port: rawConfig.DATABASE_PORT,
    name: rawConfig.DATABASE_NAME,
    user: rawConfig.DATABASE_USER,
    password: rawConfig.DATABASE_PASSWORD,
    ssl: rawConfig.DATABASE_SSL,
    maxConnections: rawConfig.DATABASE_MAX_CONNECTIONS,
    url: rawConfig.DATABASE_URL, // fallback for legacy usage
  },
  
  jwt: {
    secret: rawConfig.JWT_SECRET,
    expiresIn: rawConfig.JWT_EXPIRES_IN,
    refreshExpiresIn: rawConfig.JWT_REFRESH_EXPIRES_IN,
  },
  
  oauth: {
    issuer: rawConfig.OAUTH_ISSUER,
    endpoints: {
      authorization: rawConfig.OAUTH_AUTHORIZATION_ENDPOINT,
      token: rawConfig.OAUTH_TOKEN_ENDPOINT,
      userinfo: rawConfig.OAUTH_USERINFO_ENDPOINT,
      jwks: rawConfig.OAUTH_JWKS_ENDPOINT,
    },
  },
  
  cors: {
    allowedOrigins: rawConfig.CORS_ALLOWED_ORIGINS.split(",").map(origin => origin.trim()),
  },
  
  defaults: {
    tenantId: rawConfig.DEFAULT_TENANT_ID,
    organizationId: rawConfig.DEFAULT_ORGANIZATION_ID,
  },
  
  redis: {
    url: rawConfig.REDIS_URL,
  },
  
  mcp: {
    port: rawConfig.MCP_PORT,
    transport: rawConfig.MCP_TRANSPORT,
  },
  
  atf: {
    apiBaseUrl: rawConfig.ATF_API_BASE_URL,
    apiKey: rawConfig.ATF_API_KEY,
    webhookSecret: rawConfig.ATF_WEBHOOK_SECRET,
  },
  
  security: {
    bcryptRounds: rawConfig.BCRYPT_ROUNDS,
    rateLimit: {
      windowMs: rawConfig.RATE_LIMIT_WINDOW_MS,
      maxRequests: rawConfig.RATE_LIMIT_MAX_REQUESTS,
    },
  },

  snowflake: {
    account: rawConfig.SNOWFLAKE_ACCOUNT,
    username: rawConfig.SNOWFLAKE_USERNAME,
    password: rawConfig.SNOWFLAKE_PASSWORD,
    database: rawConfig.SNOWFLAKE_DATABASE,
    warehouse: rawConfig.SNOWFLAKE_WAREHOUSE,
    schema: rawConfig.SNOWFLAKE_SCHEMA,
    role: rawConfig.SNOWFLAKE_ROLE,
    timeout: rawConfig.SNOWFLAKE_TIMEOUT,
    maxRows: rawConfig.SNOWFLAKE_MAX_ROWS,
  },
  
  logging: {
    level: rawConfig.LOG_LEVEL,
    format: rawConfig.LOG_FORMAT,
  },
};

export const isDevelopment = config.env === "development";
export const isProduction = config.env === "production";
export const isTest = config.env === "test";

// Validate required production environment variables
if (isProduction) {
  const requiredProdVars = [
    { key: 'JWT_SECRET', value: config.jwt.secret },
    { key: 'OAUTH_ISSUER', value: config.oauth.issuer },
  ];
  
  for (const { key, value } of requiredProdVars) {
    if (!value) {
      throw new Error(`Missing required production environment variable: ${key}`);
    }
  }
}