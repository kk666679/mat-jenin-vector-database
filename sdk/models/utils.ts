/**
 * Model Utilities
 * 
 * Utility functions for working with AI SDK models
 */

import type { ModelProvider, ModelDefinition, ModelCapabilities } from './types';

// ============================================
// PROVIDER UTILITIES
// ============================================

/**
 * Get API key environment variable name for a provider
 */
export function getAPIKeyEnvVar(provider: ModelProvider): string {
  const envVars: Record<ModelProvider, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    google: 'GOOGLE_API_KEY',
    'google-vertex': 'GOOGLE_VERTEX_API_KEY',
    deepseek: 'DEEPSEEK_API_KEY',
    xai: 'XAI_API_KEY',
    mistral: 'MISTRAL_API_KEY',
    groq: 'GROQ_API_KEY',
    cerebras: 'CEREBRAS_API_KEY',
    ollama: 'OLLAMA_API_KEY',
    cohere: 'COHERE_API_KEY',
    fireworks: 'FIREWORKS_API_KEY',
    deepinfra: 'DEEPINFRA_API_KEY',
    togetherai: 'TOGETHERAI_API_KEY',
    'amazon-bedrock': 'AWS_ACCESS_KEY_ID',
    azure: 'AZURE_OPENAI_API_KEY',
    perplexity: 'PERPLEXITY_API_KEY',
    baseten: 'BASETEN_API_KEY',
    lmnt: 'LMNT_API_KEY',
    hume: 'HUME_API_KEY',
  };
  return envVars[provider] || `${provider.toUpperCase()}_API_KEY`;
}

/**
 * Get API key from environment for a provider
 */
export function getAPIKey(provider: ModelProvider): string | undefined {
  const envVar = getAPIKeyEnvVar(provider);
  return process.env[envVar];
}

/**
 * Check if API key is available for a provider
 */
export function hasAPIKey(provider: ModelProvider): boolean {
  return !!getAPIKey(provider);
}

/**
 * Validate provider configuration
 */
export function validateProviderConfig(provider: ModelProvider): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!hasAPIKey(provider)) {
    errors.push(`API key not found for ${provider}. Set ${getAPIKeyEnvVar(provider)} environment variable.`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// MODEL UTILITIES
// ============================================

/**
 * Check if a model supports a specific capability
 */
export function modelSupportsCapability(
  model: ModelDefinition,
  capability: keyof ModelCapabilities
): boolean {
  const value = model.capabilities[capability];
  return Boolean(value);
}

/**
 * Filter models by capability
 */
export function filterModelsByCapability(
  models: ModelDefinition[],
  capability: keyof ModelCapabilities,
  value: boolean = true
): ModelDefinition[] {
  return models.filter(m => m.capabilities[capability] === value);
}

/**
 * Get models that support vision
 */
export function getVisionModels(models: ModelDefinition[]): ModelDefinition[] {
  return filterModelsByCapability(models, 'supportsVision', true);
}

/**
 * Get models that support tool usage
 */
export function getToolModels(models: ModelDefinition[]): ModelDefinition[] {
  return filterModelsByCapability(models, 'supportsToolUsage', true);
}

/**
 * Find model by ID
 */
export function findModelById(models: ModelDefinition[], modelId: string): ModelDefinition | undefined {
  return models.find(m => m.id === modelId || m.modelId === modelId);
}

/**
 * Get model display name
 */
export function getModelDisplayName(model: ModelDefinition): string {
  return `${model.name} (${model.provider})`;
}

// ============================================
// MESSAGE FORMATTING
// ============================================

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface Message {
  role: MessageRole;
  content: string;
  name?: string;
  toolCallId?: string;
}

export function createSystemMessage(content: string): Message {
  return { role: 'system', content };
}

export function createUserMessage(content: string): Message {
  return { role: 'user', content };
}

export function createAssistantMessage(content: string): Message {
  return { role: 'assistant', content };
}

export function createToolMessage(content: string, toolCallId: string): Message {
  return { role: 'tool', content, toolCallId };
}

// ============================================
// ERROR HANDLING
// ============================================

export class ModelError extends Error {
  constructor(
    message: string,
    public code?: string,
    public provider?: ModelProvider,
    public modelId?: string
  ) {
    super(message);
    this.name = 'ModelError';
  }
}

export function handleModelError(error: unknown, provider?: ModelProvider, modelId?: string): ModelError {
  if (error instanceof ModelError) {
    return error;
  }
  
  const message = error instanceof Error ? error.message : 'Unknown error';
  return new ModelError(message, 'API_ERROR', provider, modelId);
}

