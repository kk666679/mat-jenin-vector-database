/**
 * gRPC Server Types
 * 
 * Type definitions for gRPC services and messages
 * Based on sdk/proto/ai-service.proto
 */

// ============================================
// SERVICE INTERFACES
// ============================================

import type { ServiceError } from '@grpc/grpc-js';

// Search types
export interface ISearchRequest {
  query: string;
  tenantId: string;
  conversationId?: string;
  topK: number;
  includeSources: boolean;
}

export interface ISearchResponse {
  answer: string;
  sources: ISource[];
  conversationId: string;
  tokensUsed: number;
}

export interface ISource {
  documentTitle: string;
  chunkContent: string;
  score: number;
}

export interface ISearchOnlyRequest {
  query: string;
  tenantId: string;
  topK: number;
}

export interface ISearchOnlyResponse {
  results: ISearchResult[];
}

export interface ISearchResult {
  id: string;
  content: string;
  score: number;
  documentId: string;
  documentTitle: string;
  metadata: Record<string, string>;
}

// Text generation types
export interface IGenerateTextRequest {
  prompt: string;
  systemPrompt: string;
  temperature: number;
  maxOutputTokens: number;
  provider: string;
  model: string;
}

export interface IGenerateTextResponse {
  content: string;
  usage: IUsage;
  finishReason: string;
}

export interface IStreamTextRequest {
  prompt: string;
  systemPrompt: string;
  temperature: number;
  maxOutputTokens: number;
  provider: string;
  model: string;
}

export interface IStreamTextChunk {
  content: string;
  chunkType: string;
  toolCall: IToolCall | undefined;
  usage: IUsage | undefined;
  finishReason: string;
}

export interface IToolCall {
  id: string;
  toolName: string;
  args: string;
}

export interface IUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// Structured output types
export interface IGenerateStructuredRequest {
  prompt: string;
  schema: string;
  systemPrompt: string;
  temperature: number;
  provider: string;
  model: string;
}

export interface IGenerateStructuredResponse {
  object: string;
  finishReason: string;
  usage: IUsage;
}

// Document types
export interface IDocument {
  id: string;
  tenantId: string;
  title: string;
  filename: string;
  contentType: string;
  fileSize: number;
  content: string;
  fileUrl: string;
  status: string;
  chunkCount: number;
  processedAt: string;
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDocumentListRequest {
  tenantId: string;
  page: number;
  pageSize: number;
  search: string;
  status: string;
}

export interface IDocumentListResponse {
  items: IDocument[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ICreateDocumentRequest {
  tenantId: string;
  title: string;
  content: string;
}

export interface ICreateDocumentResponse {
  id: string;
  title: string;
  status: string;
}

export interface IUpdateDocumentRequest {
  id: string;
  tenantId: string;
  title: string;
  status: string;
}

export interface IDeleteDocumentRequest {
  id: string;
  tenantId: string;
}

export interface IDeleteDocumentResponse {
  success: boolean;
  id: string;
}

export interface IDocumentStatsRequest {
  tenantId: string;
}

export interface IDocumentStatsResponse {
  total: number;
  byStatus: Record<string, number>;
  totalChunks: number;
}

// Conversation types
export interface IConversation {
  id: string;
  tenantId: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMessage {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  sources: string;
  tokensUsed: number;
  createdAt: string;
}

export interface IConversationListRequest {
  tenantId: string;
  userId: string;
  page: number;
  pageSize: number;
}

export interface IConversationListResponse {
  items: IConversation[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface IMessageListRequest {
  conversationId: string;
  tenantId: string;
  page: number;
  pageSize: number;
}

export interface IMessageListResponse {
  items: IMessage[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ICreateConversationRequest {
  tenantId: string;
  userId: string;
  title: string;
}

export interface ICreateConversationResponse {
  id: string;
  title: string;
  createdAt: string;
}

export interface IDeleteConversationRequest {
  id: string;
  tenantId: string;
  userId: string;
}

export interface IDeleteConversationResponse {
  success: boolean;
}

// Model types
export interface IModelInfo {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  capabilities: IModelCapabilities;
  description: string;
  deprecated: boolean;
}

export interface IModelCapabilities {
  supportsImageInput: boolean;
  supportsObjectGeneration: boolean;
  supportsToolUsage: boolean;
  supportsToolStreaming: boolean;
  supportsVision: boolean;
  supportsStreaming: boolean;
  supportsReasoning: boolean;
  maxContextTokens: number;
  maxOutputTokens: number;
}

export interface IInferenceRequest {
  model: string;
  messages: IMessageInput[];
  tools: IToolDefinition[];
  toolChoice: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  stopSequences: string[];
}

export interface IMessageInput {
  role: string;
  content: string;
  toolCalls: IToolCallInput[];
}

export interface IToolDefinition {
  type: string;
  name: string;
  description: string;
  parameters: string;
}

export interface IToolCallInput {
  id: string;
  name: string;
  arguments: string;
}

export interface IInferenceResponse {
  content: string;
  finishReason: string;
  usage: IUsage;
  model: string;
  toolCalls: IToolCallResult[];
  metadata: Record<string, string>;
}

export interface IToolCallResult {
  id: string;
  toolName: string;
  result: string;
}

// Batch types
export interface IBatchInferenceRequest {
  model: string;
  items: IInferenceRequest[];
  batchSize: number;
}

export interface IBatchInferenceResponse {
  results: IInferenceResponse[];
  totalLatency: number;
  failedCount: number;
}

// Health check
export interface IHealthCheckRequest {
  tenantId: string;
}

export interface IHealthCheckResponse {
  healthy: boolean;
  status: string;
  timestamp: number;
}

// Empty
export interface IEmpty {}

// ============================================
// CALLBACK TYPES
// ============================================

export type SearchCallback = (error: ServiceError | null, response: ISearchResponse) => void;
export type SearchOnlyCallback = (error: ServiceError | null, response: ISearchOnlyResponse) => void;
export type GenerateTextCallback = (error: ServiceError | null, response: IGenerateTextResponse) => void;
export type StreamTextCallback = (error: ServiceError | null, response: IStreamTextChunk) => void;
export type GenerateStructuredCallback = (error: ServiceError | null, response: IGenerateStructuredResponse) => void;
export type ListDocumentsCallback = (error: ServiceError | null, response: IDocumentListResponse) => void;
export type GetDocumentCallback = (error: ServiceError | null, response: IDocument) => void;
export type CreateDocumentCallback = (error: ServiceError | null, response: ICreateDocumentResponse) => void;
export type UpdateDocumentCallback = (error: ServiceError | null, response: IDocument) => void;
export type DeleteDocumentCallback = (error: ServiceError | null, response: IDeleteDocumentResponse) => void;
export type GetDocumentStatsCallback = (error: ServiceError | null, response: IDocumentStatsResponse) => void;
export type ListConversationsCallback = (error: ServiceError | null, response: IConversationListResponse) => void;
export type GetMessagesCallback = (error: ServiceError | null, response: IMessageListResponse) => void;
export type CreateConversationCallback = (error: ServiceError | null, response: ICreateConversationResponse) => void;
export type DeleteConversationCallback = (error: ServiceError | null, response: IDeleteConversationResponse) => void;
export type GetModelInfoCallback = (error: ServiceError | null, response: IModelInfo) => void;
export type InferenceCallback = (error: ServiceError | null, response: IInferenceResponse) => void;
export type BatchInferenceCallback = (error: ServiceError | null, response: IBatchInferenceResponse) => void;
export type HealthCheckCallback = (error: ServiceError | null, response: IHealthCheckResponse) => void;

