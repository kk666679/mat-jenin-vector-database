/**
 * Cerebras Provider Configuration
 * 
 * AI SDK provider for Cerebras models (fast inference)
 */

import type { ProviderInfo, ModelDefinition } from '../types';

// ============================================
// PROVIDER INFO
// ============================================

export const cerebrasProvider: ProviderInfo = {
  id: 'cerebras',
  name: 'Cerebras',
  website: 'https://cerebras.ai',
  docsURL: 'https://docs.cerebras.ai',
  baseURL: 'https://api.cerebras.ai/v1',
  defaultModel: 'llama3.1-70b',
  supportsStreaming: true,
  requiresAPIKey: true,
  authType: 'bearer',
};

// ============================================
// MODELS
// ============================================

export const cerebrasModels: ModelDefinition[] = [
  {
    id: 'llama3.1-8b',
    name: 'Llama 3.1 8B',
    provider: 'cerebras',
    modelId: 'llama3.1-8b',
    description: 'Meta\'s Llama 3.1 8B via Cerebras',
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
    id: 'llama3.1-70b',
    name: 'Llama 3.1 70B',
    provider: 'cerebras',
    modelId: 'llama3.1-70b',
    description: 'Meta\'s Llama 3.1 70B via Cerebras',
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
    id: 'llama3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'cerebras',
    modelId: 'llama3.3-70b',
    description: 'Meta\'s Llama 3.3 70B via Cerebras',
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
  provider: cerebrasProvider,
  models: cerebrasModels,
};

