import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.mongoUri);
    console.log(`[database] Connected to MongoDB: ${env.mongoUri}`);
  } catch (error) {
    console.error('[database] Failed to connect to MongoDB', error);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[database] MongoDB disconnected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('[database] MongoDB connection error', error);
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
