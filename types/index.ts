// ============================================
// TYPE DEFINITIONS
// Re-exported and organized for easy importing via @/types
// ============================================

// Re-export all types from SDK shared types
// This provides a centralized types location

export type {
  Tenant,
  TenantContext,
  TenantPlan,
} from '@/sdk/shared/types'

export type {
  User,
  UserRole,
  AuthPayload,
} from '@/sdk/shared/types'

export type {
  Document,
  DocumentChunk,
  DocumentStatus,
} from '@/sdk/shared/types'

export type {
  Job,
  JobType,
  JobStatus,
} from '@/sdk/shared/types'

export type {
  Session,
  ApiKey,
} from '@/sdk/shared/types'

export type {
  Conversation,
  Message,
  RAGRequest,
  RAGResponse,
} from '@/sdk/shared/types'

export type {
  VectorSearchRequest,
  VectorSearchResult,
} from '@/sdk/shared/types'

export type {
  UsageMetric,
  MetricType,
  MetricPeriod,
} from '@/sdk/shared/types'

export type {
  AuditLog,
  AuditAction,
} from '@/sdk/shared/types'

export type {
  ApiResponse,
  PaginatedResponse,
  RateLimitInfo,
} from '@/sdk/shared/types'

// ============================================
// ADDITIONAL APPLICATION TYPES
// ============================================

/**
 * Chat message type for UI
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    documentId: string;
    documentTitle: string;
    chunkContent: string;
    score: number;
  }>;
  tokensUsed?: number;
  createdAt?: Date;
}

/**
 * Document upload type
 */
export interface DocumentUpload {
  title: string;
  file: File;
}

/**
 * API request/response types
 */
export interface ApiQueryRequest {
  query: string;
  conversationId?: string;
  topK?: number;
  includeSources?: boolean;
}

export interface ApiQueryResponse {
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

/**
 * Pagination params
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * Sort params
 */
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Filter params
 */
export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * List query params combining pagination, sorting, and filtering
 */
export interface ListQueryParams extends PaginationParams {
  sort?: SortParams;
  filters?: FilterParams;
}

/**
 * Theme types
 */
export type Theme = 'light' | 'dark' | 'system'

/**
 * Brand theme types
 */
export type BrandTheme = 'brand-a' | 'brand-b'

/**
 * Component variant sizes
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Status types
 */
export type Status = 'idle' | 'loading' | 'success' | 'error'

/**
 * Action result type
 */
export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

