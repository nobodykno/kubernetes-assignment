import type { Server } from 'node:http';
import { redis } from '@/redis.js';
import { stopWorker } from '@/worker.js';
import FILE_CONSTANTS from 'shared/constants';
import logs from 'shared/logs';

let shuttingDown = false;

export const gracefulShutdown = async (
  server: Server,
  workerDone: Promise<void>,
  signal: string,
): Promise<void> => {
  if (shuttingDown) return;

  shuttingDown = true;

  console.log(`${signal} received: finishing current job, then exiting`);

  setTimeout(() => {
    logs.logError({
      action: FILE_CONSTANTS.MESSAGES.ACTION.GRACEFUL_SHUTDOWN,
      module: FILE_CONSTANTS.MESSAGES.SERVICE.WORKER,
      message: FILE_CONSTANTS.MESSAGES.MESSAGES.COMMON.GRACEFUL_SHUT_DOWN_TIMEOUT
    });
    process.exit(1);
  }, FILE_CONSTANTS.routerAndTimer.TIMER.GRACEFUL_SHUTDOWN_WORKER).unref();

  stopWorker();

  await workerDone;


  server.close();

  await redis.quit().catch(() => undefined);

  process.exit(0);
};