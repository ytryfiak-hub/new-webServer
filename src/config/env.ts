import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
}

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env: EnvConfig = {
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  port: Number(getEnvVar('PORT', '5000')),
  databaseUrl: getEnvVar(
    'DATABASE_URL',
    'postgres://postgres:postgres@127.0.0.1:5432/user_crud_db',
  ),
};
