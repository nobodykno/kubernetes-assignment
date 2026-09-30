


import { config } from "@/config.js";
import { randomUUID } from "node:crypto";
import { redis } from "@/redis.js";
import { IJob, IJobStatus, IPostJobResponse } from "@/dto/response/job.js";
import { HttpError } from "@/lib/http-error.js";




export const keys = {
  job: (id: string) => `job:${id}`, 
  queue: config.queueName, //         
  submitted: 'stats:submitted', //     
} as const;


function toNumber(value: string | undefined): number | undefined {
  return value === undefined || value === '' ? undefined : Number(value);
}


export async function enqueueJob(type: string): Promise<IPostJobResponse> {
  const job = {
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

  const response: IPostJobResponse = {
    jobId: job.id,
    status: job.status,
    type: job.type
  }

  return response;
}


export async function getJob(id: string): Promise<IJob | null> {
  const data = await redis.hgetall(keys.job(id));

  if (!data.id){
    throw new HttpError(422, 'Id not Found');
  }

   const response:IJob =  {
    id: data.id,
    type: data.type,
    status: data.status as IJobStatus,
    createdAt: Number(data.createdAt),
    startedAt: toNumber(data.startedAt),
    completedAt: toNumber(data.completedAt),
    durationMs: toNumber(data.durationMs),
    result: data.result,
    error: data.error,
  };

  return response;
}
