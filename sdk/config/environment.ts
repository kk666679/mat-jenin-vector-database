export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'staging' | 'production';
  REDIS_URL: string;
  WEAVIATE_URL: string;
  DATABASE_URL: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  WORKER_CONCURRENCY: number;
  STATUS_INTERVAL: number;
  API_PORT: number;
  API_PREFIX: string;
  ENABLE_MONITORING: boolean;
  METRICS_INTERVAL: number;
  DEBUG: boolean;
  PROFILE: boolean;
  JWT_SECRET?: string;
  ENCRYPTION_KEY?: string;
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    NODE_ENV: (process.env.NODE_ENV as EnvironmentConfig['NODE_ENV']) || 'development',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    WEAVIATE_URL: process.env.WEAVIATE_URL || 'http://localhost:8080',
    DATABASE_URL: process.env.DATABASE_URL || '',
    LOG_LEVEL: (process.env.LOG_LEVEL as EnvironmentConfig['LOG_LEVEL']) || 'info',
    WORKER_CONCURRENCY: parseInt(process.env.WORKER_CONCURRENCY || '10', 10),
    STATUS_INTERVAL: parseInt(process.env.STATUS_INTERVAL || '60000', 10),
    API_PORT: parseInt(process.env.API_PORT || '3000', 10),
    API_PREFIX: process.env.API_PREFIX || '/api/openclaw',
    ENABLE_MONITORING: process.env.ENABLE_MONITORING === 'true',
    METRICS_INTERVAL: parseInt(process.env.METRICS_INTERVAL || '60000', 10),
    DEBUG: process.env.DEBUG === 'true',
    PROFILE: process.env.PROFILE === 'true',
  };

  if (process.env.JWT_SECRET) {
    config.JWT_SECRET = process.env.JWT_SECRET;
  }

  if (process.env.ENCRYPTION_KEY) {
    config.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
  }

  return config;
}
