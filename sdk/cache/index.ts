/**
 * Cache package for Redis caching utilities
 */

import Redis from 'ioredis';

// ============================================
// CACHE KEYS
// ============================================

export const CACHE_KEYS = {
  tenant: (tenantId: string) => `tenant:${tenantId}`,
  user: (userId: string) => `user:${userId}`,
  document: (documentId: string) => `document:${documentId}`,
  rateLimit: (identifier: string) => `ratelimit:${identifier}`,
  searchResults: (tenantId: string, query: string) => `search:${tenantId}:${query}`,
  usageMetrics: (tenantId: string, period: string) => `metrics:${tenantId}:${period}`,
} as const;

// ============================================
// REDIS CLIENT
// ============================================

let redisClient: Redis | null = null;

/**
 * Get or create Redis client
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    // Support both REDIS_URL (from docker-compose) and individual REDIS_HOST/PORT
    const redisUrl = process.env.REDIS_URL;
    
    if (redisUrl) {
      redisClient = new Redis(redisUrl, {
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });
    } else {
      redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });
    }
    
    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }
  
  return redisClient;
}

/**
 * Close Redis connection
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// ============================================
// CACHE OPERATIONS
// ============================================

export interface CacheOptions {
  /**
   * Time to live in seconds
   */
  ttl?: number;
  /**
   * If true, won't throw on cache errors
   */
  silent?: boolean;
}

/**
 * Get value from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set value in cache
 */
export async function setCache<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
  try {
    const client = getRedisClient();
    const serialized = JSON.stringify(value);
    
    if (options.ttl) {
      await client.setex(key, options.ttl, serialized);
    } else {
      await client.set(key, serialized);
    }
  } catch (error) {
    if (!options.silent) {
      console.error('Cache set error:', error);
    }
  }
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

/**
 * Delete keys matching pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    console.error('Cache pattern delete error:', error);
  }
}

// ============================================
// RATE LIMITING
// ============================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit using sliding window
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const client = getRedisClient();
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  
  const key = CACHE_KEYS.rateLimit(identifier);
  
  // Remove old entries
  await client.zremrangebyscore(key, 0, windowStart);
  
  // Count current requests
  const count = await client.zcard(key);
  
  if (count >= maxRequests) {
    // Get oldest entry to calculate reset time
    const oldest = await client.zrange(key, 0, 0, 'WITHSCORES');
    const resetAt = oldest.length > 1 ? parseInt(oldest[1] || '0') + windowSeconds * 1000 : now + windowSeconds * 1000;
    
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }
  
  // Add new request
  await client.zadd(key, now, `${now}-${Math.random()}`);
  await client.expire(key, windowSeconds);
  
  return {
    allowed: true,
    remaining: maxRequests - count - 1,
    resetAt: now + windowSeconds * 1000,
  };
}

// ============================================
// LOCKS
// ============================================

/**
 * Try to acquire a lock
 */
export async function tryLock(
  key: string,
  ttlSeconds: number = 10
): Promise<boolean> {
  const client = getRedisClient();
  const result = await client.set(key, '1', 'EX', ttlSeconds, 'NX');
  return result === 'OK';
}

/**
 * Release a lock
 */
export async function releaseLock(key: string): Promise<void> {
  const client = getRedisClient();
  await client.del(key);
}

// ============================================
// CACHE HELPERS
// ============================================

/**
 * Cache with tenant isolation
 */
export async function getTenantCache<T>(tenantId: string, key: string): Promise<T | null> {
  return getCache<T>(`${tenantId}:${key}`);
}

export async function setTenantCache<T>(
  tenantId: string,
  key: string,
  value: T,
  options?: CacheOptions
): Promise<void> {
  return setCache(`${tenantId}:${key}`, value, options);
}

export async function deleteTenantCache(tenantId: string, key: string): Promise<void> {
  return deleteCache(`${tenantId}:${key}`);
}

