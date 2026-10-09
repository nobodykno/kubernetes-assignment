import { config } from '@/config.js';
import FILE_CONSTANTS from 'shared/constants';

/**
 * Keys for redis to store data
 */

export const keys = {

  queue: config.queueName,

  submitted: FILE_CONSTANTS.sharedMetricsConstant.keys.REDIS_KEYS.SUBMITTED,
  completed: FILE_CONSTANTS.sharedMetricsConstant.keys.REDIS_KEYS.COMPLETED,
  failed: FILE_CONSTANTS.sharedMetricsConstant.keys.REDIS_KEYS.FAILED,
  totalDurationMs: FILE_CONSTANTS.sharedMetricsConstant.keys.REDIS_KEYS.TOTAL_DURATION_MS,
  deadLetterQueue: FILE_CONSTANTS.sharedMetricsConstant.keys.REDIS_KEYS.DEAD_LETTER_QUEUE,
} as const;
