
/**
 * xAI Grok Provider Configuration
 * 
 * AI SDK provider for xAI Grok models
 */

import type { ProviderInfo, ModelDefinition } from '../types';

// ============================================
// PROVIDER INFO
// ============================================

export const xaiProvider: ProviderInfo = {
  id: 'xai',
  name: 'xAI Grok',
  website: 'https://x.ai',
  docsURL: 'https://docs.x.ai',
  baseURL: 'https://api.x.ai/v1',
  defaultModel: 'grok-2-vision-1212',
  supportsStreaming: true,
  requiresAPIKey: true,
  authType: 'bearer',
};

// ============================================
// MODELS
// ============================================

export const xaiModels: ModelDefinition[] = [
  {
    id: 'grok-4',
    name: 'Grok 4',
    provider: 'xai',
    modelId: 'grok-4',
    description: 'xAI\'s most capable model',
    capabilities: {
      supportsImageInput: false,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: false,
      supportsStreaming: true,
      supportsReasoning: false,
    },
    recommendedFor: ['general reasoning', 'coding'],
  },
  {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xai',
    modelId: 'grok-3',
    description: 'xAI Grok 3 model',
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
    id: 'grok-3-fast',
    name: 'Grok 3 Fast',
    provider: 'xai',
    modelId: 'grok-3-fast',
    description: 'Fast Grok 3 variant',
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
    id: 'grok-3-mini',
    name: 'Grok 3 Mini',
    provider: 'xai',
    modelId: 'grok-3-mini',
    description: 'Mini Grok 3 variant',
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
    id: 'grok-2-1212',
    name: 'Grok 2 1212',
    provider: 'xai',
    modelId: 'grok-2-1212',
    description: 'Grok 2 model (December 2024)',
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
    id: 'grok-2-vision-1212',
    name: 'Grok 2 Vision 1212',
    provider: 'xai',
    modelId: 'grok-2-vision-1212',
    description: 'Grok 2 with vision capabilities',
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
    id: 'grok-beta',
    name: 'Grok Beta',
    provider: 'xai',
    modelId: 'grok-beta',
    description: 'Grok beta model',
    capabilities: {
      supportsImageInput: false,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: false,
      supportsStreaming: true,
      supportsReasoning: false,
    },
    deprecated: true,
  },
  {
    id: 'grok-vision-beta',
    name: 'Grok Vision Beta',
    provider: 'xai',
    modelId: 'grok-vision-beta',
    description: 'Grok with vision capabilities (beta)',
    capabilities: {
      supportsImageInput: true,
      supportsObjectGeneration: false,
      supportsToolUsage: false,
      supportsToolStreaming: false,
      supportsVision: true,
      supportsStreaming: true,
      supportsReasoning: false,
    },
    deprecated: true,
  },
];

// ============================================
// EXPORTS
// ============================================

export default {
  provider: xaiProvider,
  models: xaiModels,
};

