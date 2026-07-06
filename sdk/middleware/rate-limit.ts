import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

export interface RateLimitConfig {
  redis: Redis;
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

export function rateLimitMiddleware(config: RateLimitConfig) {
  const { redis, windowMs, maxRequests, keyPrefix } = config;

  return async function(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'anonymous';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Remove old requests
      await redis.zremrangebyscore(key, 0, windowStart);
      
      // Count requests in current window
      const count = await redis.zcard(key);
      
      if (count >= maxRequests) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );
      }

      // Add current request
      await redis.zadd(key, now, `${now}`);
      await redis.expire(key, Math.ceil(windowMs / 1000));

      return NextResponse.next();
    } catch (error) {
      console.error('Rate limit error:', error);
      return NextResponse.next();
    }
  };
}
