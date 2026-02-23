/**
 * ML SDK - Machine Learning Tools
 * Based on machine-learning-engineer skill
 * 
 * Provides ML model deployment, production serving infrastructure,
 * optimization strategies, and real-time inference systems.
 */

// ============================================
// TYPES
// ============================================

// Re-export all types
export * from './types';

// ============================================
// INFERENCE
// ============================================

export {
  InferenceClient,
  StreamingInferenceClient,
  BatchedInferenceClient,
  createInferenceClient,
  createStreamingInferenceClient,
  createBatchedInferenceClient,
} from './inference';

// ============================================
// OPTIMIZATION
// ============================================

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

// ============================================
// BATCH PROCESSING
// ============================================

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

// ============================================
// REGISTRY
// ============================================

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

// ============================================
// MONITORING
// ============================================

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

// ============================================
// DEFAULT CONFIGURATION
// ============================================

/**
 * Default ML configuration from environment
 */
export interface MLConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'onnx' | 'tensorrt';
  modelId: string;
  endpoint?: string;
  apiKey?: string;
  quantization?: 'fp32' | 'fp16' | 'int8' | 'int4';
  autoScale?: boolean;
  batchSize?: number;
}

/**
 * Get ML configuration from environment
 */
export function getMLConfig(): MLConfig {
  const config: MLConfig = {
    provider: (process.env.ML_PROVIDER as MLConfig['provider']) || 'openai',
    modelId: process.env.ML_MODEL_ID || 'gpt-4o-mini',
    quantization: (process.env.ML_QUANTIZATION as MLConfig['quantization']) || 'fp16',
    autoScale: process.env.ML_AUTO_SCALE === 'true',
    batchSize: parseInt(process.env.ML_BATCH_SIZE || '10'),
  };

  if (process.env.ML_ENDPOINT) {
    config.endpoint = process.env.ML_ENDPOINT;
  }
  if (process.env.ML_API_KEY) {
    config.apiKey = process.env.ML_API_KEY;
  }

  return config;
}

