export * from './agent.types';
export * from './workflow.types';
export * from './queue.types';
export * from './ml.types';

export interface OpenClawConfig {
  version: string;
  environment: 'development' | 'production' | 'staging';
  agentSystem: AgentSystemConfig;
  queue: QueueConfig;
  ml: MLConfig;
  monitoring: MonitoringConfig;
  logging: LoggingConfig;
  security: SecurityConfig;
}

export interface AgentSystemConfig {
  maxConcurrentTasks: number;
  taskTimeout: number;
  enableParallelExecution: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
  backoffDelay: number;
}

export interface QueueConfig {
  concurrency: number;
  maxAttempts: number;
  removeOnComplete: number;
  removeOnFail: number;
  stalledInterval: number;
  maxStalledCount: number;
}

export interface MLConfig {
  embeddingModel: string;
  textGenerationModel: string;
  summarizationModel: string;
  qaModel: string;
  batchSize: number;
  cacheEnabled: boolean;
  cacheTTL: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsInterval: number;
  alertThresholds: {
    errorRate: number;
    queueLength: number;
    responseTime: number;
  };
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  pretty: boolean;
  timestampFormat: string;
  includeMetadata: boolean;
}

export interface SecurityConfig {
  encryptionKey: string;
  enableAudit: boolean;
  maxTokenSize: number;
}
