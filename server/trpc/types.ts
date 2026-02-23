// ============================================
// TYPES
// Shared type definitions for tRPC
// ============================================

import { z } from 'zod';

// Document Types
export const DocumentStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;

export const DocumentSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  title: z.string(),
  filename: z.string().optional(),
  contentType: z.string().optional(),
  fileSize: z.number().optional(),
  content: z.string().optional(),
  fileUrl: z.string().optional(),
  status: DocumentStatusSchema,
  chunkCount: z.number(),
  processedAt: z.date().optional(),
  errorMessage: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Document = z.infer<typeof DocumentSchema>;

export const DocumentInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});
export type DocumentInput = z.infer<typeof DocumentInputSchema>;

export const DocumentUpdateSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  status: DocumentStatusSchema.optional(),
});
export type DocumentUpdate = z.infer<typeof DocumentUpdateSchema>;

// RAG/Query Types
export const RAGQueryInputSchema = z.object({
  query: z.string().min(1, 'Query is required').max(5000, 'Query too long'),
  conversationId: z.string().optional(),
  topK: z.number().min(1).max(20).default(5),
  includeSources: z.boolean().default(true),
});
export type RAGQueryInput = z.infer<typeof RAGQueryInputSchema>;

export const RAGSourceSchema = z.object({
  documentId: z.string(),
  documentTitle: z.string(),
  chunkContent: z.string(),
  score: z.number(),
});
export type RAGSource = z.infer<typeof RAGSourceSchema>;

export const RAGResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(RAGSourceSchema),
  conversationId: z.string(),
  tokensUsed: z.number().optional(),
});
export type RAGResponse = z.infer<typeof RAGResponseSchema>;

// Conversation Types
export const ConversationSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  title: z.string().optional(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Conversation = z.infer<typeof ConversationSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  sources: z.array(z.string()).optional(),
  tokensUsed: z.number().optional(),
  createdAt: z.date(),
});
export type Message = z.infer<typeof MessageSchema>;

// Pagination
export const PaginationParamsSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    hasMore: z.boolean(),
  });
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

// API Response Types
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
      })
      .optional(),
  });

