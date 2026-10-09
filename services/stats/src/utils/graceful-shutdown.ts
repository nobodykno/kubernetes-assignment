import type { Server } from 'node:http';
import { redis } from '@/redis.js';
import FILE_CONSTANTS from 'shared/constants';
import logs from 'shared/logs';

export const gracefulShutdown = (
  server: Server,
  signal: string,
): void => {
  console.log(`${signal} received, shutting down`);

  server.close(() => {
    void redis
      .quit()
      .catch(() => undefined)
      .finally(() => process.exit(0));
  });

  setTimeout(() => {
    logs.logError({
      action: FILE_CONSTANTS.MESSAGES.ACTION.GRACEFUL_SHUTDOWN,
      module: FILE_CONSTANTS.MESSAGES.SERVICE.STATS,
      message: FILE_CONSTANTS.MESSAGES.MESSAGES.COMMON.GRACEFUL_SHUT_DOWN_TIMEOUT
    });

    
    process.exit(1);
  }, FILE_CONSTANTS.routerAndTimer.TIMER.GRACEFUL_SHUTDOWN_API_GATEWAY_STATS).unref();
};