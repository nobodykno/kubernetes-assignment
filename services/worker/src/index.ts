import { createApp } from '@/app.js';
import { config } from '@/config.js';
import { runWorker } from '@/worker.js';
import { gracefulShutdown } from '@/utils/graceful-shutdown.js';


const app = createApp();
const server = app.listen(config.port, (error?: Error) => {
  if (error) {
    console.error('Failed to start server:', error);
    
    process.exit(1);
  }
  console.log(`Worker metrics server listening on port ${config.port}`);
});

const workerDone = runWorker().catch((err: unknown) => {
  console.error('Worker loop crashed:', err);
  process.exit(1);
});


process.on('SIGTERM', () => {
  void gracefulShutdown(server, workerDone, 'SIGTERM');
});

process.on('SIGINT', () => {
  void gracefulShutdown(server, workerDone, 'SIGINT');
});