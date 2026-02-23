/**
 * ML Batch Prediction System
 * Based on machine-learning-engineer skill - Batch Prediction Systems
 */

import type { InferenceRequest, InferenceResponse } from './types';
import { InferenceClient } from './inference';

// ============================================
// BATCH PROCESSOR
// ============================================

export interface BatchJobConfig {
  batchSize: number;
  maxRetries: number;
  retryDelayMs: number;
  timeoutMs: number;
  onProgress?: (progress: BatchProgress) => void;
}

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  progressPercent: number;
  estimatedTimeRemainingMs?: number;
}

export interface BatchJobResult {
  results: InferenceResponse[];
  failedItems: Array<{ index: number; error: string }>;
  totalLatencyMs: number;
  throughput: number;
}

/**
 * Process batch predictions with parallel execution
 */
export class BatchProcessor {
  private client: InferenceClient;
  private config: BatchJobConfig;

  constructor(client: InferenceClient, config?: Partial<BatchJobConfig>) {
    this.client = client;
    this.config = {
      batchSize: 10,
      maxRetries: 3,
      retryDelayMs: 1000,
      timeoutMs: 60000,
      ...config,
    };
  }

  /**
   * Process a batch of items
   */
  async processBatch(requests: InferenceRequest[]): Promise<BatchJobResult> {
    const startTime = Date.now();
    const results: InferenceResponse[] = [];
    const failedItems: Array<{ index: number; error: string }> = [];
    
    const total = requests.length;
    let completed = 0;
    let failed = 0;

    // Process in batches
    for (let i = 0; i < requests.length; i += this.config.batchSize) {
      const batch = requests.slice(i, i + this.config.batchSize);
      const batchResults = await this.processWithRetry(batch, i);
      
      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        if (result && result.success && result.response) {
          results.push(result.response);
        } else if (result) {
          failedItems.push({
            index: i + j,
            error: result.error || 'Unknown error',
          });
          failed++;
        }
      }
      
      completed += batch.length;
      
      // Report progress
      if (this.config.onProgress) {
        const elapsed = Date.now() - startTime;
        const rate = completed / elapsed;
        const remaining = total - completed;
        
        const progress: BatchProgress = {
          total,
          completed,
          failed,
          progressPercent: (completed / total) * 100,
        };
        
        if (remaining > 0) {
          progress.estimatedTimeRemainingMs = remaining / rate * 1000;
        }
        
        this.config.onProgress(progress);
      }
    }

    const totalLatencyMs = Date.now() - startTime;
    const throughput = total / (totalLatencyMs / 1000);

    return {
      results,
      failedItems,
      totalLatencyMs,
      throughput,
    };
  }

  /**
   * Process batch with retry logic
   */
  private async processWithRetry(
    batch: InferenceRequest[],
    startIndex: number
  ): Promise<Array<{ success: boolean; response?: InferenceResponse; error?: string }>> {
    const results: Array<{ success: boolean; response?: InferenceResponse; error?: string }> = 
      new Array(batch.length).fill(null).map(() => ({ success: false }));

    let attempt = 0;
    let pending = batch.map((_, i) => startIndex + i);

    while (pending.length > 0 && attempt < this.config.maxRetries) {
      const currentPending = [...pending];
      pending = [];

      const promises = currentPending.map(async (idx) => {
        const request = batch[idx - startIndex];
        if (!request) return;

        try {
          const timeoutPromise = new Promise<InferenceResponse>((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), this.config.timeoutMs);
          });

          const response = await Promise.race([
            this.client.infer(request),
            timeoutPromise,
          ]);

          results[idx - startIndex] = { success: true, response };
        } catch (error) {
          results[idx - startIndex] = { 
            success: false, 
            error: (error as Error).message 
          };
          pending.push(idx);
        }
      });

      await Promise.all(promises);
      attempt++;

      if (pending.length > 0 && attempt < this.config.maxRetries) {
        await this.delay(this.config.retryDelayMs * attempt);
      }
    }

    return results;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================
// PARALLEL BATCH PROCESSOR
// ============================================

export interface ParallelBatchConfig {
  concurrency: number;
  maxRetries: number;
  retryDelayMs: number;
  onProgress?: (progress: BatchProgress) => void;
}

/**
 * Process batch with parallel workers
 */
export class ParallelBatchProcessor {
  private client: InferenceClient;
  private config: ParallelBatchConfig;

