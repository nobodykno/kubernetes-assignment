import  { type Request, type Response } from 'express';
import { config } from '@/config.js';
import { registry } from '@/metrics.js';
import { redis } from '@/redis.js';
import { workerState } from '@/worker.js';
import express, { type Express } from 'express';

const STUCK_AFTER_MS = 60_000;

export function createApp() {
  const app: Express = express();
  app.disable('x-powered-by');

  // Prometheus scrapes this every 15-30 seconds
  app.get('/metrics', async (_req: Request, res: Response) => {
    res.setHeader('Content-Type', registry.contentType);
    res.send(await registry.metrics());
  });

  // Liveness: is the worker loop still going?
  app.get('/health', (_req: Request, res: Response) => {
    const { running, lastHeartbeat } = workerState();
    const idleMs = Date.now() - lastHeartbeat;

    if (!running || idleMs > STUCK_AFTER_MS) {
      res.status(503).json({ status: 'unhealthy', running, idleMs });
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
      res.status(503).send('redis unavailable');
    }
  });

  return app;
}
