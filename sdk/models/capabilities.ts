/**
 * Model Capabilities Registry
 * 
 * Contains all supported models from AI SDK providers
 * with their capabilities based on the official documentation
 */

import type { ModelDefinition, ModelProvider, ProviderModels, ModelCapabilities } from './types';

// ============================================
// CAPABILITY HELPERS
// ============================================

/**
 * Create capabilities with defaults
 */
export function createCapabilities(overrides: Partial<ModelCapabilities>): ModelCapabilities {
  return {
    supportsImageInput: false,
    supportsObjectGeneration: true,
    supportsToolUsage: true,
    supportsToolStreaming: true,
    supportsVision: false,
    supportsStreaming: true,
    supportsReasoning: false,
    ...overrides,
  };
}

// ============================================
// OPENAI MODELS
// ============================================

const openAIModels: ModelDefinition[] = [
  {
    id: 'gpt-5.2-pro',
    name: 'GPT-5.2 Pro',
    provider: 'openai',
    modelId: 'gpt-5.2-pro',
    description: 'OpenAI\'s most capable model for complex reasoning and generation',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
    recommendedFor: ['complex reasoning', 'code generation', 'multimodal tasks'],
  },
  {
    id: 'gpt-5.2-chat-latest',
    name: 'GPT-5.2 Chat Latest',
    provider: 'openai',
    modelId: 'gpt-5.2-chat-latest',
    description: 'Latest GPT-5.2 model in the chat completions API',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
  {
    id: 'gpt-5.2',
    name: 'GPT-5.2',
    provider: 'openai',
    modelId: 'gpt-5.2',
    description: 'GPT-5.2 model',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    modelId: 'gpt-5',
    description: 'OpenAI\'s GPT-5 model',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'openai',
    modelId: 'gpt-5-mini',
    description: 'Efficient GPT-5 model for faster responses',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
  {
    id: 'gpt-5-nano',
    name: 'GPT-5 Nano',
    provider: 'openai',
    modelId: 'gpt-5-nano',
    description: 'Smallest GPT-5 model for simple tasks',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
  {
    id: 'gpt-5.1-chat-latest',
    name: 'GPT-5.1 Chat Latest',
    provider: 'openai',
    modelId: 'gpt-5.1-chat-latest',
    description: 'Latest GPT-5.1 model in chat format',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
  {
    id: 'gpt-5.1-codex-mini',
    name: 'GPT-5.1 Codex Mini',
    provider: 'openai',
    modelId: 'gpt-5.1-codex-mini',
    description: 'Codex-mini variant for code tasks',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
  {
    id: 'gpt-5.1-codex',
    name: 'GPT-5.1 Codex',
    provider: 'openai',
    modelId: 'gpt-5.1-codex',
    description: 'Codex variant for advanced code tasks',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
  {
    id: 'gpt-5.1',
    name: 'GPT-5.1',
    provider: 'openai',
    modelId: 'gpt-5.1',
    description: 'GPT-5.1 model',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
  {
    id: 'gpt-5-codex',
    name: 'GPT-5 Codex',
    provider: 'openai',
    modelId: 'gpt-5-codex',
    description: 'OpenAI Codex model based on GPT-5',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
  {
    id: 'gpt-5-chat-latest',
    name: 'GPT-5 Chat Latest',
    provider: 'openai',
    modelId: 'gpt-5-chat-latest',
    description: 'Latest GPT-5 model in chat format',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    modelId: 'gpt-4o',
    description: 'OpenAI\'s flagship multimodal model',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    modelId: 'gpt-4o-mini',
    description: 'Efficient GPT-4o variant',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
];

// ============================================
// ANTHROPIC MODELS
// ============================================

const anthropicModels: ModelDefinition[] = [
  {
    id: 'claude-opus-4-6',
    name: 'Claude Opus 4.6',
    provider: 'anthropic',
    modelId: 'claude-opus-4-6-20251120',
    description: 'Anthropic\'s most capable model',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
    recommendedFor: ['complex reasoning', 'writing', 'analysis'],
  },
  {
    id: 'claude-opus-4-5',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    modelId: 'claude-opus-4-5-20241022',
    description: 'Claude Opus 4.5 model',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
  {
    id: 'claude-opus-4-1',
    name: 'Claude Opus 4.1',
    provider: 'anthropic',
    modelId: 'claude-opus-4-1-20240902',
    description: 'Claude Opus 4.1 model',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
  {
    id: 'claude-opus-4-0',
    name: 'Claude Opus 4.0',
    provider: 'anthropic',
    modelId: 'claude-opus-4-0-20240229',
    description: 'Claude Opus 4.0 model',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
  {
    id: 'claude-sonnet-4-0',
    name: 'Claude Sonnet 4.0',
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-0-20250514',
    description: 'Balanced performance and speed',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
    recommendedFor: ['balanced tasks', 'coding', 'writing'],
  },
  {
    id: 'claude-3-7-sonnet-latest',
    name: 'Claude 3.7 Sonnet Latest',
    provider: 'anthropic',
    modelId: 'claude-3-7-sonnet-latest',
    description: 'Latest Claude 3.7 Sonnet',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
  {
    id: 'claude-3-5-haiku-latest',
    name: 'Claude 3.5 Haiku Latest',
    provider: 'anthropic',
    modelId: 'claude-3-5-haiku-latest',
    description: 'Fast and efficient Claude model',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
    recommendedFor: ['fast responses', 'simple tasks'],
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-20241022',
    description: 'Claude 3.5 Sonnet model',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    modelId: 'claude-3-haiku-20240307',
    description: 'Fast Claude 3 model',
    capabilities: createCapabilities({ supportsImageInput: false }),
  },
];

// ============================================
// XAI GROK MODELS
// ============================================

const xaiModels: ModelDefinition[] = [
  {
    id: 'grok-4',
    name: 'Grok 4',
    provider: 'xai',
    modelId: 'grok-4',
    description: 'xAI\'s most capable model',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
    recommendedFor: ['general reasoning', 'coding'],
  },
  {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xai',
    modelId: 'grok-3',
    description: 'xAI Grok 3 model',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'grok-3-fast',
    name: 'Grok 3 Fast',
    provider: 'xai',
    modelId: 'grok-3-fast',
    description: 'Fast Grok 3 variant',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'grok-3-mini',
    name: 'Grok 3 Mini',
    provider: 'xai',
    modelId: 'grok-3-mini',
    description: 'Mini Grok 3 variant',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'grok-3-mini-fast',
    name: 'Grok 3 Mini Fast',
    provider: 'xai',
    modelId: 'grok-3-mini-fast',
    description: 'Fast Mini Grok 3 variant',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'grok-2-1212',
    name: 'Grok 2 1212',
    provider: 'xai',
    modelId: 'grok-2-1212',
    description: 'Grok 2 model (December 2024)',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'grok-2-vision-1212',
    name: 'Grok 2 Vision 1212',
    provider: 'xai',
    modelId: 'grok-2-vision-1212',
    description: 'Grok 2 with vision capabilities',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true, supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'grok-beta',
    name: 'Grok Beta',
    provider: 'xai',
    modelId: 'grok-beta',
    description: 'Grok beta model',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'grok-vision-beta',
    name: 'Grok Vision Beta',
    provider: 'xai',
    modelId: 'grok-vision-beta',
    description: 'Grok with vision capabilities (beta)',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true }),
    deprecated: true,
  },
];

// ============================================
// GOOGLE MODELS
// ============================================

const googleModels: ModelDefinition[] = [
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash Experimental',
    provider: 'google',
    modelId: 'gemini-2.0-flash-exp',
    description: 'Experimental Gemini 2.0 Flash model',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true, supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true, supportsReasoning: true }),
    recommendedFor: ['fast multimodal tasks', 'real-time applications'],
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    modelId: 'gemini-1.5-flash',
    description: 'Fast Gemini 1.5 model',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true, supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    modelId: 'gemini-1.5-pro',
    description: 'Pro Gemini 1.5 model',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true, supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
    recommendedFor: ['complex reasoning', 'multimodal tasks'],
  },
  {
    id: 'gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash 8B',
    provider: 'google',
    modelId: 'gemini-1.5-flash-8b',
    description: 'Efficient Gemini 1.5 Flash model',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true, supportsObjectGeneration: true, supportsToolUsage: true }),
  },
];

// ============================================
// DEEPSEEK MODELS
// ============================================

const deepseekModels: ModelDefinition[] = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    modelId: 'deepseek-chat',
    description: 'DeepSeek\'s conversational model',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
    recommendedFor: ['coding', 'reasoning'],
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    provider: 'deepseek',
    modelId: 'deepseek-reasoner',
    description: 'DeepSeek\'s reasoning model',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true, supportsReasoning: true }),
    recommendedFor: ['advanced reasoning', 'math', 'coding'],
  },
];

// ============================================
// MISTRAL MODELS
// ============================================

const mistralModels: ModelDefinition[] = [
  {
    id: 'pixtral-large-latest',
    name: 'Pixtral Large Latest',
    provider: 'mistral',
    modelId: 'pixtral-large-latest',
    description: 'Mistral\'s large multimodal model',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true, supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
    recommendedFor: ['multimodal tasks', 'large context'],
  },
  {
    id: 'mistral-large-latest',
    name: 'Mistral Large Latest',
    provider: 'mistral',
    modelId: 'mistral-large-latest',
    description: 'Mistral\'s large language model',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
    recommendedFor: ['complex reasoning', 'code generation'],
  },
  {
    id: 'mistral-medium-latest',
    name: 'Mistral Medium Latest',
    provider: 'mistral',
    modelId: 'mistral-medium-latest',
    description: 'Mistral\'s medium model',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'mistral-medium-2505',
    name: 'Mistral Medium 2505',
    provider: 'mistral',
    modelId: 'mistral-medium-2505',
    description: 'Mistral Medium model (May 2025)',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'mistral-small-latest',
    name: 'Mistral Small Latest',
    provider: 'mistral',
    modelId: 'mistral-small-latest',
    description: 'Mistral\'s small model',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'pixtral-12b-2409',
    name: 'Pixtral 12B 2409',
    provider: 'mistral',
    modelId: 'pixtral-12b-2409',
    description: 'Pixtral 12B model (September 2024)',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true, supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
];

// ============================================
// GROQ MODELS
// ============================================

const groqModels: ModelDefinition[] = [
  {
    id: 'llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout 17B',
    provider: 'groq',
    modelId: 'meta-llama/llama-4-scout-17b-16e-instruct',
    description: 'Meta\'s Llama 4 Scout model via Groq',
    capabilities: createCapabilities({ supportsImageInput: true, supportsVision: true, supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
    recommendedFor: ['fast inference', 'instruction following'],
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    provider: 'groq',
    modelId: 'llama-3.3-70b-versatile',
    description: 'Meta\'s Llama 3.3 70B model',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'groq',
    modelId: 'llama-3.1-8b-instant',
    description: 'Fast Llama 3.1 8B model',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    modelId: 'mixtral-8x7b-32768',
    description: 'Mixtral mixture of experts model',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B Instruct',
    provider: 'groq',
    modelId: 'gemma2-9b-it',
    description: 'Google\'s Gemma 2 9B model',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
];

// ============================================
// CEREBRAS MODELS
// ============================================

const cerebrasModels: ModelDefinition[] = [
  {
    id: 'llama3.1-8b',
    name: 'Llama 3.1 8B',
    provider: 'cerebras',
    modelId: 'llama3.1-8b',
    description: 'Meta\'s Llama 3.1 8B via Cerebras',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'llama3.1-70b',
    name: 'Llama 3.1 70B',
    provider: 'cerebras',
    modelId: 'llama3.1-70b',
    description: 'Meta\'s Llama 3.1 70B via Cerebras',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'llama3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'cerebras',
    modelId: 'llama3.3-70b',
    description: 'Meta\'s Llama 3.3 70B via Cerebras',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
];

// ============================================
// OLLAMA MODELS (Self-hosted)
// ============================================

const ollamaModels: ModelDefinition[] = [
  {
    id: 'llama3.3',
    name: 'Llama 3.3',
    provider: 'ollama',
    modelId: 'llama3.3',
    description: 'Meta\'s Llama 3.3 model (self-hosted)',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
    recommendedFor: ['self-hosted', 'local deployment'],
  },
  {
    id: 'llama3.2',
    name: 'Llama 3.2',
    provider: 'ollama',
    modelId: 'llama3.2',
    description: 'Meta\'s Llama 3.2 model (self-hosted)',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'llama3.1',
    name: 'Llama 3.1',
    provider: 'ollama',
    modelId: 'llama3.1',
    description: 'Meta\'s Llama 3.1 model (self-hosted)',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'qwen2.5',
    name: 'Qwen 2.5',
    provider: 'ollama',
    modelId: 'qwen2.5',
    description: 'Alibaba\'s Qwen 2.5 model (self-hosted)',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'mistral',
    name: 'Mistral',
    provider: 'ollama',
    modelId: 'mistral',
    description: 'Mistral model (self-hosted)',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
  {
    id: 'phi4',
    name: 'Phi 4',
    provider: 'ollama',
    modelId: 'phi4',
    description: 'Microsoft\'s Phi 4 model (self-hosted)',
    capabilities: createCapabilities({ supportsObjectGeneration: true, supportsToolUsage: true, supportsToolStreaming: true }),
  },
];

// ============================================
// EXPORTS
// ============================================

/**
 * All models by provider
 */
export const modelsByProvider: ProviderModels[] = [
  { provider: 'openai', providerName: 'OpenAI', models: openAIModels },
  { provider: 'anthropic', providerName: 'Anthropic', models: anthropicModels },
  { provider: 'xai', providerName: 'xAI Grok', models: xaiModels },
  { provider: 'google', providerName: 'Google Generative AI', models: googleModels },
  { provider: 'deepseek', providerName: 'DeepSeek', models: deepseekModels },
  { provider: 'mistral', providerName: 'Mistral', models: mistralModels },
  { provider: 'groq', providerName: 'Groq', models: groqModels },
  { provider: 'cerebras', providerName: 'Cerebras', models: cerebrasModels },
  { provider: 'ollama', providerName: 'Ollama', models: ollamaModels },
];

/**
 * All models flattened
 */
export const allModels: ModelDefinition[] = modelsByProvider.flatMap(p => p.models);

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: ModelProvider): ModelDefinition[] {
  return allModels.filter(m => m.provider === provider);
}

/**
 * Get model by ID
 */
export function getModelById(id: string): ModelDefinition | undefined {
  return allModels.find(m => m.id === id);
}

/**
 * Get default model for provider
 */
export function getDefaultModel(provider: ModelProvider): ModelDefinition | undefined {
  const providerModels = getModelsByProvider(provider);
  // Return first non-deprecated model
  return providerModels.find(m => !m.deprecated) ?? providerModels[0];
}

/**
 * Search models by capability
 */
export function searchModelsByCapability(
  capability: keyof ModelCapabilities,
  value: boolean = true
): ModelDefinition[] {
  return allModels.filter(m => m.capabilities[capability] === value);
}

/**
 * Get recommended models for a use case
 */
export function getRecommendedModels(useCase: string): ModelDefinition[] {
  return allModels.filter(m => 
    m.recommendedFor?.some(uc => uc.toLowerCase().includes(useCase.toLowerCase()))
  );
}

export {
  openAIModels,
  anthropicModels,
  xaiModels,
  googleModels,
  deepseekModels,
  mistralModels,
  groqModels,
  cerebrasModels,
  ollamaModels,
};
