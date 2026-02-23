/**
 * ML-specific types and interfaces
 * Based on machine-learning-engineer skill
 */

import { z } from 'zod';

// ============================================
// INFERENCE TYPES
// ============================================

export const ModelProviderSchema = z.enum(['openai', 'anthropic', 'ollama', 'onnx', 'tensorrt']);
export type ModelProvider = z.infer<typeof ModelProviderSchema>;

export const InferenceModeSchema = z.enum(['realtime', 'batch', 'streaming']);
export type InferenceMode = z.infer<typeof InferenceModeSchema>;

export interface ModelConfig {
  provider: ModelProvider;
  modelId: string;
  modelPath?: string;
  endpoint?: string;
  apiKey?: string;
  version?: string;
}

export interface InferenceRequest {
  inputs: number[][] | number[] | Record<string, unknown>;
  parameters?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface InferenceResponse {
  outputs: number[][] | number[] | Record<string, unknown>;
  latency: number;
  modelVersion?: string;
  metadata?: Record<string, unknown>;
}

export interface BatchInferenceRequest {
  items: InferenceRequest[];
  batchSize?: number;
}

export interface BatchInferenceResponse {
  results: InferenceResponse[];
  totalLatency: number;
  failedCount: number;
}

// ============================================
// MODEL OPTIMIZATION TYPES
// ============================================

export const QuantizationTypeSchema = z.enum(['fp32', 'fp16', 'int8', 'int4']);
export type QuantizationType = z.infer<typeof QuantizationTypeSchema>;

export interface OptimizationConfig {
  quantization?: QuantizationType;
  pruning?: boolean;
  pruningRatio?: number;
  knowledgeDistillation?: boolean;
  onnxExport?: boolean;
  tensorrtEnabled?: boolean;
  graphOptimization?: boolean;
}

export interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  sizeReduction: number;
  estimatedLatency?: number;
  outputPath: string;
}

// ============================================
// MODEL REGISTRY TYPES
// ============================================

export const ModelStatusSchema = z.enum(['development', 'staging', 'production', 'deprecated']);
export type ModelStatus = z.infer<typeof ModelStatusSchema>;

