import { config } from '@/config.js';
import FILE_CONSTANTS from 'shared/constants';



export type JobType = (typeof FILE_CONSTANTS.sharedMetricsConstant.JOB_TYPES)[number];

export function isJobType(value: unknown): value is JobType {
  return typeof value === 'string' && (FILE_CONSTANTS.sharedMetricsConstant.JOB_TYPES as readonly string[]).includes(value);
}

export const keys = {
  queue: config.queueName,
  job: (id: string) => `job:${id}`,
  submitted: FILE_CONSTANTS.sharedMetricsConstant.keys.REDIS_KEYS.SUBMITTED,
  completed: FILE_CONSTANTS.sharedMetricsConstant.keys.REDIS_KEYS.COMPLETED,
  failed: FILE_CONSTANTS.sharedMetricsConstant.keys.REDIS_KEYS.FAILED,
  totalDurationMs: FILE_CONSTANTS.sharedMetricsConstant.keys.REDIS_KEYS.TOTAL_DURATION_MS,
  deadLetterQueue: FILE_CONSTANTS.sharedMetricsConstant.keys.REDIS_KEYS.DEAD_LETTER_QUEUE
} as const;
