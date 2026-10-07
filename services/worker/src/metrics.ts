import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';
import { JOB_TYPES } from '@/keys.js';

export const registry = new Registry();

collectDefaultMetrics({ register: registry });

export const jobsProcessed = new Counter({
  name: 'jobs_processed_total',
  help: 'Total number of jobs processed successfully',
  labelNames: ['type'] as const,
  registers: [registry],
});

export const jobProcessingTime = new Histogram({
  name: 'job_processing_time_seconds',
  help: 'Time taken to process a job, in seconds',
  labelNames: ['type'] as const,
  // Jobs take roughly 5 ms to 500 ms; buckets cover that range with room to spare
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [registry],
});

export const jobErrors = new Counter({
  name: 'job_errors_total',
  help: 'Total number of jobs that failed',
  labelNames: ['type'] as const,
  registers: [registry],
});

// Start every job type at 0, so Grafana shows "0" instead of "No data"
// before the first job of that type (or the first error) happens.
for (const type of JOB_TYPES) {
  jobsProcessed.inc({ type }, 0);
  jobErrors.inc({ type }, 0);
}
