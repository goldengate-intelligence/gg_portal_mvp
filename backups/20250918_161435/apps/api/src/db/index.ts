import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "../config";
import * as schema from "./schema";

// Create the connection
const connectionString = `postgresql://${config.database.user}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.name}`;

const queryClient = postgres(connectionString, {
  max: config.database.maxConnections,
  idle_timeout: 20,
  connect_timeout: 60,
  ssl: config.database.ssl ? "require" : false,
});

// Initialize Drizzle
export const db = drizzle(queryClient, { 
  schema,
  logger: config.env === "development",
});

// Export the schema for type inference
export { schema };

// Export types
export type Database = typeof db;

// Connection health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await queryClient`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await queryClient.end();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
}