import type { Request, Response } from 'express';
import { config } from '@/config.js';
import { HttpError } from '@/lib/http-error.js';
import FILE_CONSTANTS from 'shared/constants';


export function proxyGet(serviceName: string, baseUrl: string, targetPath: string) {
  return async (req: Request, res: Response): Promise<void> => {
    const queryIndex = req.url.indexOf('?');
    const query = queryIndex === -1 ? '' : req.url.slice(queryIndex);
    const url = new URL(targetPath + query, baseUrl);

    const upstream = await fetchUpstream(serviceName, url, req.requestId);

    res.status(upstream.status);
    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);
    res.send(await upstream.json());
  };
}

async function fetchUpstream(
  serviceName: string,
  url: URL,
  requestId: string,
): Promise<globalThis.Response> {
  try {
    return await fetch(url, {
      headers: {
        accept: 'application/json',
        'x-request-id': requestId,
      },
      signal: AbortSignal.timeout(config.upstreamTimeoutMs),
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      throw new HttpError(FILE_CONSTANTS.HTTP_STATUS.GATEWAY_TIMEOUT, `${serviceName} service did not respond in time`);
    }
    throw new HttpError(FILE_CONSTANTS.HTTP_STATUS.BAD_GATEWAY, `${serviceName} service is unavailable`);
  }
}
