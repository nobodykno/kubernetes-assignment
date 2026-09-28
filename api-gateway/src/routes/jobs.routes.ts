import { Router, type Request, type Response } from 'express';
import { HttpError } from '@/lib/http-error.js';
import { JOB_TYPES, enqueueJob, getJob, isJobType, randomJobType, type JobType } from '@/jobs.js';

export const jobsRouter: Router = Router();


async function submit(req: Request, res: Response): Promise<void> {
  const body = req.body as { type?: unknown } | undefined;
  const requested = body?.type ?? req.query.type;

  let type: JobType;
  if (requested === undefined || requested === '') {

    type = randomJobType();
  } else if (isJobType(requested)) {
    type = requested;
  } else {
    throw new HttpError(400, `Invalid job type. Use one of: ${JOB_TYPES.join(', ')}`);
  }

  const job = await enqueueJob(type);
  res.status(202).json({ jobId: job.id, type: job.type, status: job.status });
}

jobsRouter.post('/submit', submit);
jobsRouter.get('/submit', submit);

// ---------- GET /status/:id ----------
jobsRouter.get('/status/:id', async (req: Request<{ id: string }>, res: Response) => {
  const job = await getJob(req.params.id);
  if (!job) {
    throw new HttpError(404, 'Job not found');
  }

  res.json({
    jobId: job.id,
    type: job.type,
    status: job.status,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    durationMs: job.durationMs,
    result: job.result,
    error: job.error,
  });
});
