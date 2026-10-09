import { config } from '@/config.js';
import type { JobType } from '@/keys.js';
import { bcryptJob } from '@/jobs/bcrypt.js';
import { primesJob } from '@/jobs/primes.js';
import { sortJob } from '@/jobs/sort.js';

/**
 * Runs the work for one job type and returns a short result string
 * that gets saved in Redis and shown by GET /status/:id.
 */
export async function runJob(type: JobType): Promise<string> {
  switch (type) {
  case 'primes':
    return primesJob(config.primesLimit);

  case 'bcrypt':
    return bcryptJob(config.bcryptRounds);

  case 'sort':
    return sortJob(config.sortSize);

  default:
    throw new Error(`Unsupported job type: ${type}`);
  }
}