  constructor(client: InferenceClient, config?: Partial<ParallelBatchConfig>) {
    this.client = client;
    this.config = {
      concurrency: 5,
      maxRetries: 3,
      retryDelayMs: 1000,
      ...config,
    };
  }

  /**
   * Process items in parallel with controlled concurrency
   */
  async processParallel(
    requests: InferenceRequest[],
    transform?: (req: InferenceRequest, index: number) => InferenceRequest
  ): Promise<BatchJobResult> {
    const startTime = Date.now();
    const results: InferenceResponse[] = [];
    const failedItems: Array<{ index: number; error: string }> = [];
    
    const total = requests.length;
    let completed = 0;
    let failed = 0;

    // Process with concurrency control
    for (let i = 0; i < requests.length; i += this.config.concurrency) {
      const batch = requests.slice(i, i + this.config.concurrency);
      
      const batchPromises = batch.map(async (req, j) => {
        const index = i + j;
        const processedReq = transform ? transform(req, index) : req;
        
        for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
          try {
            const response = await this.client.infer(processedReq);
            return { index, success: true, response, error: null };
          } catch (error) {
            if (attempt < this.config.maxRetries - 1) {
              await this.delay(this.config.retryDelayMs * (attempt + 1));
            }
          }
        }
        
        return {
          index,
          success: false,
          response: null,
          error: (await this.client.infer(processedReq).catch(e => e)).message || 'Failed after retries'
        };
      });

      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        if (result.success && result.response) {
          results.push(result.response);
        } else {
          failedItems.push({
            index: result.index,
            error: result.error || 'Unknown error',
          });
          failed++;
        }
      }
      
      completed += batch.length;
      
      if (this.config.onProgress) {
        const elapsed = Date.now() - startTime;
        const rate = completed / elapsed;
        const remaining = total - completed;

        const progress: BatchProgress = {
          total,
          completed,
          failed,
          progressPercent: (completed / total) * 100,
        };
        
        if (remaining > 0) {
          progress.estimatedTimeRemainingMs = remaining / rate * 1000;
        }
        
        this.config.onProgress(progress);
      }
    }

    const totalLatencyMs = Date.now() - startTime;
    const throughput = total / (totalLatencyMs / 1000);

    return {
      results,
      failedItems,
      totalLatencyMs,
      throughput,
    };
  }

  /**
   * Process items as they arrive (streaming)
   */
  async *processStream(
    requests: AsyncGenerator<InferenceRequest> | RequestIterator
  ): AsyncGenerator<InferenceResponse> {
    const queue: InferenceRequest[] = [];
    
    // Fill queue from generator/iterator
    for await (const request of this.iterateAsync(requests)) {
      queue.push(request);
      
      // Process when we have enough items
      if (queue.length >= this.config.concurrency) {
        const batch = queue.splice(0, this.config.concurrency);
        const results = await Promise.all(
          batch.map(req => this.client.infer(req).catch(() => null))
        );
        
        for (const result of results) {
          if (result) {
            yield result;
          }
        }
      }
    }
    
    // Process remaining items
    while (queue.length > 0) {
      const batch = queue.splice(0, this.config.concurrency);
        const results = await Promise.all(
          batch.map(req => this.client.infer(req).catch(() => null))
        );
      
      for (const result of results) {
        if (result) {
          yield result;
        }
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async *iterateAsync(
    gen: AsyncGenerator<InferenceRequest> | RequestIterator
  ): AsyncGenerator<InferenceRequest> {
    if (Symbol.asyncIterator in gen) {
      yield* gen as AsyncGenerator<InferenceRequest>;
    } else {
      for (const item of gen as InferenceRequest[]) {
        yield item;
      }
    }
  }
}

// ============================================
// JOB SCHEDULER
// ============================================

export interface ScheduledJob {
  id: string;
  name: string;
  requests: InferenceRequest[];
  schedule?: string; // cron expression
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: BatchJobResult;
  error?: string;
}

/**
 * Job scheduler for batch predictions
 */
export class JobScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private processor: BatchProcessor;

  constructor(processor: BatchProcessor) {
    this.processor = processor;
  }

  /**
   * Schedule a new batch job
   */
  async scheduleJob(
    name: string,
    requests: InferenceRequest[],
    schedule?: string
  ): Promise<string> {
    const id = this.generateJobId();

    const job: ScheduledJob = {
      id,
      name,
      requests,
      status: 'pending',
      createdAt: new Date(),
    };

    if (schedule !== undefined) {
      job.schedule = schedule;
    }

    this.jobs.set(id, job);

    // If no schedule, run immediately
    if (!schedule) {
      this.runJob(id);
    }

    return id;
  }

  /**
   * Run a job
   */
  private async runJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;
    
    job.status = 'running';
    job.startedAt = new Date();
    
    try {
      const result = await this.processor.processBatch(job.requests);
      job.status = 'completed';
      job.completedAt = new Date();
      job.result = result;
    } catch (error) {
      job.status = 'failed';
      job.completedAt = new Date();
      job.error = (error as Error).message;
    }
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): ScheduledJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'running' || job.status === 'completed') {
      return false;
    }
    
    job.status = 'failed';
    job.error = 'Cancelled by user';
    return true;
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================
// PARTITIONER
// ============================================

