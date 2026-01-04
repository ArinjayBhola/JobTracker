import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Handle missing DATABASE_URL gracefully for build time
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL not configured - database features will not work");
}

const sql = connectionString ? neon(connectionString) : null;
export const db = sql ? drizzle(sql, { schema }) : null;

// Helper to get db or throw if not configured
export function getDb() {
  if (!db) {
    throw new Error("Database not configured. Please set DATABASE_URL environment variable.");
  }
  return db;
}
