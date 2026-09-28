import { type Request, type Response } from 'express';
import { errorHandler, notFound } from '@/middleware/error-handler.js';
import { requestId } from '@/middleware/request-id.js';
import { requestLogger } from '@/middleware/request-logger.js';
import { healthRouter } from '@/routes/health.routes.js';
import { jobsRouter } from '@/routes/jobs.routes.js';
import { proxyRouter } from '@/routes/proxy.routes.js';
import express, { type Express } from 'express';
export function createApp() {

  const app: Express = express();

  app.disable('x-powered-by');

  // ---------- Middleware (runs for every request) ----------
  app.use(requestId);
  app.use(requestLogger);
  app.use(express.json({ limit: '10kb' })); // job requests are tiny

  // ---------- Routes ----------
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      service: 'api-gateway',
      routes: {
        'POST /submit': 'Submit a job. Body: { "type": "primes" | "bcrypt" | "sort" } (optional)',
        'GET /submit': 'Submit a job with a random type (used by the load test)',
        'GET /status/:id': 'Get the status and result of a job',
        'GET /stats': 'System-wide job statistics (from the stats service)',
        'GET /health': 'Liveness probe',
        'GET /ready': 'Readiness probe',
      },
    });
  });

  app.use(healthRouter);
  app.use(jobsRouter);
  app.use(proxyRouter);

  // ---------- Fallbacks (must be last) ----------
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
