import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    console.log(`[server] Running in ${env.nodeEnv} mode on port ${env.port}`);
  });

  const shutdown = (signal: string) => {
    console.log(`[server] Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      console.log('[server] HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    console.error('[server] Unhandled rejection:', reason);
    server.close(() => process.exit(1));
  });
}

bootstrap().catch((error) => {
  console.error('[server] Failed to start:', error);
  process.exit(1);
});
