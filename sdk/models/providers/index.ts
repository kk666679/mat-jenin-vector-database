/**
 * Provider Exports
 * 
 * Central export point for all AI SDK providers
 */

import type { ProviderInfo, ModelDefinition } from '../types';

// Re-export types
export type { ProviderInfo, ModelDefinition } from '../types';

// Re-export all providers
export { openaiProvider, openaiModels, default as openai } from './openai';
export { anthropicProvider, anthropicModels, default as anthropic } from './anthropic';
export { googleProvider, googleModels, default as google } from './google';
export { deepseekProvider, deepseekModels, default as deepseek } from './deepseek';
export { groqProvider, groqModels, default as groq } from './groq';
export { ollamaProvider, ollamaModels, default as ollama } from './ollama';
export { xaiProvider, xaiModels, default as xai } from './xai';
export { mistralProvider, mistralModels, default as mistral } from './mistral';
export { cerebrasProvider, cerebrasModels, default as cerebras } from './cerebras';

// Import providers for the mapping
import { openaiProvider, openaiModels } from './openai';
import { anthropicProvider, anthropicModels } from './anthropic';
import { googleProvider, googleModels } from './google';
import { deepseekProvider, deepseekModels } from './deepseek';
import { groqProvider, groqModels } from './groq';
import { ollamaProvider, ollamaModels } from './ollama';
import { xaiProvider, xaiModels } from './xai';
import { mistralProvider, mistralModels } from './mistral';
import { cerebrasProvider, cerebrasModels } from './cerebras';

// Provider mapping type
export interface ProviderModule {
  provider: ProviderInfo;
  models: ModelDefinition[];
}

// All providers as a record
export const providers: Record<string, ProviderModule> = {
  openai: { provider: openaiProvider, models: openaiModels },
  anthropic: { provider: anthropicProvider, models: anthropicModels },
  google: { provider: googleProvider, models: googleModels },
  deepseek: { provider: deepseekProvider, models: deepseekModels },
  groq: { provider: groqProvider, models: groqModels },
  ollama: { provider: ollamaProvider, models: ollamaModels },
  xai: { provider: xaiProvider, models: xaiModels },
  mistral: { provider: mistralProvider, models: mistralModels },
  cerebras: { provider: cerebrasProvider, models: cerebrasModels },
};

// Get provider info by ID
export function getProvider(providerId: string): ProviderModule | undefined {
  return providers[providerId];
}

// Get all provider IDs
export function getAllProviderIds(): string[] {
  return Object.keys(providers);
}

