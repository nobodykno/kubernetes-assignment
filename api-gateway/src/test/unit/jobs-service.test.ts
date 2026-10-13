import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import FILE_CONSTANTS from 'shared/constants';
import { HttpError } from '@/lib/http-error.js';

// ---------------------------------------------------------------------------


const TEST_JOB_ID = 'test-job-id';

const mockRandomUUID = jest.fn<() => string>();

const mockRedis = {
  multi: jest.fn(),
  hgetall: jest.fn<(key: string) => Promise<Record<string, string>>>(),
};

jest.unstable_mockModule('node:crypto', () => ({
  randomUUID: mockRandomUUID,
}));

jest.unstable_mockModule('@/config.js', () => ({
  config: {
    queueName: 'test:queue',
    jobTtlSeconds: 3600,
  },
}));

jest.unstable_mockModule('@/redis.js', () => ({
  redis: mockRedis,
}));

// Dynamic imports AFTER the mocks so they receive the mocked dependencies.
const { config } = await import('@/config.js');
const { enqueueJob, getJob, retryFailedJob, keys } = await import(
  '@/service/job-service.js'
);

type TransactionResult = Array<[Error | null, unknown]>;

function createTransaction(results: TransactionResult | null) {
  const transaction = {
    hset: jest.fn(),
    expire: jest.fn(),
    lpush: jest.fn(),
    rpush: jest.fn(),
    lrem: jest.fn(),
    incr: jest.fn(),
    exec: jest.fn<() => Promise<TransactionResult | null>>(),
  };

  transaction.hset.mockReturnValue(transaction as never);
  transaction.expire.mockReturnValue(transaction as never);
  transaction.lpush.mockReturnValue(transaction as never);
  transaction.rpush.mockReturnValue(transaction as never);
  transaction.lrem.mockReturnValue(transaction as never);
  transaction.incr.mockReturnValue(transaction as never);
  transaction.exec.mockResolvedValue(results);

  mockRedis.multi.mockReturnValue(transaction as never);

  return transaction;
}

describe('Job service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRandomUUID.mockReturnValue(TEST_JOB_ID);
  });

  describe('keys', () => {
    it('should create the correct job key', () => {
      expect(keys.job('123')).toBe('job:123');
    });

    it('should use the configured queue name', () => {
      expect(keys.queue).toBe(config.queueName);
    });

    it('should expose the submitted and dead-letter keys', () => {
      expect(keys.submitted).toBe(
        FILE_CONSTANTS.sharedMetricsConstant.keys.REDIS_KEYS.SUBMITTED,
      );

      expect(keys.deadLetterQueue).toBe(
        FILE_CONSTANTS.sharedMetricsConstant.keys.REDIS_KEYS.DEAD_LETTER_QUEUE,
      );
    });
  });

  describe('enqueueJob', () => {
    it('should enqueue a job and return its response', async () => {
      const transaction = createTransaction([
        [null, 1],
        [null, 1],
        [null, 1],
        [null, 1],
      ]);

      const response = await enqueueJob('image');

      expect(response).toEqual({
        jobId: TEST_JOB_ID,
        status: 'queued',
        type: 'image',
      });

      expect(transaction.hset).toHaveBeenCalledWith(
        `job:${TEST_JOB_ID}`,
        expect.objectContaining({
          id: TEST_JOB_ID,
          type: 'image',
          status: 'queued',
          createdAt: expect.any(Number),
        }),
      );

      expect(transaction.expire).toHaveBeenCalledWith(
        `job:${TEST_JOB_ID}`,
        config.jobTtlSeconds,
      );

      expect(transaction.lpush).toHaveBeenCalledWith(keys.queue, TEST_JOB_ID);
      expect(transaction.incr).toHaveBeenCalledWith(keys.submitted);
      expect(transaction.exec).toHaveBeenCalledTimes(1);
    });

    it('should throw HttpError when the transaction is aborted', async () => {
      createTransaction(null);

      await expect(enqueueJob('image')).rejects.toThrow(HttpError);
    });

    it('should throw HttpError when a transaction command fails', async () => {
      createTransaction([
        [new Error('Redis hset failed'), null],
        [null, 1],
        [null, 1],
        [null, 1],
      ]);

      await expect(enqueueJob('image')).rejects.toThrow('Redis hset failed');
    });

    it('should propagate Redis execution errors', async () => {
      const transaction = createTransaction([]);

      transaction.exec.mockRejectedValue(new Error('Redis connection failed'));

      await expect(enqueueJob('image')).rejects.toThrow(
        'Redis connection failed',
      );
    });
  });

  describe('getJob', () => {
    it('should return job details when the job exists', async () => {
      mockRedis.hgetall.mockResolvedValue({
        id: 'job-123',
        type: 'video',
        status: 'completed',
        createdAt: '1000',
        startedAt: '1100',
        completedAt: '1500',
        durationMs: '400',
        result: '{"url":"output.mp4"}',
        error: '',
      });

      const response = await getJob('job-123');

      expect(mockRedis.hgetall).toHaveBeenCalledWith('job:job-123');

      expect(response).toEqual({
        id: 'job-123',
        type: 'video',
        status: 'completed',
        createdAt: '1000',
        startedAt: 1100,
        completedAt: 1500,
        durationMs: 400,
        result: '{"url":"output.mp4"}',
        error: '',
      });
    });
  });

  describe('retryFailedJob', () => {
    it('should retry a failed job successfully', async () => {
      mockRedis.hgetall.mockResolvedValue({
        id: 'job-123',
        type: 'video',
        status: 'failed',
      });

      const transaction = createTransaction([
        [null, 1],
        [null, 1],
        [null, 1],
      ]);

      const response = await retryFailedJob('job-123');

      expect(response).toEqual({
        jobId: 'job-123',
        status: 'queued',
        type: 'video',
      });

      expect(mockRedis.hgetall).toHaveBeenCalledWith('job:job-123');

      expect(transaction.hset).toHaveBeenCalledWith(
        'job:job-123',
        expect.objectContaining({
          status: 'queued',
          error: '',
          retryAt: expect.any(Number),
        }),
      );

      expect(transaction.lrem).toHaveBeenCalledWith(
        keys.deadLetterQueue,
        1,
        'job-123',
      );

      expect(transaction.rpush).toHaveBeenCalledWith(keys.queue, 'job-123');
      expect(transaction.exec).toHaveBeenCalledTimes(1);
    });

    it('should throw HttpError when the job does not exist', async () => {
      mockRedis.hgetall.mockResolvedValue({});

      await expect(retryFailedJob('missing-job')).rejects.toThrow(
        'Job missing-job not found',
      );
    });

    it('should throw HttpError when the job is not failed', async () => {
      mockRedis.hgetall.mockResolvedValue({
        id: 'job-123',
        type: 'image',
        status: 'completed',
      });

      await expect(retryFailedJob('job-123')).rejects.toThrow(
        'Job job-123 cannot be retried',
      );

      expect(mockRedis.multi).not.toHaveBeenCalled();
    });

    it('should throw HttpError when the retry transaction is aborted', async () => {
      mockRedis.hgetall.mockResolvedValue({
        id: 'job-123',
        type: 'video',
        status: 'failed',
      });

      createTransaction(null);

      await expect(retryFailedJob('job-123')).rejects.toThrow(HttpError);
    });
  });
});