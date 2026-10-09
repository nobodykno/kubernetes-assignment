

function intFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;

  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value)) {
    throw new Error(`Environment variable ${name} must be a number, got "${raw}"`);
  }
  return value;
}

export const config = {
  port: intFromEnv('PORT', 3002),

  // Redis
  redisHost: process.env.REDIS_HOST ?? 'localhost',
  redisPort: intFromEnv('REDIS_PORT', 6379),
  queueName: process.env.QUEUE_NAME ?? 'jobs', 
} as const;
