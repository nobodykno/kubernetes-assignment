import { hostname } from 'node:os';



function intFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;

  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value)) {
    throw new Error(`Environment variable ${name} must be a number, got "${raw}"`);
  }
  return value;
}

function boolFromEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  return raw.toLowerCase() === 'true';
}

export const config = {

  port: intFromEnv('PORT', 3001),
  redisHost: process.env.REDIS_HOST ?? 'localhost',
  redisPort: intFromEnv('REDIS_PORT', 6379),
  queueName: process.env.QUEUE_NAME ?? 'jobs', 
  pollTimeoutSeconds: intFromEnv('POLL_TIMEOUT_SECONDS', 5),

  primesLimit: intFromEnv('PRIMES_LIMIT', 100_000),
  bcryptRounds: intFromEnv('BCRYPT_ROUNDS', 10),
  sortSize: intFromEnv('SORT_SIZE', 100_000),

  workerId: hostname(),

  logJobs: boolFromEnv('LOG_JOBS', true),
} as const;
