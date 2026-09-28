import type { NextFunction, Request, Response } from 'express';
import { config } from '@/config.js';

const QUIET_PATHS = new Set(['/health', '/ready']);

/** Logs one JSON line per request when the response has been sent. */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (!config.logRequests || QUIET_PATHS.has(req.path)) {
    next();
    return;
  }

  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    console.log(
      JSON.stringify({
        time: new Date().toISOString(),
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Math.round(durationMs * 10) / 10,
      }),
    );
  });

  next();
}
