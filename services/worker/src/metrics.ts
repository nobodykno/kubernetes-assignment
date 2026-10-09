import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';
import FILE_CONSTANTS from 'shared/constants';


export const registry = new Registry();

collectDefaultMetrics({ register: registry });

export const jobsProcessed = new Counter({
  name: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.WORKER.JOB_PROCESSED_TOTAL.NAME,
  help: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.WORKER.JOB_PROCESSED_TOTAL.HELP,
  labelNames: ['type'] as const,
  registers: [registry],
});

export const jobProcessingTime = new Histogram({
  name: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.WORKER.JOB_PROCESSING_TIME_SECONDS.NAME,
  help: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.WORKER.JOB_PROCESSING_TIME_SECONDS.HELP,
  labelNames: ['type'] as const,
  // Jobs take roughly 5 ms to 500 ms; buckets cover that range with room to spare
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [registry],
});

export const jobErrors = new Counter({
  name: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.WORKER.JOB_ERRORS_TOTAL.NAME,
  help: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.WORKER.JOB_ERRORS_TOTAL.HELP,
  labelNames: ['type'] as const,
  registers: [registry],
});

export const jobsDeadLettered = new Counter({
  name: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.WORKER.JOBS_DEAD_LETTER.NAME,
  help: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.WORKER.JOBS_DEAD_LETTER.HELP,
  labelNames: ['type'] as const,
  registers: [registry],
});


for (const type of FILE_CONSTANTS.sharedMetricsConstant.JOB_TYPES) {
  jobsProcessed.inc({ type }, 0);
  jobErrors.inc({ type }, 0);
}
