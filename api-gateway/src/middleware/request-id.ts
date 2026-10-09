import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
/** 
 * Add each request with particular random UUID
 * 
 * @param req check ths request url and add the request id
 * @param res it set header with request id
 * @param next 
 */

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.get('x-request-id');
  req.requestId = incoming && incoming.length <= 128 ? incoming : randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
}
