import { Pool } from 'pg';
import { env } from './env';

export const pool = new Pool({ connectionString: env.databaseUrl });

pool.on('error', (error) => {
  console.error('[database] Unexpected PostgreSQL client error', error);
});

// Створення схеми при старті (ідемпотентно)
const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(100) NOT NULL CHECK (char_length(name) >= 2),
    surname        VARCHAR(100) CHECK (surname IS NULL OR char_length(surname) >= 2),
    email          VARCHAR(255) NOT NULL UNIQUE,
    password       TEXT NOT NULL,
    age            INTEGER CHECK (age IS NULL OR (age >= 0 AND age <= 150)),
    date_of_birth  TIMESTAMPTZ,
    photo          TEXT,
    refresh_token  TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS users_created_at_idx ON users (created_at DESC);
`;

function safeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = '***';
    return parsed.toString();
  } catch {
    return '<invalid url>';
  }
}

export async function connectDatabase(): Promise<void> {
  try {
    await pool.query('SELECT 1');
    await pool.query(SCHEMA_SQL);
    console.log(`[database] Connected to PostgreSQL: ${safeUrl(env.databaseUrl)}`);
  } catch (error) {
    console.error('[database] Failed to connect to PostgreSQL', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await pool.end();
}
