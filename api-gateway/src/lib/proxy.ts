import type { Request, Response } from 'express';
import { config } from '@/config.js';
import { HttpError } from '@/lib/http-error.js';


export function proxyGet(serviceName: string, baseUrl: string, targetPath: string) {
  return async (req: Request, res: Response): Promise<void> => {
    // Keep the client's query string, e.g. /stats?foo=bar
    const queryIndex = req.url.indexOf('?');
    const query = queryIndex === -1 ? '' : req.url.slice(queryIndex);
    const url = new URL(targetPath + query, baseUrl);

    const upstream = await fetchUpstream(serviceName, url, req.requestId);

    res.status(upstream.status);
    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);
    res.send(await upstream.text());
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
      throw new HttpError(504, `${serviceName} service did not respond in time`);
    }
    throw new HttpError(502, `${serviceName} service is unavailable`);
  }
}
