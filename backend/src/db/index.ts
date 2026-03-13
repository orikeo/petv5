import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../config/env";

const dbUrl = new URL(env.databaseUrl);

const pool = new Pool({
  host: dbUrl.hostname,
  port: Number(dbUrl.port || 5432),
  database: dbUrl.pathname.replace("/", ""),
  user: dbUrl.username,
  password: dbUrl.password,

  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,

  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool);