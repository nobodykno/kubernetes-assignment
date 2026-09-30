import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '@/lib/http-error.js';
import type { ErrorRequestHandler } from 'express';
export function notFound(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(new HttpError(404, `Route ${req.method} ${req.path} not found`));
}



export const  errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  void next;


  const error = err instanceof Error
    ? err
    : new Error('Unknown error');


  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message,
    });

  
  }


  return res.status(500).json({
    message: error.message,
  });
};

