import { z } from 'zod';

export const DocumentSchema = z.object({
  id: z.string().optional(),
  filename: z.string().min(1),
  content: z.string(),
  mimeType: z.string().optional(),
  size: z.number().int().positive().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  chunkSize: z.number().int().positive().optional(),
  overlap: z.number().int().nonnegative().optional(),
  totalChunks: z.number().int().nonnegative().optional(),
  vectorIds: z.array(z.string()).optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
  tenantId: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const QuerySchema = z.object({
  id: z.string().optional(),
  query: z.string().min(1),
  topK: z.number().int().positive().optional(),
  filters: z.record(z.string(), z.any()).optional(),
  searchType: z.enum(['vector', 'keyword', 'hybrid']).optional(),
  includeScores: z.boolean().optional(),
  includeMetadata: z.boolean().optional(),
  rerank: z.boolean().optional(),
  tenantId: z.string(),
  createdAt: z.date().optional()
});

export const RAGQuerySchema = z.object({
  id: z.string().optional(),
  query: z.string().min(1),
  context: z.string().optional(),
  topK: z.number().int().positive().optional(),
  rerank: z.boolean().optional(),
  hybridSearch: z.boolean().optional(),
  includeSources: z.boolean().optional(),
  includeReasoning: z.boolean().optional(),
  tenantId: z.string(),
  createdAt: z.date().optional()
});

export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  steps: z.array(z.any()),
  onFailure: z.enum(['stop', 'continue']).optional(),
  tenantId: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const AgentTaskSchema = z.object({
  id: z.string(),
  type: z.string(),
  payload: z.any(),
  context: z.object({
    tenantId: z.string(),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    requestId: z.string(),
    metadata: z.record(z.string(), z.any()).optional(),
    timestamp: z.date()
  }),
  priority: z.number().int().min(0).max(10).optional(),
  retryCount: z.number().int().min(0).optional(),
  maxRetries: z.number().int().min(0).max(10).optional(),
  timeout: z.number().int().min(1000).optional(),
  dependencies: z.array(z.string()).optional()
});
