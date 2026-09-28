import { Redis } from 'ioredis';
import { config } from '@/config.js';

export const redis = new Redis({
  host: config.redisHost,
  port: config.redisPort,
  // Fail a request quickly instead of hanging if Redis is down.
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  console.log(`Connected to Redis at ${config.redisHost}:${config.redisPort}`);
});

redis.on('error', (err: Error) => {
  console.error('Redis error:', err.message);
});
