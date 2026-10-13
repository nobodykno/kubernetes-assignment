
import request from 'supertest';

const API_URL = process.env.TEST_API_URL ?? 'http://localhost';

describe('Jobs API Integration Tests', () => {
  let jobId: string;

  it('POST /v1/jobs/submit - should submit a job', async () => {
    const response = await request(API_URL)
      .post('/v1/jobs/submit')
      .send({ type: 'primes' });

    console.log('Submit status:', response.status);
    console.log('Submit response:', response.text);

    expect(response.status).toBe(201);
    expect(response.body.jobId).toBeDefined();

    jobId = response.body.jobId;
  });

  it('GET /v1/jobs/:id - should return job status', async () => {
    expect(jobId).toBeDefined();

    const response = await request(API_URL)
      .get(`/v1/jobs/${jobId}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBeDefined();
  });

  const retryTest = process.env.TEST_FAILED_JOB_ID ? it : it.skip;

  retryTest('POST /v1/jobs/retry/:id - should retry a failed job', async () => {
    const failedJobId = process.env.TEST_FAILED_JOB_ID!;

    const response = await request(API_URL)
      .post(`/v1/jobs/retry/${failedJobId}`);

    expect(response.status).toBe(200);
  });
});
