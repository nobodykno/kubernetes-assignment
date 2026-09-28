import { Router, type Request, type Response } from 'express';
import { redis } from '@/redis.js';

export const healthRouter: Router = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  res.send('ok');
});


healthRouter.get('/ready', async (_req: Request, res: Response) => {
  try {
    await redis.ping();
    res.send('ready');
  } catch {
    res.status(503).send('redis unavailable');
  }
});
