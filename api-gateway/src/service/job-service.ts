


import { config } from '@/config.js';
import { randomUUID } from 'node:crypto';
import { redis } from '@/redis.js';
import { IJob, IJobStatus, IPostJobResponse } from '@/dto/response/job.js';
import { HttpError } from '@/lib/http-error.js';
import FILE_CONSTANTS from 'shared/constants';




export const keys = {
  job: (id: string) => `job:${id}`, 
  queue: config.queueName, //         
  submitted: FILE_CONSTANTS.sharedMetricsConstant.keys.REDIS_KEYS.SUBMITTED,
  deadLetterQueue: FILE_CONSTANTS.sharedMetricsConstant.keys.REDIS_KEYS.DEAD_LETTER_QUEUE //     
} as const;


function toNumber(value: string | undefined): number | undefined {
  return value === undefined || value === '' ? undefined : Number(value);
}

/**
 * Service to accept job type and initiate the entire process
 * @param type accepts job type and perform operation accordingly by setting reddis keys
 * @returns JSON matching with DTO IPostJobResponse
 */
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
    throw new HttpError(FILE_CONSTANTS.HTTP_STATUS.BAD_REQUEST,FILE_CONSTANTS.MESSAGES.MESSAGES.API_GATE_WAY.REDIS_TRANSACTION_ABORTED);
  }
  for (const [err] of results) {
    if (err) throw new HttpError(FILE_CONSTANTS.HTTP_STATUS.BAD_REQUEST, err.message);
  }

  const response: IPostJobResponse = {
    jobId: job.id,
    status: job.status,
    type: job.type
  };

  return response;
}

/**
 * Service to give job details
 * @param id accept job id
 * @returns response matching with IJob response
 */
export async function getJob(id: string): Promise<IJob | null> {
  const data = await redis.hgetall(keys.job(id));

  if (!data.id){
    throw new HttpError(FILE_CONSTANTS.HTTP_STATUS.NOT_FOUND_ID, FILE_CONSTANTS.MESSAGES.MESSAGES.API_GATE_WAY.NOT_FOUND_ID);
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


/**
 * Retry failed jobs
 * @param id accept job id
 * @returns response matching with IPostJobResponse response
 */

export async function retryFailedJob(jobId: string): Promise<IPostJobResponse> {
  const jobKey = keys.job(jobId);

  const job = await redis.hgetall(jobKey);

  if (!job.id) {
    throw new HttpError(
      FILE_CONSTANTS.HTTP_STATUS.NOT_FOUND,
      `Job ${jobId} not found`,
    );
  }

  if (job.status !== 'failed') {
    throw new HttpError(
      FILE_CONSTANTS.HTTP_STATUS.BAD_REQUEST,
      `Job ${jobId} cannot be retried`,
    );
  }

  const results = await redis
    .multi()
    .hset(jobKey, {
      status: 'queued',
      error: '',
      retryAt: Date.now(),
    })
    .lrem(keys.deadLetterQueue, 1, jobId)
    .rpush(keys.queue, jobId)
    .exec();

  if (results === null) {
    throw new HttpError(
      FILE_CONSTANTS.HTTP_STATUS.BAD_REQUEST,
      FILE_CONSTANTS.MESSAGES.MESSAGES.API_GATE_WAY.REDIS_TRANSACTION_ABORTED,
    );
  }

  for (const [err] of results) {
    if (err) {
      throw new HttpError(
        FILE_CONSTANTS.HTTP_STATUS.BAD_REQUEST,
        err.message,
      );
    }
  }

  const response: IPostJobResponse = {
    jobId,
    status: 'queued',
    type: job.type,
  };

  return response;
}