import path from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from '../db/schema';
import { env } from './env';

export const pool = new Pool({ connectionString: env.databaseUrl });

pool.on('error', (error) => {
  console.error('[database] Unexpected PostgreSQL client error', error);
});

export const db = drizzle(pool, { schema });

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
    // Застосовуємо міграції з папки ./drizzle (ідемпотентно)
    await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
    console.log(`[database] Connected to PostgreSQL: ${safeUrl(env.databaseUrl)}`);
  } catch (error) {
    console.error('[database] Failed to connect to PostgreSQL', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await pool.end();
}
