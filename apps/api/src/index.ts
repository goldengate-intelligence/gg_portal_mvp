import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { config } from "./config";
import { checkDatabaseHealth, closeDatabaseConnection } from "./db";
import { apiRoutes } from "./routes";

const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: 'GoldenGate API',
          version: '1.0.0',
          description: 'Federal Contractor Intelligence Platform API',
          contact: {
            name: 'GoldenGate Team',
            email: 'support@goldengate.com'
          }
        },
        tags: [
          { name: 'auth', description: 'Authentication endpoints' },
          { name: 'contractor-lists', description: 'Portfolio and favorites management' },
          { name: 'contractor-profiles', description: 'Contractor profile data' },
          { name: 'contractors', description: 'Raw contractor records' },
          { name: 'snowflake', description: 'Snowflake data operations' },
          { name: 'health', description: 'Health check endpoints' }
        ],
        servers: [
          {
            url: 'http://localhost:4001',
            description: 'Development server'
          }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'JWT authentication token'
            }
          }
        }
      },
      path: '/docs',
      exclude: ['/docs', '/docs/json']
    })
  )
  .use(
    cors({
      origin: config.cors.allowedOrigins,
      credentials: true,
    })
  )
  .get("/", () => ({
    message: "GoldenGate API",
    version: "1.0.0",
    environment: config.env,
    documentation: "/docs"
  }), {
    detail: {
      summary: 'API Welcome',
      description: 'Returns basic API information',
      tags: ['health']
    }
  })
  .get("/health", async () => {
    const dbHealthy = await checkDatabaseHealth();
    
    return {
      status: dbHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      database: dbHealthy ? "connected" : "disconnected",
      environment: config.env,
    };
  }, {
    detail: {
      summary: 'Health Check',
      description: 'Check API and database health status',
      tags: ['health']
    }
  })
  .use(apiRoutes);

console.log(`🚀 GoldenGate API is running at http://localhost:${config.port}`);
console.log(`📊 Environment: ${config.env}`);
console.log(`🗄️  Database: ${config.database.host}:${config.database.port}/${config.database.name}`);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await closeDatabaseConnection();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await closeDatabaseConnection();
  process.exit(0);
});

export default {
  port: config.port,
  fetch: app.fetch.bind(app),
};
