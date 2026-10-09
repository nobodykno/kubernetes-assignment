import { Gauge, Registry, collectDefaultMetrics } from 'prom-client';
import type { Stats } from '@/stats.js';
import FILE_CONSTANTS from 'shared/constants';

export const registry = new Registry();


collectDefaultMetrics({ register: registry });

/**
 * Metric for total submitted jobs
 */

const totalJobsSubmitted = new Gauge({
  name: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.STATS.TOTAL_JOBS_SUBMITTED.NAME,
  help: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.STATS.TOTAL_JOBS_SUBMITTED.HELP,
  registers: [registry],
});

/**
 * Metric for total completed jobs
 */


const totalJobsCompleted = new Gauge({
  name: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.STATS.TOTAL_JOBS_COMPLETED.NAME,
  help: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.STATS.TOTAL_JOBS_COMPLETED.HELP,
  registers: [registry],
});

/**
 * Metric for queueLength
 */

const queueLength = new Gauge({
  name: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.STATS.QUEUE_LENGTH.NAME,
  help: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.STATS.QUEUE_LENGTH.HELP,
  registers: [registry],
});

/**
 * Metric for total Jobs failed
 */


const totalJobsFailed = new Gauge({
  name: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.STATS.TOTAL_JOBS_FAILED.NAME,
  help: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.STATS.TOTAL_JOBS_FAILED.HELP,
  registers: [registry],
});

/**
 * Metric for  Jobs  in progress
 */


const jobsInProgress = new Gauge({
  name: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.STATS.JOBS_IN_PROGRESS.NAME,
  help: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.STATS.JOBS_IN_PROGRESS.HELP,
  registers: [registry],
});


/**
 * Metric for  avg processing time 
 */

const avgJobProcessingTime = new Gauge({
  name: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.STATS.AVG_JOB_PROCESSING_TIME_SECONDS.NAME,
  help:  FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.STATS.AVG_JOB_PROCESSING_TIME_SECONDS.HELP,
  registers: [registry],
});


/**
 * Metric for dead-letter queue length
 */
const deadLetterQueueLength = new Gauge({
  name: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.STATS.DEAD_LETTER_QUEUE_LENGTH.NAME,
  help: FILE_CONSTANTS.sharedMetricsConstant.keys.METRICS.STATS.DEAD_LETTER_QUEUE_LENGTH.HELP,
  registers: [registry],
});

export function updateMetrics(stats: Stats): void {
  totalJobsSubmitted.set(stats.submitted);
  totalJobsCompleted.set(stats.completed);
  queueLength.set(stats.queueLength);
  totalJobsFailed.set(stats.failed);
  jobsInProgress.set(stats.inProgress);
  avgJobProcessingTime.set(stats.avgProcessingMs / 1000);
  deadLetterQueueLength.set(stats.deadLetterQueueLength);
}
