import { Redis } from 'ioredis';
import { config } from '@/config.js';

function createClient(name: string, maxRetriesPerRequest: number | null): Redis {
  const client = new Redis({
    host: config.redisHost,
    port: config.redisPort,
    maxRetriesPerRequest,
  });

  client.on('connect', () => {
    console.log(`[redis:${name}] connected to ${config.redisHost}:${config.redisPort}`);
  });
  client.on('error', (err: Error) => {
    console.error(`[redis:${name}] error:`, err.message);
  });

  return client;
}

/** Normal connection: reading/updating jobs, counters, the /ready ping. */
export const redis = createClient('main', 3);


export const blockingRedis = createClient('queue', null);
