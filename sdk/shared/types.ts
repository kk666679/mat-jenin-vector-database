import { z } from 'zod';

// ============================================
// TENANT TYPES
// ============================================

export const TenantPlanSchema = z.enum(['free', 'pro', 'enterprise']);
export type TenantPlan = z.infer<typeof TenantPlanSchema>;

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  isActive: boolean;
  databaseUrl?: string;
  maxUsers: number;
  maxDocuments: number;
  maxStorageMb: number;
  rateLimitRpm: number;
  rateLimitRph: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  tenantPlan: TenantPlan;
  userId: string;
  userRole: 'admin' | 'member';
}

// ============================================
// USER TYPES
// ============================================

export const UserRoleSchema = z.enum(['admin', 'member']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  tenantId: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthPayload {
  userId: string;
  email: string;
  tenantId: string;
  role: UserRole;
}

// ============================================
// DOCUMENT TYPES
// ============================================

export const DocumentStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;

export interface Document {
  id: string;
  tenantId: string;
  title: string;
  filename?: string;
  contentType?: string;
  fileSize?: number;
  content?: string;
  fileUrl?: string;
  status: DocumentStatus;
  chunkCount: number;
  processedAt?: Date;
  errorMessage?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentChunk {
  id: string;
  tenantId: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  embeddingId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// ============================================
// JOB TYPES
// ============================================

export const JobTypeSchema = z.enum(['embedding', 'indexing', 'processing']);
export type JobType = z.infer<typeof JobTypeSchema>;

export const JobStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);
export type JobStatus = z.infer<typeof JobStatusSchema>;

export interface Job {
  id: string;
  tenantId: string;
  documentId: string;
  type: JobType;
  status: JobStatus;
  progress: number;
  result?: Record<string, unknown>;
  error?: string;
  attempts: number;
  maxAttempts: number;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// API & AUTH TYPES
// ============================================

export interface Session {
  id: string;
  userId: string;
  tenantId: string;
  token: string;
  refreshToken?: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface ApiKey {
  id: string;
  tenantId: string;
  name: string;
  keyHash: string;
  prefix: string;
  permissions: string[];
  lastUsedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// CHAT & RAG TYPES
// ============================================

export interface Conversation {
  id: string;
  tenantId: string;
  title?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  tokensUsed?: number;
  createdAt: Date;
}

export interface RAGRequest {
  query: string;
  conversationId?: string;
  topK?: number;
  includeSources?: boolean;
}

export interface RAGResponse {
  answer: string;
  sources: Array<{
    documentId: string;
    documentTitle: string;
    chunkContent: string;
    score: number;
  }>;
  conversationId: string;
  tokensUsed?: number;
}

// ============================================
// SEARCH TYPES
// ============================================

export interface VectorSearchRequest {
  query: string;
  tenantId: string;
  topK?: number;
  filters?: Record<string, unknown>;
}

export interface VectorSearchResult {
  id: string;
  content: string;
  score: number;
  documentId: string;
  documentTitle: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// METRICS TYPES
// ============================================

export const MetricTypeSchema = z.enum([
  'api_requests',
  'documents_processed',
  'tokens_used',
  'storage_mb',
  'embedding_generated'
]);
export type MetricType = z.infer<typeof MetricTypeSchema>;

export const MetricPeriodSchema = z.enum(['hourly', 'daily', 'monthly']);
export type MetricPeriod = z.infer<typeof MetricPeriodSchema>;

export interface UsageMetric {
  id: string;
  tenantId: string;
  metricType: MetricType;
  value: number;
  period: MetricPeriod;
  periodStart: Date;
  createdAt: Date;
}

// ============================================
// AUDIT TYPES
// ============================================

export const AuditActionSchema = z.enum([
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'upload',
  'download',
  'search',
  'query'
]);
export type AuditAction = z.infer<typeof AuditActionSchema>;

export interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  documentId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// RATE LIMITING
// ============================================

export interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

