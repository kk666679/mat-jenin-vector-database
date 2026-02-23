/**
 * Ollama Provider Configuration
 * 
 * AI SDK provider for Ollama (self-hosted models)
 */

import type { ProviderInfo, ModelDefinition } from '../types';

// ============================================
// PROVIDER INFO
// ============================================

export const ollamaProvider: ProviderInfo = {
  id: 'ollama',
  name: 'Ollama',
  website: 'https://ollama.com',
  docsURL: 'https://github.com/ollama/ollama',
  baseURL: 'http://localhost:11434',
  defaultModel: 'llama3.1',
  supportsStreaming: true,
  requiresAPIKey: false,
  authType: 'bearer',
};

// ============================================
// MODELS
// ============================================

export const ollamaModels: ModelDefinition[] = [
  {
    id: 'llama3.3',
    name: 'Llama 3.3',
    provider: 'ollama',
    modelId: 'llama3.3',
    description: 'Meta\'s Llama 3.3 model (self-hosted)',
    capabilities: {
      supportsImageInput: false,
      supportsObjectGeneration: true,
      supportsToolUsage: true,
      supportsToolStreaming: true,
      supportsVision: false,
      supportsStreaming: true,
      supportsReasoning: false,
    },
    recommendedFor: ['self-hosted', 'local deployment'],
  },
  {
    id: 'llama3.2',
    name: 'Llama 3.2',
    provider: 'ollama',
    modelId: 'llama3.2',
    description: 'Meta\'s Llama 3.2 model (self-hosted)',
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
    id: 'llama3.1',
    name: 'Llama 3.1',
    provider: 'ollama',
    modelId: 'llama3.1',
    description: 'Meta\'s Llama 3.1 model (self-hosted)',
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
    id: 'qwen2.5',
    name: 'Qwen 2.5',
    provider: 'ollama',
    modelId: 'qwen2.5',
    description: 'Alibaba\'s Qwen 2.5 model (self-hosted)',
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
    id: 'mistral',
    name: 'Mistral',
    provider: 'ollama',
    modelId: 'mistral',
    description: 'Mistral model (self-hosted)',
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
    id: 'phi4',
    name: 'Phi 4',
    provider: 'ollama',
    modelId: 'phi4',
    description: 'Microsoft\'s Phi 4 model (self-hosted)',
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
    id: 'codellama',
    name: 'Code Llama',
    provider: 'ollama',
    modelId: 'codellama',
    description: 'Code Llama model (self-hosted)',
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
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'ollama',
    modelId: 'deepseek-coder',
    description: 'DeepSeek Coder model (self-hosted)',
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
  provider: ollamaProvider,
  models: ollamaModels,
};
