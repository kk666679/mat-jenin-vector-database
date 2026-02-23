/**
 * Google Provider Configuration
 * 
 * AI SDK provider for Google Generative AI models
 */

import type { ProviderInfo, ModelDefinition } from '../types';

// ============================================
// PROVIDER INFO
// ============================================

export const googleProvider: ProviderInfo = {
  id: 'google',
  name: 'Google Generative AI',
  website: 'https://ai.google.dev',
  docsURL: 'https://ai.google.dev/docs',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  defaultModel: 'gemini-1.5-flash',
  supportsStreaming: true,
  requiresAPIKey: true,
  authType: 'api-key',
};

// ============================================
// MODELS
// ============================================

export const googleModels: ModelDefinition[] = [
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash Experimental',
    provider: 'google',
    modelId: 'gemini-2.0-flash-exp',
    description: 'Experimental Gemini 2.0 Flash model',
    capabilities: {
      supportsImageInput: true,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: true,
      supportsStreaming: true,
      supportsReasoning: true,
    },
    recommendedFor: ['fast multimodal tasks', 'real-time applications'],
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    modelId: 'gemini-1.5-flash',
    description: 'Fast Gemini 1.5 model',
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
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    modelId: 'gemini-1.5-pro',
    description: 'Pro Gemini 1.5 model',
    capabilities: {
      supportsImageInput: true,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: true,
      supportsStreaming: true,
      supportsReasoning: false,
    },
    recommendedFor: ['complex reasoning', 'multimodal tasks'],
  },
  {
    id: 'gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash 8B',
    provider: 'google',
    modelId: 'gemini-1.5-flash-8b',
    description: 'Efficient Gemini 1.5 Flash model',
    capabilities: {
      supportsImageInput: true,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: false,
      supportsVision: true,
      supportsStreaming: true,
      supportsReasoning: false,
    },
  },
  {
    id: 'gemini-1.0-pro',
    name: 'Gemini 1.0 Pro',
    provider: 'google',
    modelId: 'gemini-1.0-pro',
    description: 'Gemini 1.0 Pro model',
    capabilities: {
      supportsImageInput: true,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: false,
      supportsVision: true,
      supportsStreaming: true,
      supportsReasoning: false,
    },
  },
];

// ============================================
// EXPORTS
// ============================================

export default {
  provider: googleProvider,
  models: googleModels,
};
