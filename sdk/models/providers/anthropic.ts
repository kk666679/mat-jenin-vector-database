/**
 * Anthropic Provider Configuration
 * 
 * AI SDK provider for Anthropic Claude models
 */

import type { ProviderInfo, ModelDefinition } from '../types';

// ============================================
// PROVIDER INFO
// ============================================

export const anthropicProvider: ProviderInfo = {
  id: 'anthropic',
  name: 'Anthropic',
  website: 'https://www.anthropic.com',
  docsURL: 'https://docs.anthropic.com',
  baseURL: 'https://api.anthropic.com',
  defaultModel: 'claude-sonnet-4-0',
  supportsStreaming: true,
  requiresAPIKey: true,
  authType: 'api-key',
};

// ============================================
// MODELS
// ============================================

export const anthropicModels: ModelDefinition[] = [
  {
    id: 'claude-opus-4-6',
    name: 'Claude Opus 4.6',
    provider: 'anthropic',
    modelId: 'claude-opus-4-6-20251120',
    description: "Anthropic's most capable model for complex reasoning and generation",
    capabilities: {
      supportsImageInput: true,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: true,
      supportsStreaming: true,
      supportsReasoning: false,
    },
    recommendedFor: ['complex reasoning', 'writing', 'analysis'],
  },
  {
    id: 'claude-opus-4-5',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    modelId: 'claude-opus-4-5-20241022',
    description: 'Claude Opus 4.5 model',
    capabilities: {
      supportsImageInput: true,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: true,
      supportsStreaming: true,
      supportsReasoning: false,
    },
  },
  {
    id: 'claude-opus-4-1',
    name: 'Claude Opus 4.1',
    provider: 'anthropic',
    modelId: 'claude-opus-4-1-20240902',
    description: 'Claude Opus 4.1 model',
    capabilities: {
      supportsImageInput: true,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: true,
      supportsStreaming: true,
      supportsReasoning: false,
    },
  },
  {
    id: 'claude-opus-4-0',
    name: 'Claude Opus 4.0',
    provider: 'anthropic',
    modelId: 'claude-opus-4-0-20240229',
    description: 'Claude Opus 4.0 model',
    capabilities: {
      supportsImageInput: true,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: true,
      supportsStreaming: true,
      supportsReasoning: false,
    },
  },
  {
    id: 'claude-sonnet-4-0',
    name: 'Claude Sonnet 4.0',
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-0-20250514',
    description: 'Balanced performance and speed',
    capabilities: {
      supportsImageInput: true,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: true,
      supportsStreaming: true,
      supportsReasoning: false,
    },
    recommendedFor: ['balanced tasks', 'coding', 'writing'],
  },
  {
    id: 'claude-3-7-sonnet-latest',
    name: 'Claude 3.7 Sonnet Latest',
    provider: 'anthropic',
    modelId: 'claude-3-7-sonnet-latest',
    description: 'Latest Claude 3.7 Sonnet',
    capabilities: {
      supportsImageInput: true,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: true,
      supportsStreaming: true,
      supportsReasoning: false,
    },
  },
  {
    id: 'claude-3-5-haiku-latest',
    name: 'Claude 3.5 Haiku Latest',
    provider: 'anthropic',
    modelId: 'claude-3-5-haiku-latest',
    description: 'Fast and efficient Claude model',
    capabilities: {
      supportsImageInput: true,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: true,
      supportsStreaming: true,
      supportsReasoning: false,
    },
    recommendedFor: ['fast responses', 'simple tasks'],
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    description: 'Claude 3.5 Sonnet model',
    capabilities: {
      supportsImageInput: true,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: true,
      supportsStreaming: true,
      supportsReasoning: false,
    },
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    modelId: 'claude-3-haiku-20240307',
    description: 'Fast Claude 3 model',
    capabilities: {
      supportsImageInput: false,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: false,
      supportsStreaming: true,
      supportsReasoning: false,
    },
  },
];

// ============================================
// EXPORTS
// ============================================

export default {
  provider: anthropicProvider,
  models: anthropicModels,
};

