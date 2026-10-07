import { Gauge, Registry, collectDefaultMetrics } from 'prom-client';
import type { Stats } from '@/stats.js';

export const registry = new Registry();


collectDefaultMetrics({ register: registry });



const totalJobsSubmitted = new Gauge({
  name: 'total_jobs_submitted',
  help: 'Total number of jobs submitted to the gateway',
  registers: [registry],
});

const totalJobsCompleted = new Gauge({
  name: 'total_jobs_completed',
  help: 'Total number of jobs completed successfully by all workers',
  registers: [registry],
});

const queueLength = new Gauge({
  name: 'queue_length',
  help: 'Number of jobs waiting in the Redis queue',
  registers: [registry],
});



const totalJobsFailed = new Gauge({
  name: 'total_jobs_failed',
  help: 'Total number of jobs that failed',
  registers: [registry],
});

const jobsInProgress = new Gauge({
  name: 'jobs_in_progress',
  help: 'Jobs taken by a worker but not finished yet',
  registers: [registry],
});

const avgJobProcessingTime = new Gauge({
  name: 'avg_job_processing_time_seconds',
  help: 'Average processing time of successful jobs, in seconds (all-time)',
  registers: [registry],
});


export function updateMetrics(stats: Stats): void {
  totalJobsSubmitted.set(stats.submitted);
  totalJobsCompleted.set(stats.completed);
  queueLength.set(stats.queueLength);
  totalJobsFailed.set(stats.failed);
  jobsInProgress.set(stats.inProgress);
  avgJobProcessingTime.set(stats.avgProcessingMs / 1000);
}
