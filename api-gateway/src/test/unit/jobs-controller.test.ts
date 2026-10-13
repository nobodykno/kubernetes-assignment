
import { jest } from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';

import type { IJobId, IPostJobRequest } from '@/dto/request/job.js';
import type { IJob, IPostJobResponse } from '@/dto/response/job.js';

const mockEnqueueJob =
  jest.fn<(type: IPostJobRequest['type']) => Promise<IPostJobResponse>>();

const mockGetJob = jest.fn<(id: string) => Promise<IJob>>();

const mockRetryFailedJob =
  jest.fn<(id: string) => Promise<IPostJobResponse>>();

const mockLogSuccess = jest.fn();
const mockLogError = jest.fn();

jest.unstable_mockModule('@/service/job-service.js', () => ({
  enqueueJob: mockEnqueueJob,
  getJob: mockGetJob,
  retryFailedJob: mockRetryFailedJob,
}));

jest.unstable_mockModule('shared/logs', () => ({
  default: {
    logSuccess: mockLogSuccess,
    logError: mockLogError,
  },
}));

// Import the controller after registering the ESM mocks.
const { default: jobController } = await import(
  '@/controller/job-controller.js'
);

describe('jobController', () => {
  let res: {
    status: jest.Mock;
    json: jest.Mock;
  };

  let next: jest.Mock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    res = {
      status: jest.fn(),
      json: jest.fn(),
    };

    res.status.mockReturnValue(res);
    next = jest.fn();
  });

  describe('submitWorkerType', () => {
    const submittedJob = {
      jobId: 'job-123',
      type: 'primes',
      status: 'queued',
    } satisfies IPostJobResponse;

    const createRequest = () =>
      ({
        body: { type: 'primes' },
      }) as Request<object, IPostJobResponse, IPostJobRequest>;

    it('should enqueue a job and return 201', async () => {
      mockEnqueueJob.mockResolvedValue(submittedJob);

      await jobController.submitWorkerType(
        createRequest(),
        res as unknown as Response<IPostJobResponse>,
        next as NextFunction,
      );

      expect(mockEnqueueJob).toHaveBeenCalledTimes(1);
      expect(mockEnqueueJob).toHaveBeenCalledWith('primes');

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(submittedJob);

      expect(mockLogSuccess).toHaveBeenCalledTimes(1);
      expect(mockLogError).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should pass the error to next when enqueueing fails', async () => {
      const error = new Error('Redis unavailable');

      mockEnqueueJob.mockRejectedValue(error);

      await jobController.submitWorkerType(
        createRequest(),
        res as unknown as Response<IPostJobResponse>,
        next as NextFunction,
      );

      expect(mockEnqueueJob).toHaveBeenCalledWith('primes');
      expect(mockLogError).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getJobStatus', () => {
    const job = {
      id: 'job-123',
      type: 'primes',
      status: 'completed',
      createdAt: new Date().toISOString(),
    } satisfies IJob;

    const createRequest = () =>
      ({
        params: { id: 'job-123' },
      }) as Request<IJobId, IJob, object>;

    it('should return the job status with 200', async () => {
      mockGetJob.mockResolvedValue(job);

      await jobController.getJobStatus(
        createRequest(),
        res as unknown as Response<IJob>,
        next as NextFunction,
      );

      expect(mockGetJob).toHaveBeenCalledTimes(1);
      expect(mockGetJob).toHaveBeenCalledWith('job-123');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(job);

      expect(mockLogSuccess).toHaveBeenCalledTimes(1);
      expect(mockLogError).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should pass the error to next when fetching the job fails', async () => {
      const error = new Error('Job lookup failed');

      mockGetJob.mockRejectedValue(error);

      await jobController.getJobStatus(
        createRequest(),
        res as unknown as Response<IJob>,
        next as NextFunction,
      );

      expect(mockGetJob).toHaveBeenCalledWith('job-123');
      expect(mockLogError).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('retryJob', () => {
    const retriedJob = {
      jobId: 'job-123',
      type: 'primes',
      status: 'queued',
    } satisfies IPostJobResponse;

    const createRequest = () =>
      ({
        params: { id: 'job-123' },
      }) as Request<IJobId, IPostJobResponse, object>;

    it('should retry the job and return 200', async () => {
      mockRetryFailedJob.mockResolvedValue(retriedJob);

      await jobController.retryJob(
        createRequest(),
        res as unknown as Response<IPostJobResponse>,
        next as NextFunction,
      );

      expect(mockRetryFailedJob).toHaveBeenCalledTimes(1);
      expect(mockRetryFailedJob).toHaveBeenCalledWith('job-123');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(retriedJob);

      expect(mockLogSuccess).toHaveBeenCalledTimes(1);
      expect(mockLogError).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should pass the error to next when retrying fails', async () => {
      const error = new Error('Retry failed');

      mockRetryFailedJob.mockRejectedValue(error);

      await jobController.retryJob(
        createRequest(),
        res as unknown as Response<IPostJobResponse>,
        next as NextFunction,
      );

      expect(mockRetryFailedJob).toHaveBeenCalledWith('job-123');
      expect(mockLogError).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
