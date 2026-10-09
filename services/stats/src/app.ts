import { type Request, type Response } from 'express';
import { registry, updateMetrics } from '@/metrics.js';
import { redis } from '@/redis.js';
import { readStats } from '@/stats.js';
import express, { type Express } from 'express';
import FILE_CONSTANTS from 'shared/constants';
import logs from 'shared/logs';

export function createApp() {
  const app : Express = express();
  app.disable('x-powered-by');

  app.get(FILE_CONSTANTS.routerAndTimer.ROUTE.STATS, async (_req: Request, res: Response) => {
    const stats = await readStats();
    res.json({ ...stats, timestamp: new Date().toISOString() });
  });

  app.get(FILE_CONSTANTS.routerAndTimer.ROUTE.METRICS, async (_req: Request, res: Response) => {
    updateMetrics(await readStats());
    res.setHeader('Content-Type', registry.contentType);
    res.send(await registry.metrics());
  });


  app.get(FILE_CONSTANTS.routerAndTimer.ROUTE.HEALTH, (_req: Request, res: Response) => {
    res.send('ok');
  });

  app.get(FILE_CONSTANTS.routerAndTimer.ROUTE.READY, async (_req: Request, res: Response) => {
    try {
      await redis.ping();
      res.send('ready');
    } catch {
      logs.logError({
        action:FILE_CONSTANTS.MESSAGES.ACTION.READY,
        module: FILE_CONSTANTS.MESSAGES.SERVICE.STATS,
        message: FILE_CONSTANTS.MESSAGES.MESSAGES.COMMON.API_NOT_READY
      });
      res.status(FILE_CONSTANTS.HTTP_STATUS.SERVICE_UNAVAILABLE).send(FILE_CONSTANTS.MESSAGES.MESSAGES.API_GATE_WAY.REDIS_NOT_AVAILABLE);
    }
  });


  app.use((err: unknown, req: Request, res: Response) => {
    console.error(`${req.method} ${req.originalUrl} failed:`, err);
    res.status(FILE_CONSTANTS.HTTP_STATUS.SERVICE_UNAVAILABLE).json({ error: FILE_CONSTANTS.MESSAGES.MESSAGES.STATS.REDIS_STATS_ERROR });
  });

  return app;
}
