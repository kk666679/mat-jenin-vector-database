import { z } from 'zod';

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().optional(),
  
  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  // Weaviate (Vector DB)
  WEAVIATE_URL: z.string().default('http://localhost:8080'),
  WEAVIATE_API_KEY: z.string().optional(),
  
  // LLM / OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().default('https://api.openai.com/v1'),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  OLLAMA_BASE_URL: z.string().default('http://localhost:11434'),
  LLM_PROVIDER: z.enum(['openai', 'ollama', 'azure']).default('openai'),
  
  // Azure OpenAI
  AZURE_OPENAI_API_KEY: z.string().optional(),
  AZURE_OPENAI_ENDPOINT: z.string().optional(),
  AZURE_OPENAI_DEPLOYMENT: z.string().optional(),
  
  // Auth
  JWT_SECRET: z.string().default('dev-secret-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.number().default(60000), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: z.number().default(100),
  
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.number().default(3000),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Monitoring
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
  
  // Embeddings
  EMBEDDING_MODEL: z.string().default('Xenova/all-MiniLM-L6-v2'),
  EMBEDDING_DIMENSIONS: z.number().default(384),
  
  // Document Processing
  CHUNK_SIZE: z.number().default(1000),
  CHUNK_OVERLAP: z.number().default(200),
  MAX_FILE_SIZE_MB: z.number().default(50),
  
  // Search
  DEFAULT_TOP_K: z.number().default(5),
  SIMILARITY_THRESHOLD: z.number().default(0.7),
});

export type EnvConfig = z.infer<typeof envSchema>;

// Global config object
let config: EnvConfig | null = null;

/**
 * Get environment configuration
 * Validates all required variables and provides defaults
 */
export function getConfig(): EnvConfig {
  if (config) return config;
  
  config = envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    WEAVIATE_URL: process.env.WEAVIATE_URL,
    WEAVIATE_API_KEY: process.env.WEAVIATE_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
    LLM_PROVIDER: process.env.LLM_PROVIDER,
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS) : undefined,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) : undefined,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT ? parseInt(process.env.PORT) : undefined,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    EMBEDDING_MODEL: process.env.EMBEDDING_MODEL,
    EMBEDDING_DIMENSIONS: process.env.EMBEDDING_DIMENSIONS ? parseInt(process.env.EMBEDDING_DIMENSIONS) : undefined,
    CHUNK_SIZE: process.env.CHUNK_SIZE ? parseInt(process.env.CHUNK_SIZE) : undefined,
    CHUNK_OVERLAP: process.env.CHUNK_OVERLAP ? parseInt(process.env.CHUNK_OVERLAP) : undefined,
    MAX_FILE_SIZE_MB: process.env.MAX_FILE_SIZE_MB ? parseInt(process.env.MAX_FILE_SIZE_MB) : undefined,
    DEFAULT_TOP_K: process.env.DEFAULT_TOP_K ? parseInt(process.env.DEFAULT_TOP_K) : undefined,
    SIMILARITY_THRESHOLD: process.env.SIMILARITY_THRESHOLD ? parseFloat(process.env.SIMILARITY_THRESHOLD) : undefined,
  });
  
  return config;
}

/**
 * Validate config and throw if invalid
 */
export function validateConfig(): EnvConfig {
  try {
    return getConfig();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e: z.ZodIssue) => e.path.join('.')).join(', ');
      throw new Error(`Missing or invalid environment variables: ${missingVars}`);
    }
    throw error;
  }
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getConfig().NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getConfig().NODE_ENV === 'development';
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  return getConfig().NODE_ENV === 'test';
}

