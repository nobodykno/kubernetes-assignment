

// ---------- Types ----------

import { config } from "@/config.js";
import { randomUUID } from "node:crypto";
import { redis } from "@/redis.js";

export const JOB_TYPES = ['primes', 'bcrypt', 'sort'] as const;
export type JobType = (typeof JOB_TYPES)[number];

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  createdAt: number;
  // The fields below are filled in later by the worker.
  startedAt?: number;
  completedAt?: number;
  durationMs?: number;
  result?: string;
  error?: string;
}



export const keys = {
  job: (id: string) => `job:${id}`, // hash with the job's fields
  queue: config.queueName, //          list of job IDs waiting to be processed
  submitted: 'stats:submitted', //     counter of all jobs ever submitted
} as const;

// ---------- Helpers ----------

export function isJobType(value: unknown): value is JobType {
  return typeof value === 'string' && (JOB_TYPES as readonly string[]).includes(value);
}

export function randomJobType(): JobType {
  return JOB_TYPES[Math.floor(Math.random() * JOB_TYPES.length)] ?? 'primes';
}

function toNumber(value: string | undefined): number | undefined {
  return value === undefined || value === '' ? undefined : Number(value);
}


export async function enqueueJob(type: JobType): Promise<Job> {
  const job: Job = {
    id: randomUUID(),
    type,
    status: 'queued',
    createdAt: Date.now(),
  };

  const results = await redis
    .multi()
    .hset(keys.job(job.id), {
      id: job.id,
      type: job.type,
      status: job.status,
      createdAt: job.createdAt,
    })
    .expire(keys.job(job.id), config.jobTtlSeconds)
    .lpush(keys.queue, job.id)
    .incr(keys.submitted)
    .exec();

  if (results === null) {
    throw new Error('Redis transaction was aborted');
  }
  for (const [err] of results) {
    if (err) throw err;
  }

  return job;
}


export async function getJob(id: string): Promise<Job | null> {
  const data = await redis.hgetall(keys.job(id));

  if (!data.id) return null;

  return {
    id: data.id,
    type: data.type as JobType,
    status: data.status as JobStatus,
    createdAt: Number(data.createdAt),
    startedAt: toNumber(data.startedAt),
    completedAt: toNumber(data.completedAt),
    durationMs: toNumber(data.durationMs),
    result: data.result,
    error: data.error,
  };
}
