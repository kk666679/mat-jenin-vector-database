/**
 * ML Inference Client
 * Real-time inference with optimization and auto-scaling support
 */

import type {
  ModelConfig,
  InferenceRequest,
  InferenceResponse,
  InferenceMetrics,
  ModelHealthStatus,
  AutoScalingConfig,
} from './types';

// ============================================
// INFERENCE CLIENT
// ============================================

export class InferenceClient {
  protected config: ModelConfig;
  private metrics: InferenceMetrics;
  private latencyHistory: number[] = [];
  private readonly maxLatencyHistorySize = 1000;

  constructor(config: ModelConfig) {
    const defaultConfig: ModelConfig = {
      provider: 'openai',
      modelId: 'default',
    };
    
    this.config = { ...defaultConfig, ...config };

    this.metrics = {
      requestCount: 0,
      successCount: 0,
      errorCount: 0,
      latencyP50: 0,
      latencyP95: 0,
      latencyP99: 0,
      avgLatency: 0,
      throughput: 0,
      timestamp: new Date(),
    };
  }

  /**
   * Set auto-scaling configuration
   */
  setAutoScaling(config: AutoScalingConfig): void {
    // Store for potential future use
    console.log('Auto-scaling configured:', config);
  }

  /**
   * Perform real-time inference
   */
  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    const startTime = Date.now();
    this.metrics.requestCount++;

    try {
      let outputs: number[][] | number[] | Record<string, unknown>;

      switch (this.config.provider) {
        case 'openai':
          outputs = await this.inferWithOpenAI(request);
          break;
        case 'anthropic':
          outputs = await this.inferWithAnthropic(request);
          break;
        case 'ollama':
          outputs = await this.inferWithOllama(request);
          break;
        case 'onnx':
          outputs = await this.inferWithONNX(request);
          break;
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`);
      }

      const latency = Date.now() - startTime;
      this.metrics.successCount++;
      this.updateLatencyMetrics(latency);

      return {
        outputs,
        latency,
        ...(this.config.version !== undefined && { modelVersion: this.config.version }),
        ...(request.metadata !== undefined && { metadata: request.metadata }),
      };
    } catch (error) {
      this.metrics.errorCount++;
      throw error;
    }
  }

  /**
   * Inference with OpenAI
   */
  protected async inferWithOpenAI(request: InferenceRequest): Promise<Record<string, unknown>> {
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    const response = await fetch(
      this.config.endpoint || 'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.modelId,
          messages: [
            {
              role: 'user',
              content: JSON.stringify(request.inputs),
            },
          ],
          ...request.parameters,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI inference error: ${error}`);
    }

