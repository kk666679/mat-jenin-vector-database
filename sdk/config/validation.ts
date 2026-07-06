import { z } from 'zod';

export const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  REDIS_URL: z.string().url(),
  WEAVIATE_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
  WORKER_CONCURRENCY: z.number().int().positive(),
  STATUS_INTERVAL: z.number().int().positive(),
  API_PORT: z.number().int().positive(),
  API_PREFIX: z.string(),
  ENABLE_MONITORING: z.boolean(),
  METRICS_INTERVAL: z.number().int().positive(),
  DEBUG: z.boolean(),
  PROFILE: z.boolean(),
  JWT_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional()
});

export function validateEnvironment(config: any): boolean {
  try {
    EnvironmentSchema.parse(config);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:', error.issues);
    }
    return false;
  }
}
