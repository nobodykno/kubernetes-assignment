import { type Request, type Response } from 'express';
import { registry, updateMetrics } from '@/metrics.js';
import { redis } from '@/redis.js';
import { readStats } from '@/stats.js';
import express, { type Express } from 'express';

export function createApp() {
  const app : Express = express();
  app.disable('x-powered-by');

  app.get('/stats', async (_req: Request, res: Response) => {
    const stats = await readStats();
    res.json({ ...stats, timestamp: new Date().toISOString() });
  });

  app.get('/metrics', async (_req: Request, res: Response) => {
    updateMetrics(await readStats());
    res.setHeader('Content-Type', registry.contentType);
    res.send(await registry.metrics());
  });


  app.get('/health', (_req: Request, res: Response) => {
    res.send('ok');
  });

  app.get('/ready', async (_req: Request, res: Response) => {
    try {
      await redis.ping();
      res.send('ready');
    } catch {
      res.status(503).send('redis unavailable');
    }
  });


  app.use((err: unknown, req: Request, res: Response) => {
    console.error(`${req.method} ${req.originalUrl} failed:`, err);
    res.status(503).json({ error: 'Could not read stats from Redis' });
  });

  return app;
}
