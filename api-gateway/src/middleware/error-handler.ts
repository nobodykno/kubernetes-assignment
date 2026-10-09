import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '@/lib/http-error.js';
import type { ErrorRequestHandler } from 'express';
import logError from '@/logger/error-logger.js';
import FILE_CONSTANTS from 'shared/constants';

/**
 * Global route not found error.
 *
 *
 * @param err - The error thrown by the application.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Express next middleware function.
 * @returns A JSON response containing the error message.
 */

export function notFound(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(new HttpError(FILE_CONSTANTS.HTTP_STATUS.NOT_FOUND, `Route ${req.method} ${req.path} not found`));
}

/**
 * Global error handling middleware.
 *
 *
 * @param err - The error thrown by the application.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Express next middleware function.
 * @returns A JSON response containing the error message.
 */

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

  logError({
    action: FILE_CONSTANTS.MESSAGES.ACTION.UNHANDLED_ERROR,
    module: FILE_CONSTANTS.MESSAGES.MODULE.GLOBAL_ERROR,
    message: error.message,
    errorName: error.name,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    data: err,
  });

  return res.status(FILE_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: error.message,
  });
};

