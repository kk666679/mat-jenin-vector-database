/**
 * Mistral Provider Configuration
 * 
 * AI SDK provider for Mistral AI models
 */

import type { ProviderInfo, ModelDefinition } from '../types';

// ============================================
// PROVIDER INFO
// ============================================

export const mistralProvider: ProviderInfo = {
  id: 'mistral',
  name: 'Mistral',
  website: 'https://mistral.ai',
  docsURL: 'https://docs.mistral.ai',
  baseURL: 'https://api.mistral.ai/v1',
  defaultModel: 'mistral-large-latest',
  supportsStreaming: true,
  requiresAPIKey: true,
  authType: 'bearer',
};

// ============================================
// MODELS
// ============================================

export const mistralModels: ModelDefinition[] = [
  {
    id: 'pixtral-large-latest',
    name: 'Pixtral Large Latest',
    provider: 'mistral',
    modelId: 'pixtral-large-latest',
    description: 'Mistral\'s large multimodal model',
    capabilities: {
      supportsImageInput: true,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: true,
      supportsStreaming: true,
      supportsReasoning: false,
    },
    recommendedFor: ['multimodal tasks', 'large context'],
  },
  {
    id: 'mistral-large-latest',
    name: 'Mistral Large Latest',
    provider: 'mistral',
    modelId: 'mistral-large-latest',
    description: 'Mistral\'s large language model',
    capabilities: {
      supportsImageInput: false,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: false,
      supportsStreaming: true,
      supportsReasoning: false,
    },
    recommendedFor: ['complex reasoning', 'code generation'],
  },
  {
    id: 'mistral-medium-latest',
    name: 'Mistral Medium Latest',
    provider: 'mistral',
    modelId: 'mistral-medium-latest',
    description: 'Mistral\'s medium model',
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
    id: 'mistral-small-latest',
    name: 'Mistral Small Latest',
    provider: 'mistral',
    modelId: 'mistral-small-latest',
    description: 'Mistral\'s small model',
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
    id: 'pixtral-12b-2409',
    name: 'Pixtral 12B 2409',
    provider: 'mistral',
    modelId: 'pixtral-12b-2409',
    description: 'Pixtral 12B model (September 2024)',
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
];

// ============================================
// EXPORTS
// ============================================

export default {
  provider: mistralProvider,
  models: mistralModels,
};