export interface ModelMetadata {
  id: string;
  name: string;
  version: string;
  status: ModelStatus;
  description?: string;
  framework: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  metrics?: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisteredModel {
  metadata: ModelMetadata;
  config: ModelConfig;
  endpoints: {
    realtime?: string;
    batch?: string;
    grpc?: string;
  };
}

// ============================================
// MONITORING TYPES
// ============================================

export interface InferenceMetrics {
  requestCount: number;
  successCount: number;
  errorCount: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  avgLatency: number;
  throughput: number;
  timestamp: Date;
}

export interface ModelHealthStatus {
  modelId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastChecked: Date;
  latency: number;
  errorRate: number;
  details?: Record<string, unknown>;
}

// ============================================
// AUTO-SCALING TYPES
// ============================================

export const ScalingMetricSchema = z.enum(['cpu', 'gpu', 'memory', 'request_rate', 'queue_length']);
export type ScalingMetric = z.infer<typeof ScalingMetricSchema>;

export interface AutoScalingConfig {
  enabled: boolean;
  minReplicas: number;
  maxReplicas: number;
  targetMetric: ScalingMetric;
  targetValue: number;
  scaleUpCooldownSeconds: number;
  scaleDownCooldownSeconds: number;
}

// ============================================
// DEPLOYMENT TYPES
// ============================================

export const DeploymentStrategySchema = z.enum(['blue_green', 'canary', 'rolling', 'shadow']);
export type DeploymentStrategy = z.infer<typeof DeploymentStrategySchema>;

export interface DeploymentConfig {
  strategy: DeploymentStrategy;
  trafficSplit?: number;
  shadowMode?: boolean;
  canaryPercentage?: number;
}

// ============================================
// EDGE DEPLOYMENT TYPES
// ============================================

export const EdgeTargetSchema = z.enum(['ios', 'android', 'web', 'embedded', 'raspberry_pi']);
export type EdgeTarget = z.infer<typeof EdgeTargetSchema>;

export interface EdgeDeploymentConfig {
  target: EdgeTarget;
  quantization: QuantizationType;
  maxSizeMb: number;
  runtime: 'coreml' | 'tflite' | 'onnxruntime' | 'tensorrt';
  offlineCapable: boolean;
}

// ============================================
// PIPELINE TYPES
// ============================================

export const PipelineStageSchema = z.enum([
  'data_preprocessing',
  'feature_extraction',
  'inference',
  'post_processing',
  'validation'
]);
export type PipelineStage = z.infer<typeof PipelineStageSchema>;

export interface PipelineConfig {
  stages: PipelineStage[];
  parallelExecution?: boolean;
  errorHandling?: 'fail_fast' | 'continue' | 'retry';
}

export interface PipelineResult {
  stageResults: Record<PipelineStage, unknown>;
  totalLatency: number;
  success: boolean;
  errors?: string[];
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const InferenceRequestSchema = z.object({
  inputs: z.union([
    z.array(z.array(z.number())),
    z.array(z.number()),
    z.record(z.string(), z.unknown())
  ]),
  parameters: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const InferenceResponseSchema = z.object({
  outputs: z.union([
    z.array(z.array(z.number())),
    z.array(z.number()),
    z.record(z.string(), z.unknown())
  ]),
  latency: z.number(),
  modelVersion: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const OptimizationConfigSchema = z.object({
  quantization: QuantizationTypeSchema.optional(),
  pruning: z.boolean().optional(),
  pruningRatio: z.number().gte(0).lte(1).optional(),
  knowledgeDistillation: z.boolean().optional(),
  onnxExport: z.boolean().optional(),
  tensorrtEnabled: z.boolean().optional(),
  graphOptimization: z.boolean().optional(),
});

export const AutoScalingConfigSchema = z.object({
  enabled: z.boolean(),
  minReplicas: z.number().min(1, 'minReplicas must be at least 1'),
  maxReplicas: z.number().min(1, 'maxReplicas must be at least 1'),
  targetMetric: ScalingMetricSchema,
  targetValue: z.number(),
  scaleUpCooldownSeconds: z.number().min(0, 'scaleUpCooldownSeconds must be non-negative'),
  scaleDownCooldownSeconds: z.number().min(0, 'scaleDownCooldownSeconds must be non-negative'),
});

// ============================================
// EXPORTS
// ============================================

// Re-export from submodules for convenience
export {
  InferenceClient,
  StreamingInferenceClient,
  BatchedInferenceClient,
  createInferenceClient,
  createStreamingInferenceClient,
  createBatchedInferenceClient,
} from './inference';

export {
  ModelOptimizer,
  quantizeTensor,
  dequantizeTensor,
  pruneWeights,
  calculatePruningThreshold,
  distillationLoss,
  convertToONNX,
  optimizeONNX,
  createModelOptimizer,
  type ONNXConversionConfig,
  type TensorRTConfig,
} from './optimization';

export {
  BatchProcessor,
  ParallelBatchProcessor,
  JobScheduler,
  DataPartitioner,
  ResultAggregator,
  createBatchProcessor,
  createParallelBatchProcessor,
  createJobScheduler,
  type BatchJobConfig,
  type BatchProgress,
  type BatchJobResult,
  type ScheduledJob,
} from './batch';

export {
  ModelRegistry,
  ModelRouter,
  ModelLoader,
  createModelRegistry,
  createModelRouter,
  type RoutingRule,
  type RoutingRequest,
  type RoutingInfo,
} from './registry';

export {
  MetricsCollector,
  HealthChecker,
  AlertManager,
  CircuitBreaker,
  ObservableClient,
  createMetricsCollector,
  createHealthChecker,
  createAlertManager,
  createCircuitBreaker,
  type AlertRule,
  type Alert,
  type CircuitBreakerConfig,
} from './monitoring';

