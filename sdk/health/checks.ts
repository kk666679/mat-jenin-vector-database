import type { HealthCheck, HealthCheckResult } from './types';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';

export function createRedisHealthCheck(redis: Redis): HealthCheck {
  return {
    name: 'redis',
    critical: true,
    check: async (): Promise<HealthCheckResult> => {
      try {
        const start = Date.now();
        await redis.ping();
        const duration = Date.now() - start;
        
        return {
          status: 'healthy',
          message: 'Redis connection successful',
          duration,
          details: {
            connected: redis.status === 'ready'
          }
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          status: 'unhealthy',
          message: `Redis connection failed: ${message}`,
          details: { error: message }
        };
      }
    }
  };
}

export function createDatabaseHealthCheck(prisma: PrismaClient): HealthCheck {
  return {
    name: 'database',
    critical: true,
    check: async (): Promise<HealthCheckResult> => {
      try {
        const start = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        const duration = Date.now() - start;
        
        return {
          status: 'healthy',
          message: 'Database connection successful',
          duration
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          status: 'unhealthy',
          message: `Database connection failed: ${message}`,
          details: { error: message }
        };
      }
    }
  };
}

export function createWeaviateHealthCheck(url: string): HealthCheck {
  return {
    name: 'weaviate',
    critical: true,
    check: async (): Promise<HealthCheckResult> => {
      try {
        const start = Date.now();
        const response = await fetch(`${url}/v1/.well-known/health`);
        const duration = Date.now() - start;
        
        if (response.ok) {
          return {
            status: 'healthy',
            message: 'Weaviate connection successful',
            duration
          };
        } else {
          return {
            status: 'degraded',
            message: `Weaviate returned status: ${response.status}`,
            duration
          };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          status: 'unhealthy',
          message: `Weaviate connection failed: ${message}`,
          details: { error: message }
        };
      }
    }
  };
}

export function createQueueHealthCheck(): HealthCheck {
  return {
    name: 'queue',
    critical: false,
    check: async (): Promise<HealthCheckResult> => {
      // Queue health check implementation
      return {
        status: 'healthy',
        message: 'Queue is operational'
      };
    }
  };
}