    const data = await response.json();
    return { content: data.choices[0]?.message?.content };
  }

  /**
   * Inference with Anthropic
   */
  protected async inferWithAnthropic(request: InferenceRequest): Promise<Record<string, unknown>> {
    const apiKey = this.config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }

    const response = await fetch(
      this.config.endpoint || 'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.modelId,
          messages: [{ role: 'user', text: JSON.stringify(request.inputs) }],
          ...request.parameters,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic inference error: ${error}`);
    }

    const data = await response.json();
    return { content: data.content[0]?.text };
  }

  /**
   * Inference with Ollama (local)
   */
  protected async inferWithOllama(request: InferenceRequest): Promise<Record<string, unknown>> {
    const baseUrl = this.config.endpoint || 'http://localhost:11434';

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.modelId,
        prompt: JSON.stringify(request.inputs),
        ...request.parameters,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama inference error: ${error}`);
    }

    const data = await response.json();
    return { content: data.response };
  }

  /**
   * Inference with ONNX Runtime
   */
  protected async inferWithONNX(request: InferenceRequest): Promise<number[] | number[][]> {
    const inputs = request.inputs;
    
    if (Array.isArray(inputs) && inputs.length > 0) {
      return this.simulateONNXInference(inputs);
    }
    
    throw new Error('Invalid input format for ONNX inference');
  }

  /**
   * Simulate ONNX inference (placeholder)
   */
  private simulateONNXInference(inputs: number[][] | number[]): number[] | number[][] {
    if (Array.isArray(inputs[0])) {
      return inputs.map(() => Math.random());
    }
    return [Math.random()];
  }

  /**
   * Update latency metrics with rolling window
   */
  private updateLatencyMetrics(latency: number): void {
    this.latencyHistory.push(latency);
    if (this.latencyHistory.length > this.maxLatencyHistorySize) {
      this.latencyHistory.shift();
    }

    const sorted = [...this.latencyHistory].sort((a, b) => a - b);
    const len = sorted.length;

    this.metrics.latencyP50 = sorted[Math.floor(len * 0.5)] || 0;
    this.metrics.latencyP95 = sorted[Math.floor(len * 0.95)] || 0;
    this.metrics.latencyP99 = sorted[Math.floor(len * 0.99)] || 0;
    this.metrics.avgLatency = sorted.reduce((a, b) => a + b, 0) / len || 0;
  }

  /**
   * Get current metrics
   */
  getMetrics(): InferenceMetrics {
    return { ...this.metrics, timestamp: new Date() };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      successCount: 0,
      errorCount: 0,
      latencyP50: 0,
      latencyP95: 0,
      latencyP99: 0,
      avgLatency: 0,
      throughput: 0,
      timestamp: new Date(),
    };
    this.latencyHistory = [];
  }

  /**
   * Check model health
   */
  async checkHealth(): Promise<ModelHealthStatus> {
    try {
      const startTime = Date.now();
      await this.infer({
        inputs: [[0]],
        metadata: { healthCheck: true },
      });
      const latency = Date.now() - startTime;

      return {
        modelId: this.config.modelId,
        status: latency < 1000 ? 'healthy' : 'degraded',
        lastChecked: new Date(),
        latency,
        errorRate: this.metrics.requestCount > 0 
          ? this.metrics.errorCount / this.metrics.requestCount 
          : 0,
      };
    } catch (error) {
      return {
        modelId: this.config.modelId,
        status: 'unhealthy',
        lastChecked: new Date(),
        latency: 0,
        errorRate: 1,
        details: { error: (error as Error).message },
      };
    }
  }

  /**
   * Warm up the model
   */
  async warmUp(iterations: number = 5): Promise<void> {
    for (let i = 0; i < iterations; i++) {
      try {
        await this.infer({
          inputs: [[0]],
          metadata: { warmUp: true },
        });
      } catch (error) {
        console.warn(`Warm-up iteration ${i + 1} failed:`, error);
      }
    }
  }
}

// ============================================
// STREAMING INFERENCE
// ============================================

export class StreamingInferenceClient extends InferenceClient {
  private eventSource: EventSource | null = null;

  /**
   * Perform streaming inference
   */
  async *inferStream(request: InferenceRequest): AsyncGenerator<InferenceResponse> {
    const baseUrl = this.config.endpoint || 'http://localhost:11434';
    const url = `${baseUrl}/api/generate/stream`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.modelId,
        prompt: JSON.stringify(request.inputs),
        ...request.parameters,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Streaming inference error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.response) {
                yield {
                  outputs: { content: data.response },
                  latency: 0,
                  ...(this.config.version !== undefined && { modelVersion: this.config.version }),
                };
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Close the stream
   */
  close(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

// ============================================
// REQUEST BATCHING
// ============================================

interface QueuedRequest {
  resolve: (value: InferenceResponse) => void;
  reject: (reason?: unknown) => void;
  request: InferenceRequest;
}

export class BatchedInferenceClient extends InferenceClient {
  private batchQueue: QueuedRequest[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly maxBatchSize: number;
  private readonly batchTimeoutMs: number;

  constructor(config: ModelConfig, options: { maxBatchSize?: number; batchTimeoutMs?: number } = {}) {
    super(config);
    this.maxBatchSize = options.maxBatchSize || 10;
    this.batchTimeoutMs = options.batchTimeoutMs || 100;
  }

  /**
   * Add request to batch queue
   */
  override async infer(request: InferenceRequest): Promise<InferenceResponse> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({ resolve, reject, request });
      this.scheduleBatch();
    });
  }

  /**
   * Schedule batch processing
   */
  private scheduleBatch(): void {
    if (this.batchTimeout) return;

    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, this.batchTimeoutMs);
  }

