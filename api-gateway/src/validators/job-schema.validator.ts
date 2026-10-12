/**
 * Schema validation function for zod
 */
import { z } from 'zod';
const jobSchema = {
  body: z
    .object({
      type: z.enum(['primes', 'sort', 'bcrypt'], {
        error: 'Type must be one of: prime, sort, bcrypt',
      }),
    })
    .strict(),
};



const getJobSchema = {
  params: z
    .object({
      id: z.uuid({
        error: 'Id must be a valid UUID',
      }),
    })
    .strict(),
};



const schema= {
  jobSchema,
  getJobSchema
};

export default schema;