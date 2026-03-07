import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../config/env';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // максимальное количество соединений
  max: 10,

  // сколько ждать соединение
  connectionTimeoutMillis: 5000,

  // сколько держать idle соединение
  idleTimeoutMillis: 30000,

  ssl: {
    rejectUnauthorized: false
  }
})

export const db = drizzle(pool)