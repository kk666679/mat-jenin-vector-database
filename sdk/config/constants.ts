export const CONSTANTS = {
  // Timeouts
  DEFAULT_TASK_TIMEOUT: 30000,
  DEFAULT_WORKFLOW_TIMEOUT: 300000,
  DEFAULT_QUEUE_TIMEOUT: 60000,
  
  // Retry
  MAX_RETRIES: 3,
  RETRY_BACKOFF: 1000,
  
  // Queue
  MAX_QUEUE_SIZE: 10000,
  QUEUE_CONCURRENCY: 10,
  
  // ML
  EMBEDDING_DIMENSIONS: 384,
  DEFAULT_BATCH_SIZE: 32,
  
  // Models
  DEFAULT_EMBEDDING_MODEL: 'Xenova/all-MiniLM-L6-v2',
  DEFAULT_TEXT_GENERATION_MODEL: 'Xenova/gpt2',
  DEFAULT_SUMMARIZATION_MODEL: 'Xenova/distilbart-cnn-6-6',
  DEFAULT_QA_MODEL: 'Xenova/distilbert-base-uncased-distilled-squad',
  
  // Cache
  CACHE_TTL: 3600,
  MAX_CACHE_SIZE: 1000,
  
  // Logging
  LOG_MAX_SIZE: '100m',
  LOG_MAX_FILES: 7,
  
  // API
  API_CORS_ORIGINS: ['http://localhost:3000', 'https://*.matjenin.com'],
  API_RATE_LIMIT: 60,
  
  // Monitoring
  METRICS_RETENTION: 7 * 24 * 60 * 60 * 1000, // 7 days
  ALERT_COOLDOWN: 300,
  
  // Security
  JWT_EXPIRY: '7d',
  TOKEN_MAX_SIZE: 4096
} as const;

export type Constants = typeof CONSTANTS;
