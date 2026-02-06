import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Create postgres connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create postgres client
// For serverless environments, use max: 1 to avoid connection pool issues
const client = postgres(connectionString, {
  max: 1,
  prepare: false,
});

// Create drizzle database instance with schema
export const db = drizzle(client, { schema });

// Export schema for convenience
export * from "./schema";
