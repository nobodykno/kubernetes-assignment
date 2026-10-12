import { keys } from '@/keys.js';
import { redis } from '@/redis.js';

export interface Stats {

  submitted: number;

  completed: number;

  failed: number;

  queueLength: number;

  inProgress: number;

  deadLetterQueueLength: number;
  avgProcessingMs: number;

  
}


export async function readStats(): Promise<Stats> {
  const results = await redis
    .multi()
    .get(keys.submitted)
    .get(keys.completed)
    .get(keys.failed)
    .get(keys.totalDurationMs)
    .llen(keys.queue)
    .exec();

  if (results === null) {
    throw new Error('Redis transaction was aborted');
  }

  const values = results.map(([err, value]) => {
    if (err) throw err;
    return toNumber(value);
  });

  const [submitted = 0, completed = 0, failed = 0, totalDurationMs = 0, queueLength = 0] = values;


  const inProgress = Math.max(0, submitted - completed - failed - queueLength);

  const avgProcessingMs = completed > 0 ? round(totalDurationMs / completed) : 0;

  const deadLetterQueueLength = await redis.llen(
    keys.deadLetterQueue,
  );

  return { submitted, completed, failed, queueLength, inProgress, deadLetterQueueLength, avgProcessingMs };
}


function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
