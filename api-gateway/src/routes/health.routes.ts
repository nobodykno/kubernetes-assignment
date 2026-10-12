import { Router, type Request, type Response } from 'express';
import { redis } from '@/redis.js';
import FILE_CONSTANTS from 'shared/constants';

export const healthRouter: Router = Router();


/**
 * Health and ready route to check If the service is up or not
 */


healthRouter.get('/health', (_req: Request, res: Response) => {
  res.send('ok');
});


healthRouter.get('/ready', async (_req: Request, res: Response) => {
  try {
    await redis.ping();
    res.send('ready');
  } catch {
    res.status(FILE_CONSTANTS.HTTP_STATUS.SERVICE_UNAVAILABLE).send(FILE_CONSTANTS.MESSAGES.MESSAGES.API_GATE_WAY.REDIS_NOT_AVAILABLE);
  }
});
