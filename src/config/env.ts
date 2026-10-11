import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  nodeEnv: string;
  port: number;
  mongoUri: string;
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
  mongoUri: getEnvVar('MONGO_URI', 'mongodb://127.0.0.1:27017/user-crud-db'),
};