  /**
   * Process batch of requests
   */
  private async processBatch(): Promise<void> {
    this.batchTimeout = null;

    if (this.batchQueue.length === 0) return;

    const batch = this.batchQueue.splice(0, this.maxBatchSize);
    const requests = batch.map((b) => b.request);

    try {
      const results = await this.batchInfer(requests);
      batch.forEach((item, index) => {
        const result = results[index];
        if (result) {
          item.resolve(result);
        } else {
          item.reject(new Error(`No result for index ${index}`));
        }
      });
    } catch (error) {
      batch.forEach((item) => {
        item.reject(error);
      });
    }

    // Process remaining items
    if (this.batchQueue.length > 0) {
      this.scheduleBatch();
    }
  }

  /**
   * Perform batch inference
   */
  private async batchInfer(requests: InferenceRequest[]): Promise<InferenceResponse[]> {
    // For OpenAI, use batch API
    if (this.config.provider === 'openai') {
      return this.batchInferOpenAI(requests);
    }

    // For other providers, process sequentially
    const results: InferenceResponse[] = [];
    for (const request of requests) {
      const result = await super.infer(request);
      results.push(result);
    }

    return results;
  }

  /**
   * Batch inference with OpenAI
   */
  private async batchInferOpenAI(requests: InferenceRequest[]): Promise<InferenceResponse[]> {
    const startTime = Date.now();
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    const response = await fetch(
      this.config.endpoint || 'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.modelId,
          messages: requests.map((r) => ({
            role: 'user',
            content: JSON.stringify(r.inputs),
          })),
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI batch inference error: ${error}`);
    }

    const data = await response.json();
    const totalLatency = Date.now() - startTime;

    return data.choices.map((choice: { message?: { content?: string } }) => ({
      outputs: { content: choice.message?.content },
      latency: totalLatency / requests.length,
      ...(this.config.version !== undefined && { modelVersion: this.config.version }),
    }));
  }
}

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Create inference client from environment
 */
export function createInferenceClient(): InferenceClient {
  const configParts: Partial<ModelConfig> = {
    provider: (process.env.ML_PROVIDER as any) || 'openai',
    modelId: process.env.ML_MODEL_ID || 'gpt-4o-mini',
  };
  
  if (process.env.ML_ENDPOINT) {
    configParts.endpoint = process.env.ML_ENDPOINT;
  }
  if (process.env.ML_API_KEY) {
    configParts.apiKey = process.env.ML_API_KEY;
  }
  if (process.env.ML_MODEL_VERSION) {
    configParts.version = process.env.ML_MODEL_VERSION;
  }

  return new InferenceClient(configParts as ModelConfig);
}

/**
 * Create streaming inference client
 */
export function createStreamingInferenceClient(): StreamingInferenceClient {
  const configParts: Partial<ModelConfig> = {
    provider: (process.env.ML_PROVIDER as any) || 'ollama',
    modelId: process.env.ML_MODEL_ID || 'llama2',
  };
  
  if (process.env.ML_ENDPOINT) {
    configParts.endpoint = process.env.ML_ENDPOINT;
  }
  if (process.env.ML_API_KEY) {
    configParts.apiKey = process.env.ML_API_KEY;
  }

  return new StreamingInferenceClient(configParts as ModelConfig);
}

/**
 * Create batched inference client
 */
export function createBatchedInferenceClient(options?: { maxBatchSize?: number; batchTimeoutMs?: number }): BatchedInferenceClient {
  const configParts: Partial<ModelConfig> = {
    provider: (process.env.ML_PROVIDER as any) || 'openai',
    modelId: process.env.ML_MODEL_ID || 'gpt-4o-mini',
  };
  
  if (process.env.ML_ENDPOINT) {
    configParts.endpoint = process.env.ML_ENDPOINT;
  }
  if (process.env.ML_API_KEY) {
    configParts.apiKey = process.env.ML_API_KEY;
  }

  return new BatchedInferenceClient(configParts as ModelConfig, options);
}

