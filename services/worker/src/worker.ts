import { performance } from 'node:perf_hooks';
import { setImmediate as yieldToEventLoop, setTimeout as sleep } from 'node:timers/promises';
import { config } from '@/config.js';
import { runJob } from '@/jobs/index.js';
import { isJobType, keys } from '@/keys.js';
import { jobErrors, jobProcessingTime, jobsProcessed } from '@/metrics.js';
import { blockingRedis, redis } from '@/redis.js';



let running = false;
let lastHeartbeat = Date.now();

export function workerState() {
  return { running, lastHeartbeat };
}


export async function runWorker(): Promise<void> {
  running = true;
  console.log(`Worker ${config.workerId} waiting for jobs on "${keys.queue}"`);

  while (running) {
    lastHeartbeat = Date.now();

    let jobId: string | undefined;
    try {
      console.log(
        `Waiting for job from queue "${keys.queue}" with timeout ${config.pollTimeoutSeconds}s`,
      );
      
      const item = await blockingRedis.brpop(keys.queue, config.pollTimeoutSeconds);
      console.log('BRPOP returned:', item);
      jobId = item?.[1];
    } catch (err) {
      if (!running) break; 
      console.error('Failed to read from queue, retrying in 1s:', (err as Error).message);
      await sleep(1000);
      continue;
    }

    if (jobId === undefined) continue; 

    try {
      await processJob(jobId);
    } catch (err) {
      console.error(`Job ${jobId}: could not save result:`, err);
    }

    await yieldToEventLoop();
  }

  console.log('Worker loop stopped');
}

export function stopWorker(): void {
  running = false;
  blockingRedis.disconnect();
}



async function processJob(jobId: string): Promise<void> {

  console.log("process",jobId)
  const jobKey = keys.job(jobId);
  console.log("process",jobId)
  const type = await redis.hget(jobKey, 'type');

  console.log("type",jobId)
  if (type === null) {
    console.warn(`Job ${jobId}: not found in Redis, skipping`);
    return;
  }

  await redis.hset(jobKey, {
    status: 'processing',
    startedAt: Date.now(),
    worker: config.workerId,
  });

  const metricType = isJobType(type) ? type : 'unknown';
  const start = performance.now();
  console.log("metricType",metricType);
  try {
    if (!isJobType(type)) {
      throw new Error(`Unknown job type "${type}"`);
    }
    console.log("type",type);

    const result = await runJob(type);
    const durationMs = roundMs(performance.now() - start);

    await exec(
      redis
        .multi()
        .hset(jobKey, { status: 'completed', result, durationMs, completedAt: Date.now() })
        .incr(keys.completed)
        .incrbyfloat(keys.totalDurationMs, durationMs),
    );

    jobsProcessed.inc({ type: metricType });
    jobProcessingTime.observe({ type: metricType }, durationMs / 1000);

    if (config.logJobs) {
      console.log(`Job ${jobId} (${type}) completed in ${durationMs} ms`);
    }
  } catch (err) {
    const durationMs = roundMs(performance.now() - start);
    const message = err instanceof Error ? err.message : String(err);

    await exec(
      redis
        .multi()
        .hset(jobKey, { status: 'failed', error: message, durationMs, completedAt: Date.now() })
        .incr(keys.failed),
    );

    jobErrors.inc({ type: metricType });
    console.error(`Job ${jobId} (${type}) failed after ${durationMs} ms: ${message}`);
  }
}



function roundMs(ms: number): number {
  return Math.round(ms * 100) / 100;
}


async function exec(transaction: ReturnType<typeof redis.multi>): Promise<void> {
  const results = await transaction.exec();
  if (results === null) throw new Error('Redis transaction was aborted');
  for (const [err] of results) {
    if (err) throw err;
  }
}
