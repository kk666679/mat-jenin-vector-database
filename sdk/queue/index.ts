/**
 * Queue package for document processing jobs
 * Uses BullMQ with Redis
 */

import { Queue, Worker, Job } from 'bullmq';
import { randomUUID } from 'crypto';

// ============================================
// QUEUE NAMES
// ============================================

export const QUEUE_NAMES = {
  DOCUMENT_PROCESSING: 'document-processing',
  EMBEDDING: 'embedding',
  INDEXING: 'indexing',
} as const;

// ============================================
// CONNECTION OPTIONS
// ============================================

function getConnectionOptions() {
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  };
}

// ============================================
// QUEUE FACTORY
// ============================================

/**
 * Create a queue instance
 */
export function createQueue(name: string): Queue {
  return new Queue(name, {
    connection: getConnectionOptions(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: {
        count: 100,
        age: 24 * 3600, // 24 hours
      },
      removeOnFail: {
        count: 500,
      },
    },
  });
}

/**
 * Get document processing queue
 */
export function getDocumentProcessingQueue(): Queue {
  return createQueue(QUEUE_NAMES.DOCUMENT_PROCESSING);
}

/**
 * Get embedding queue
 */
export function getEmbeddingQueue(): Queue {
  return createQueue(QUEUE_NAMES.EMBEDDING);
}

// ============================================
// JOB TYPES
// ============================================

export interface DocumentProcessingJob {
  documentId: string;
  tenantId: string;
  content: string;
  title: string;
  userId: string;
  traceId?: string;
}

export interface EmbeddingJob {
  documentId: string;
  tenantId: string;
  chunkId: string;
  content: string;
  traceId?: string;
}

export interface IndexingJob {
  documentId: string;
  tenantId: string;
  chunkIds: string[];
  traceId?: string;
}

// ============================================
// TRACE ID GENERATION
// ============================================

/**
 * Generate a trace ID for distributed tracing
 */
export function generateTraceId(): string {
  return randomUUID();
}

// ============================================
// JOB ADDERS
// ============================================

/**
 * Add document processing job to queue
 */
export async function addDocumentProcessingJob(data: DocumentProcessingJob): Promise<Job<DocumentProcessingJob>> {
  const queue = getDocumentProcessingQueue();
  
  // Generate trace ID if not provided (for OpenTelemetry tracing)
  const jobData = {
    ...data,
    traceId: data.traceId || generateTraceId(),
  };
  
  return queue.add('process', jobData, {
    jobId: `doc-${data.documentId}`,
  });
}

/**
 * Add document job (alias for addDocumentProcessingJob)
 * Used by API routes
 */
export async function addDocumentJob(documentId: string, tenantId: string, traceId?: string): Promise<Job<DocumentProcessingJob>> {
  const queue = getDocumentProcessingQueue();
  return queue.add('process', {
    documentId,
    tenantId,
    content: '',
    title: '',
    userId: '',
    traceId: traceId || generateTraceId(),
  }, {
    jobId: `doc-${documentId}`,
  });
}

/**
 * Add embedding job to queue
 */
export async function addEmbeddingJob(data: EmbeddingJob): Promise<Job<EmbeddingJob>> {
  const queue = getEmbeddingQueue();
  return queue.add('embed', {
    ...data,
    traceId: data.traceId || generateTraceId(),
  }, {
    jobId: `emb-${data.chunkId}`,
  });
}

/**
 * Add bulk embedding jobs
 */
export async function addBulkEmbeddingJobs(jobs: EmbeddingJob[]): Promise<Job<EmbeddingJob>[]> {
  const queue = getEmbeddingQueue();
  const bulkJobs = jobs.map((data) => ({
    name: 'embed',
    data: {
      ...data,
      traceId: data.traceId || generateTraceId(),
    },
    opts: {
      jobId: `emb-${data.chunkId}`,
    },
  }));
  return queue.addBulk(bulkJobs) as Promise<Job<EmbeddingJob>[]>;
}

// ============================================
// WORKER FACTORY
// ============================================

/**
 * Create a worker
 */
export function createWorker<T>(
  name: string,
  processor: (job: Job<T>) => Promise<void>
): Worker<T> {
  return new Worker<T>(name, processor, {
    connection: getConnectionOptions(),
    concurrency: 5,
  });
}

/**
 * Close all workers
 */
export async function closeWorkers(workers: Worker[]): Promise<void> {
  await Promise.all(workers.map(w => w.close()));
}

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Check if queue is healthy
 */
export async function checkQueueHealth(queue: Queue): Promise<boolean> {
  try {
    await queue.getJobCounts();
    return true;
  } catch {
    return false;
  }
}

