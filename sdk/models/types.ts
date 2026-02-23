/**
 * Core Model Types and Interfaces
 * 
 * Provides standardized types for AI SDK model integration
 * following the language model specification v3
 */

import { z } from 'zod';

// ============================================
// MODEL PROVIDERS
// ============================================

/**
 * Supported AI SDK model providers
 */
export const ModelProviderSchema = z.enum([
  'openai',
  'anthropic',
  'google',
  'google-vertex',
  'deepseek',
  'xai',
  'mistral',
  'groq',
  'cerebras',
  'ollama',
  'cohere',
  'fireworks',
  'deepinfra',
  'togetherai',
  'amazon-bedrock',
  'azure',
  'perplexity',
  'baseten',
  'lmnt',
  'hume',
]);

export type ModelProvider = z.infer<typeof ModelProviderSchema>;

// ============================================
// MODEL CAPABILITIES
// ============================================

/**
 * Model capability flags
 */
export interface ModelCapabilities {
  /** Supports image input */
  supportsImageInput: boolean;
  /** Supports object generation via generateObject */
  supportsObjectGeneration: boolean;
  /** Supports tool/function calling */
  supportsToolUsage: boolean;
  /** Supports streaming tool calls */
  supportsToolStreaming: boolean;
  /** Supports vision/image analysis */
  supportsVision: boolean;
  /** Supports streaming responses */
  supportsStreaming: boolean;
  /** Supports reasoning/thought chains */
  supportsReasoning: boolean;
  /** Maximum context length in tokens */
  maxContextTokens?: number;
  /** Maximum output tokens */
  maxOutputTokens?: number;
}

/**
 * Default capabilities for a model
 */
export const defaultCapabilities: ModelCapabilities = {
  supportsImageInput: false,
  supportsObjectGeneration: true,
  supportsToolUsage: true,
  supportsToolStreaming: true,
  supportsVision: false,
  supportsStreaming: true,
  supportsReasoning: false,
};

// ============================================
// MODEL DEFINITION
// ============================================

/**
 * Model definition with metadata and capabilities
 */
export interface ModelDefinition {
  /** Unique model identifier */
  id: string;
  /** Human-readable model name */
  name: string;
  /** Model provider */
  provider: ModelProvider;
  /** Provider-specific model ID */
  modelId: string;
  /** Model capabilities */
  capabilities: ModelCapabilities;
  /** Model description */
  description?: string;
  /** Release date */
  releasedAt?: string;
  /** Deprecated flag */
  deprecated?: boolean;
  /** Recommended use cases */
  recommendedFor?: string[];
}

/**
 * Model list by provider
 */
export interface ProviderModels {
  provider: ModelProvider;
  providerName: string;
  models: ModelDefinition[];
}

// ============================================
// MODEL CONFIGURATION
// ============================================

/**
 * Base model configuration
 */
export interface BaseModelConfig {
  /** Model to use */
  model: string;
  /** Temperature (0-2) */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Top-p sampling */
  topP?: number;
  /** Frequency penalty */
  frequencyPenalty?: number;
  /** Presence penalty */
  presencePenalty?: number;
  /** Stop sequences */
  stopSequences?: string[];
  /** Response format */
  responseFormat?: 'text' | 'json' | 'json_schema';
  /** JSON schema for object generation */
  schema?: Record<string, unknown>;
  /** Whether to stream */
  stream?: boolean;
}

/**
 * Provider-specific model configuration
 */
export interface ModelConfig extends BaseModelConfig {
  /** API key (optional, can use env vars) */
  apiKey?: string;
  /** Base URL for API */
  baseURL?: string;
  /** Organization ID */
  organization?: string;
  /** Custom headers */
  headers?: Record<string, string>;
}

// ============================================
// PROVIDER INFO
// ============================================

/**
 * Provider information
 */
export interface ProviderInfo {
  /** Provider ID */
  id: ModelProvider;
  /** Provider display name */
  name: string;
  /** Provider website */
  website?: string;
  /** API documentation URL */
  docsURL?: string;
  /** Base URL for API */
  baseURL: string;
  /** Default model */
  defaultModel: string;
  /** Whether provider supports streaming */
  supportsStreaming: boolean;
  /** Whether provider requires API key */
  requiresAPIKey: boolean;
  /** Authentication type */
  authType: 'bearer' | 'api-key' | 'aws';
}

// ============================================
// RESPONSE TYPES
// ============================================

/**
 * Standardized response from model
 */
export interface ModelResponse {
  /** Generated text content */
  content: string;
  /** Finish reason */
  finishReason: 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'unknown';
  /** Usage statistics */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Model used */
  model: string;
  /** Response metadata */
  metadata?: Record<string, unknown>;
  /** Tool calls (if any) */
  toolCalls?: ToolCall[];
}

/**
 * Tool call from model
 */
