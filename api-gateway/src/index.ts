import { createApp } from '@/app.js';
import { config } from '@/config.js';
import { redis } from '@/redis.js';

const app = createApp();

const server = app.listen(config.port, (error?: Error) => {
  if (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
  console.log(`api-gateway listening on port ${config.port}`);
});

function shutdown(signal: string): void {
  console.log(`${signal} received, shutting down`);

  server.close(() => {
    void redis
      .quit()
      .catch(() => undefined)
      .finally(() => process.exit(0));
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
