
import { errorHandler, notFound } from '@/middleware/error-handler.js';
import { requestId } from '@/middleware/request-id.js';
import { requestLogger } from '@/middleware/request-logger.js';

import express, { type Express } from 'express';
import { v1Router } from '@/routes/main-router.js';
export function createApp() {

  const app: Express = express();

  app.disable('x-powered-by');

  // ---------- Middleware (runs for every request) ----------
  app.use(requestId);
  app.use(requestLogger);
  app.use(express.json({ limit: '10kb' })); // job requests are tiny
  
  app.use('/v1', v1Router);

  // ---------- Fallbacks (must be last) ----------
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
