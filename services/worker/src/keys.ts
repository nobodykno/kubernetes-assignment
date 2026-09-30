import { config } from '@/config.js';



export const JOB_TYPES = ['primes', 'bcrypt', 'sort'] as const;
export type JobType = (typeof JOB_TYPES)[number];

export function isJobType(value: unknown): value is JobType {
  return typeof value === 'string' && (JOB_TYPES as readonly string[]).includes(value);
}

export const keys = {
  queue: config.queueName,
  job: (id: string) => `job:${id}`,
  submitted: 'stats:submitted',
  completed: 'stats:completed',
  failed: 'stats:failed',
  totalDurationMs: 'stats:total_duration_ms',
} as const;
