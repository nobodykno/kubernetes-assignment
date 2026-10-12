import { Server } from 'http';
import { redis } from '@/redis.js';
import logs from 'shared/logs';
import FILE_CONSTANTS from 'shared/constants';

/**
 * 
 * @param server accepts open server connection
 * @param signal accepts signal type
 */

export const gracefulShutdown =  (
  server: Server,
  signal: string,
) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    try {
      await redis.quit();
      process.exit(0);
    } catch (error) {
      console.error('Graceful shutdown failed:', error);
      logs.logError({
        action: FILE_CONSTANTS.MESSAGES.ACTION.GRACEFUL_SHUTDOWN,
        module:FILE_CONSTANTS.MESSAGES.SERVICE.API_GATEWAY,
        message: FILE_CONSTANTS.MESSAGES.MESSAGES.API_GATE_WAY.GRACEFUL_SHUTDOWN_SUCCESS_ERROR
      });
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('Graceful shutdown timed out');

    process.exit(1);
  }, FILE_CONSTANTS.routerAndTimer.TIMER.GRACEFUL_SHUTDOWN_API_GATEWAY_STATS).unref();
};