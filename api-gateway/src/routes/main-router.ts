import { Router } from 'express';

import { healthRouter } from '@/routes/health.routes.js';
import { jobsRouter } from '@/routes/jobs.routes.js';
import { proxyRouter } from '@/routes/proxy.routes.js';

export const v1Router = Router();

v1Router.use(healthRouter);
v1Router.use(proxyRouter);
v1Router.use('/jobs',jobsRouter);
