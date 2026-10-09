import logs from 'shared/logs';
import morgan from 'morgan';
import type { Request } from 'express';

morgan.token('request-id', (req) => {
  const request = req as Request;

  return request.requestId;
});

const stream = {
  write: (message: string): void => {
    logs.logger.http(message.trim());
  },
};

export const requestLogger = morgan(
  ':date[iso] :method :url :status :response-time ms requestId=:request-id',
  { stream }
);