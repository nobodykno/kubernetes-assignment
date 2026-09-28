import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '@/lib/http-error.js';

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new HttpError(404, `Route ${req.method} ${req.path} not found`));
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
): void {
  let status = 500;
  let message = 'Internal server error';

  if (err instanceof HttpError) {
    status = err.status;
    message = err.message;
  } else if (hasStatus(err) && err.status < 500) {
    status = err.status;
    message = 'Bad request';
  }

  if (status >= 500) {
    console.error(`[${req.requestId}] ${req.method} ${req.originalUrl} failed:`, err);
  }

  res.status(status).json({ error: message, requestId: req.requestId });
}

function hasStatus(err: unknown): err is { status: number } {
  return typeof err === 'object' && err !== null && 'status' in err && typeof err.status === 'number';
}