export interface ToolCall {
  /** Tool call ID */
  id: string;
  /** Tool name */
  toolName: string;
  /** Tool arguments (JSON) */
  args: Record<string, unknown>;
}

/**
 * Stream chunk from model
 */
export interface StreamChunk {
  /** Chunk content */
  content: string;
  /** Delta type */
  type: 'text' | 'tool-call' | 'tool-result' | 'error' | 'finish';
  /** Tool call (if tool type) */
  toolCall?: ToolCall;
  /** Usage (when available) */
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
  /** Finish reason */
  finishReason?: string;
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const ModelCapabilitiesSchema = z.object({
  supportsImageInput: z.boolean(),
  supportsObjectGeneration: z.boolean(),
  supportsToolUsage: z.boolean(),
  supportsToolStreaming: z.boolean(),
  supportsVision: z.boolean(),
  supportsStreaming: z.boolean(),
  supportsReasoning: z.boolean(),
  maxContextTokens: z.number().optional(),
  maxOutputTokens: z.number().optional(),
});

export const ModelDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: ModelProviderSchema,
  modelId: z.string(),
  capabilities: ModelCapabilitiesSchema,
  description: z.string().optional(),
  releasedAt: z.string().optional(),
  deprecated: z.boolean().optional(),
  recommendedFor: z.array(z.string()).optional(),
});

export const ModelConfigSchema = z.object({
  model: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  stopSequences: z.array(z.string()).optional(),
  responseFormat: z.enum(['text', 'json', 'json_schema']).optional(),
  schema: z.record(z.string(), z.unknown()).optional(),
  stream: z.boolean().optional(),
  apiKey: z.string().optional(),
  baseURL: z.string().optional(),
  organization: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================

// Note: For full type compatibility with AI SDK, import directly from 'ai'
// These are placeholder types that match the AI SDK interface
// In production, use the actual AI SDK imports in your code

/**
 * Core language model interface compatible with AI SDK
 */
export interface LanguageModel {
  readonly modelId: string;
  readonly provider: string;
}

/**
 * Message types for language model
 */
export type LanguageModelV1Message = 
  | { role: 'system'; content: string }
  | { role: 'user'; content: string | Array<{ type: 'text'; text: string } | { type: 'image'; image: string | URL }> }
  | { role: 'assistant'; content: string; toolCalls?: ToolCall[] }
  | { role: 'tool'; toolCallId: string; content: string };

/**
 * Function tool definition
 */
export interface LanguageModelV1FunctionTool {
  type: 'function';
  name: string;
  description?: string;
  parameters: Record<string, unknown>;
}

/**
 * Tool choice options
 */
export type LanguageModelV1ToolChoice = 
  | { type: 'none' }
  | { type: 'auto' }
  | { type: 'function'; name: string };

/**
 * Finish reason for response
 */
export type LanguageModelV1FinishReason = 
  | 'stop'
  | 'length'
  | 'content-filter'
  | 'tool-calls'
  | 'error'
  | 'unknown';

/**
 * Usage statistics
 */
export interface LanguageModelUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Generate text options (simplified)
 */
export interface GenerateTextOptions {
  model: string;
  messages: LanguageModelV1Message[];
  tools?: LanguageModelV1FunctionTool[];
  toolChoice?: LanguageModelV1ToolChoice;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  headers?: Record<string, string>;
}

/**
 * Generate text result (simplified)
 */
export interface GenerateTextResult {
  text: string;
  finishReason: LanguageModelV1FinishReason;
  usage: LanguageModelUsage;
}

/**
 * Stream text options
 */
export interface StreamTextOptions extends GenerateTextOptions {
  // Stream-specific options
}

/**
 * Stream text result (async iterable)
 */
export type StreamTextResult = AsyncIterable<{
  type: 'text-delta' | 'tool-call' | 'finish';
  text?: string;
  toolCall?: ToolCall;
  finishReason?: LanguageModelV1FinishReason;
  usage?: LanguageModelUsage;
}>;

/**
 * Generate object options
 */
export interface GenerateObjectOptions extends GenerateTextOptions {
  schema: Record<string, unknown>;
  mode?: 'auto' | 'json' | 'tool';
}

/**
 * Generate object result
 */
export interface GenerateObjectResult<T = unknown> {
  object: T;
  finishReason: LanguageModelV1FinishReason;
  usage: LanguageModelUsage;
}

/**
 * Stream object options
 */
export interface StreamObjectOptions extends GenerateObjectOptions {
  // Stream-specific options
}

/**
 * Stream object result
 */
export type StreamObjectResult<T = unknown> = AsyncIterable<{
  type: 'object' | 'delta' | 'finish';
  object?: Partial<T>;
  delta?: string;
  finishReason?: LanguageModelV1FinishReason;
  usage?: LanguageModelUsage;
}>;

