import type { z } from 'zod';

export interface ValidationSchema {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
}