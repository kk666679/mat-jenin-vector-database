import { NextRequest, NextResponse } from 'next/server';
import type { Logger } from '../logger/types';

export function loggingMiddleware(logger: Logger) {
  return async function(req: NextRequest) {
    const startTime = Date.now();
    const method = req.method;
    const url = req.url;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';

    logger.info(`Request started: ${method} ${url}`, { ip });

    // Add request ID header for tracing
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const response = NextResponse.next();
    response.headers.set('X-Request-ID', requestId);

    // Log response
    const duration = Date.now() - startTime;
    logger.info(`Request completed: ${method} ${url} (${duration}ms)`, {
      ip,
      duration,
      statusCode: response.status
    });

    return response;
  };
}
