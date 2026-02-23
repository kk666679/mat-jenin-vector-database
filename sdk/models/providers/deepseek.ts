/**
 * DeepSeek Provider Configuration
 * 
 * AI SDK provider for DeepSeek models
 */

import type { ProviderInfo, ModelDefinition } from '../types';

// ============================================
// PROVIDER INFO
// ============================================

export const deepseekProvider: ProviderInfo = {
  id: 'deepseek',
  name: 'DeepSeek',
  website: 'https://www.deepseek.com',
  docsURL: 'https://platform.deepseek.com/docs',
  baseURL: 'https://api.deepseek.com/v1',
  defaultModel: 'deepseek-chat',
  supportsStreaming: true,
  requiresAPIKey: true,
  authType: 'bearer',
};

// ============================================
// MODELS
// ============================================

export const deepseekModels: ModelDefinition[] = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    modelId: 'deepseek-chat',
    description: 'DeepSeek\'s conversational model',
    capabilities: {
      supportsImageInput: false,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: false,
      supportsStreaming: true,
      supportsReasoning: false,
    },
    recommendedFor: ['coding', 'reasoning'],
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    provider: 'deepseek',
    modelId: 'deepseek-reasoner',
    description: 'DeepSeek\'s reasoning model',
    capabilities: {
      supportsImageInput: false,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: false,
      supportsStreaming: true,
      supportsReasoning: true,
    },
    recommendedFor: ['advanced reasoning', 'math', 'coding'],
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'deepseek',
    modelId: 'deepseek-coder',
    description: 'DeepSeek\'s code generation model',
    capabilities: {
      supportsImageInput: false,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: false,
      supportsStreaming: true,
      supportsReasoning: false,
    },
    recommendedFor: ['code generation', 'programming'],
  },
];

// ============================================
// EXPORTS
// ============================================

export default {
  provider: deepseekProvider,
  models: deepseekModels,
};
