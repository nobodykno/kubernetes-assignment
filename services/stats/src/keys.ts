import { config } from '@/config.js';



export const keys = {

  queue: config.queueName,

  submitted: 'stats:submitted',

  completed: 'stats:completed',

  failed: 'stats:failed',

  totalDurationMs: 'stats:total_duration_ms',
} as const;
