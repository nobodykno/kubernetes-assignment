import { createApp } from '@/app.js';
import { config } from '@/config.js';
import { gracefulShutdown } from '@/utils/graceful-shutdown.js';

const app = createApp();

const server = app.listen(config.port, (error?: Error) => {
  if (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
  console.log(`api-gateway listening on port ${config.port}`);
});


process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));
process.on('SIGINT', () => gracefulShutdown(server, 'SIGINT'));