/**
 * Partition data for parallel processing
 */
export class DataPartitioner {
  /**
   * Partition by size (equal total size)
   */
  static partitionBySize<T>(
    items: T[],
    getSize: (item: T) => number,
    numPartitions: number
  ): T[][] {
    const partitions: T[][] = Array.from({ length: numPartitions }, () => []);
    const sizes = Array(numPartitions).fill(0);
    
    // Sort items by size descending for better distribution
    const sorted = [...items].sort((a, b) => getSize(b) - getSize(a));
    
    for (const item of sorted) {
      // Find partition with minimum total size
      let minIndex = 0;
      let minSize = sizes[0] ?? 0;
      
      for (let i = 1; i < numPartitions; i++) {
        if (sizes[i] < minSize) {
          minSize = sizes[i];
          minIndex = i;
        }
      }
      
      partitions[minIndex]?.push(item);
      sizes[minIndex] = (sizes[minIndex] ?? 0) + getSize(item);
    }
    
    return partitions;
  }

  /**
   * Partition by count (equal number of items)
   */
  static partitionByCount<T>(items: T[], numPartitions: number): T[][] {
    const partitionSize = Math.ceil(items.length / numPartitions);
    const partitions: T[][] = [];
    
    for (let i = 0; i < items.length; i += partitionSize) {
      partitions.push(items.slice(i, i + partitionSize));
    }
    
    return partitions;
  }

  /**
   * Partition by key (group by key)
   */
  static partitionByKey<T>(
    items: T[],
    getKey: (item: T) => string
  ): Map<string, T[]> {
    const map = new Map<string, T[]>();
    
    for (const item of items) {
      const key = getKey(item);
      const group = map.get(key) || [];
      group.push(item);
      map.set(key, group);
    }
    
    return map;
  }
}

// ============================================
// RESULT AGGREGATOR
// ============================================

/**
 * Aggregate results from batch processing
 */
export class ResultAggregator {
  /**
   * Combine multiple batch results
   */
  static aggregate(results: BatchJobResult[]): BatchJobResult {
    const allResults: InferenceResponse[] = [];
    const allFailed: Array<{ index: number; error: string }> = [];
    
    let totalLatencyMs = 0;
    let totalItems = 0;
    
    for (const result of results) {
      allResults.push(...result.results);
      allFailed.push(...result.failedItems.map(f => ({
        ...f,
        index: f.index + totalItems,
      })));
      totalLatencyMs += result.totalLatencyMs;
      totalItems += result.results.length;
    }
    
    const throughput = totalItems / (totalLatencyMs / 1000);
    
    return {
      results: allResults,
      failedItems: allFailed,
      totalLatencyMs,
      throughput,
    };
  }

  /**
   * Group results by category
   */
  static groupBy<_T>(
    results: InferenceResponse[],
    getCategory: (response: InferenceResponse) => string
  ): Map<string, InferenceResponse[]> {
    const map = new Map<string, InferenceResponse[]>();
    
    for (const result of results) {
      const category = getCategory(result);
      const group = map.get(category) || [];
      group.push(result);
      map.set(category, group);
    }
    
    return map;
  }
}

// Type for sync iterables
type RequestIterator = InferenceRequest[] | Iterable<InferenceRequest>;

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Create batch processor
 */
export function createBatchProcessor(
  client: InferenceClient,
  config?: Partial<BatchJobConfig>
): BatchProcessor {
  return new BatchProcessor(client, config);
}

/**
 * Create parallel batch processor
 */
export function createParallelBatchProcessor(
  client: InferenceClient,
  config?: Partial<ParallelBatchConfig>
): ParallelBatchProcessor {
  return new ParallelBatchProcessor(client, config);
}

/**
 * Create job scheduler
 */
export function createJobScheduler(processor: BatchProcessor): JobScheduler {
  return new JobScheduler(processor);
}

