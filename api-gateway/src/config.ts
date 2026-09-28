

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
  port: intFromEnv('PORT', 3000),

  // Redis
  redisHost: process.env.REDIS_HOST ?? 'localhost',
  redisPort: intFromEnv('REDIS_PORT', 6379),
  queueName: process.env.QUEUE_NAME ?? 'jobs',

  jobTtlSeconds: intFromEnv('JOB_TTL_SECONDS', 24 * 60 * 60),

  statsServiceUrl: process.env.STATS_SERVICE_URL ?? 'http://localhost:3002',

  upstreamTimeoutMs: intFromEnv('UPSTREAM_TIMEOUT_MS', 3000),

  logRequests: boolFromEnv('LOG_REQUESTS', true),
} as const;
