/**
 * Groq Provider Configuration
 * 
 * AI SDK provider for Groq models (fast inference)
 */

import type { ProviderInfo, ModelDefinition } from '../types';

// ============================================
// PROVIDER INFO
// ============================================

export const groqProvider: ProviderInfo = {
  id: 'groq',
  name: 'Groq',
  website: 'https://groq.com',
  docsURL: 'https://docs.groq.com',
  baseURL: 'https://api.groq.com/openai/v1',
  defaultModel: 'llama-3.1-70b-versatile',
  supportsStreaming: true,
  requiresAPIKey: true,
  authType: 'bearer',
};

// ============================================
// MODELS
// ============================================

export const groqModels: ModelDefinition[] = [
  {
    id: 'llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout 17B',
    provider: 'groq',
    modelId: 'meta-llama/llama-4-scout-17b-16e-instruct',
    description: 'Meta\'s Llama 4 Scout model via Groq',
    capabilities: {
      supportsImageInput: true,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: true,
      supportsStreaming: true,
      supportsReasoning: false,
    },
    recommendedFor: ['fast inference', 'instruction following'],
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    provider: 'groq',
    modelId: 'llama-3.3-70b-versatile',
    description: 'Meta\'s Llama 3.3 70B model',
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
  {
    id: 'llama-3.1-70b-versatile',
    name: 'Llama 3.1 70B Versatile',
    provider: 'groq',
    modelId: 'llama-3.1-70b-versatile',
    description: 'Meta\'s Llama 3.1 70B model',
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
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'groq',
    modelId: 'llama-3.1-8b-instant',
    description: 'Fast Llama 3.1 8B model',
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
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    modelId: 'mixtral-8x7b-32768',
    description: 'Mixtral mixture of experts model',
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
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B Instruct',
    provider: 'groq',
    modelId: 'gemma2-9b-it',
    description: 'Google\'s Gemma 2 9B model',
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
  provider: groqProvider,
  models: groqModels,
};
