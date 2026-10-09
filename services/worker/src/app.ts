import  { type Request, type Response } from 'express';
import { config } from '@/config.js';
import { registry } from '@/metrics.js';
import { redis } from '@/redis.js';
import { workerState } from '@/worker.js';
import express, { type Express } from 'express';
import FILE_CONSTANTS from 'shared/constants';
import logs from 'shared/logs';

const STUCK_AFTER_MS = FILE_CONSTANTS.routerAndTimer.TIMER.STUCK_AFTER_MS;

export function createApp() {
  const app: Express = express();
  app.disable('x-powered-by');


  app.get('/metrics', async (_req: Request, res: Response) => {
    res.setHeader('Content-Type', registry.contentType);
    res.send(await registry.metrics());
  });

  // Liveness: is the worker loop still going?
  app.get('/health', (_req: Request, res: Response) => {
    const { running, lastHeartbeat } = workerState();
    const idleMs = Date.now() - lastHeartbeat;

    if (!running || idleMs > STUCK_AFTER_MS) {
      res.status(FILE_CONSTANTS.HTTP_STATUS.SERVICE_UNAVAILABLE).json({ status: 'unhealthy', running, idleMs });
      return;
    }
    res.json({ status: 'ok', worker: config.workerId });
  });

  // Readiness: can we reach Redis?
  app.get('/ready', async (_req: Request, res: Response) => {
    try {
      await redis.ping();
      res.send('ready');
    } catch {
      logs.logError({
        action:FILE_CONSTANTS.MESSAGES.ACTION.READY,
        module: FILE_CONSTANTS.MESSAGES.SERVICE.WORKER,
        message: FILE_CONSTANTS.MESSAGES.MESSAGES.COMMON.API_NOT_READY
      });
      res.status(FILE_CONSTANTS.HTTP_STATUS.SERVICE_UNAVAILABLE).send(FILE_CONSTANTS.MESSAGES.MESSAGES.API_GATE_WAY.REDIS_NOT_AVAILABLE);
    }
  });

  return app;
}
