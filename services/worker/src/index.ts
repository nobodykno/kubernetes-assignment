import { createApp } from '@/app.js';
import { config } from '@/config.js';
import { redis } from '@/redis.js';
import { runWorker, stopWorker } from '@/worker.js';


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


let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received: finishing current job, then exiting`);

  // Kubernetes kills the pod after 30s by default; exit before that.
  setTimeout(() => process.exit(1), 25_000).unref();

  stopWorker();
  await workerDone;

  server.close();
  await redis.quit().catch(() => undefined);
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
