import jobController from '@/controller/job-controller.js';
import validate from '@/middleware/validate.js';
import schema from '@/validators/job-schema.validator.js';
import { Router } from 'express';


/**
 * Route handling job routes
 */

export const jobsRouter: Router = Router();


jobsRouter.post(
  '/submit',
  validate(schema.jobSchema),
  jobController.submitWorkerType,
);

jobsRouter.post(
  '/retry/:id',
  validate(schema.getJobSchema),
  jobController.retryJob,
);
jobsRouter.get(
  '/:id',
  validate(schema.getJobSchema),
  jobController.getJobStatus,
);
