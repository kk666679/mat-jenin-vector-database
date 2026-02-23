/**
 * AI SDK Integration Layer
 * Migrated from custom LLM client to Vercel AI SDK for:
 * - Better provider abstraction
 * - Streaming support
 * - Tool calling
 * - Structured output
 * - Built-in retry logic
 * 
 * Based on ai-sdk-core skill best practices
 */

import { 
  generateText, 
  streamText, 
  // tool,
} from 'ai';
import { z } from 'zod';

// Lazy-loaded providers for optimal bundle size
let openaiProvider: any = null;
let googleProvider: any = null;
let anthropicProvider: any = null;
let deepseekProvider: any = null;
let cohereProvider: any = null;

// ============================================
// TYPES
// ============================================

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  documentId: string;
  documentTitle: string;
  metadata?: Record<string, unknown>;
}

export interface GenerateOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxOutputTokens?: number;
  provider?: 'openai' | 'anthropic' | 'google' | 'deepseek' | 'cohere';
  model?: string;
}

export interface GenerateResult {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface StreamOptions extends GenerateOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (result: GenerateResult) => void;
  onError?: (error: Error) => void;
}

export interface RAGOptions {
  query: string;
  context: SearchResult[];
  systemPrompt?: string;
  maxContextChunks?: number;
  provider?: 'openai' | 'anthropic' | 'google';
  model?: string;
}

export interface RAGResult {
  answer: string;
  sources: Array<{
    documentTitle: string;
    chunkContent: string;
    score: number;
  }>;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// ============================================
// DEFAULT SYSTEM PROMPTS
// ============================================

export const DEFAULT_RAG_SYSTEM_PROMPT = `You are a helpful AI assistant that answers questions based on the provided context from documents.
Your goal is to provide accurate, relevant answers using only the information from the context.
If the context doesn't contain enough information to answer the question, say so clearly.
Always cite your sources when possible using the document titles.
Be concise but thorough in your explanations.`;

export const DEFAULT_SUMMARIZE_PROMPT = `Summarize the following document content concisely while preserving key information:`;

// ============================================
// PROVIDER INITIALIZATION (Lazy Loading)
// ============================================

async function getOpenAIProvider() {
  if (!openaiProvider) {
    const mod = await import('@ai-sdk/openai');
    openaiProvider = mod.openai;
  }
  return openaiProvider;
}

async function getGoogleProvider() {
  if (!googleProvider) {
    const mod = await import('@ai-sdk/google');
    googleProvider = mod.google;
  }
  return googleProvider;
}

async function getAnthropicProvider() {
  if (!anthropicProvider) {
    const mod = await import('@ai-sdk/anthropic');
    anthropicProvider = mod.anthropic;
  }
  return anthropicProvider;
}

async function getDeepseekProvider() {
  if (!deepseekProvider) {
    const mod = await import('@ai-sdk/deepseek');
    deepseekProvider = mod.deepseek;
  }
  return deepseekProvider;
}

async function getCohereProvider() {
  if (!cohereProvider) {
    const mod = await import('@ai-sdk/cohere');
    cohereProvider = mod.cohere;
  }
  return cohereProvider;
}

// ============================================
// TEXT GENERATION (AI SDK)
// ============================================

/**
 * Generate text using AI SDK
 * Follows ai-sdk-core skill best practices
 */
export async function generateTextAI(options: GenerateOptions): Promise<GenerateResult> {
  const { 
    prompt, 
    systemPrompt, 
    temperature = 0.7, 
    maxOutputTokens = 2048,
    provider = 'openai',
    model 
  } = options;

  try {
    let result;

    const generateOptions: Record<string, unknown> = {
      prompt,
      temperature,
      maxOutputTokens,
    };

    switch (provider) {
      case 'openai': {
        const sdk = await getOpenAIProvider();
        const modelId = model || 'gpt-4o-mini';
        generateOptions.model = sdk(modelId);
        if (systemPrompt) {
          generateOptions.system = systemPrompt;
        }
        result = await generateText(generateOptions as never);
        break;
      }

      case 'anthropic': {
        const sdk = await getAnthropicProvider();
        const modelId = model || 'claude-sonnet-4-5-20250929';
        generateOptions.model = sdk(modelId);
        if (systemPrompt) {
          generateOptions.system = systemPrompt;
        }
        result = await generateText(generateOptions as never);
        break;
      }

      case 'google': {
        const sdk = await getGoogleProvider();
        const modelId = model || 'gemini-2.5-flash';
        generateOptions.model = sdk(modelId);
        if (systemPrompt) {
          generateOptions.system = systemPrompt;
        }
        result = await generateText(generateOptions as never);
        break;
      }

      case 'deepseek': {
        const sdk = await getDeepseekProvider();
        const modelId = model || 'deepseek-chat';
        generateOptions.model = sdk(modelId);
        if (systemPrompt) {
          generateOptions.system = systemPrompt;
        }
        result = await generateText(generateOptions as never);
        break;
      }

      case 'cohere': {
        const sdk = await getCohereProvider();
        const modelId = model || 'command-r-plus';
        generateOptions.model = sdk(modelId);
        if (systemPrompt) {
          generateOptions.system = systemPrompt;
        }
        result = await generateText(generateOptions as never);
        break;
      }

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    // Extract usage with proper fallbacks (AI SDK v6 uses inputTokens/outputTokens)
    const usage = result.usage;
    const returnValue: GenerateResult = {
      content: result.text,
      finishReason: result.finishReason,
    };
    
    if (usage) {
      returnValue.usage = {
        promptTokens: usage.inputTokens ?? 0,
        completionTokens: usage.outputTokens ?? 0,
        totalTokens: (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
      };
    }
    
    return returnValue;
  } catch (error) {
    console.error(`AI SDK generation error (${provider}):`, error);
    throw error;
  }
}

// ============================================
// STREAMING TEXT (AI SDK)
// ============================================

/**
 * Stream text using AI SDK
 * Returns async generator for consumption
 */
export async function streamTextAI(options: StreamOptions): Promise<AsyncGenerator<string>> {
  const { 
    prompt, 
    systemPrompt, 
    temperature = 0.7, 
    maxOutputTokens = 2048,
    provider = 'openai',
    model 
  } = options;

  let result: any;

  switch (provider) {
    case 'openai': {
      const sdk = await getOpenAIProvider();
      const modelId = model || 'gpt-4o-mini';
      result = await streamText({
        model: sdk(modelId),
        ...(systemPrompt ? { system: systemPrompt } : {}),
        prompt,
        temperature,
        maxOutputTokens,
      });
      break;
    }

    case 'anthropic': {
      const sdk = await getAnthropicProvider();
      const modelId = model || 'claude-sonnet-4-5-20250929';
      result = await streamText({
        model: sdk(modelId),
        ...(systemPrompt ? { system: systemPrompt } : {}),
        prompt,
        temperature,
        maxOutputTokens,
      });
      break;
    }

    case 'google': {
      const sdk = await getGoogleProvider();
      const modelId = model || 'gemini-2.5-flash';
      result = await streamText({
        model: sdk(modelId),
        ...(systemPrompt ? { system: systemPrompt } : {}),
        prompt,
        temperature,
        maxOutputTokens,
      });
      break;
    }

    default:
      throw new Error(`Unsupported streaming provider: ${provider}`);
  }

  // Create async generator
  async function* generate(): AsyncGenerator<string> {
    try {
      for await (const chunk of result.textStream) {
        if (options.onChunk) {
          options.onChunk(chunk);
        }
        yield chunk;
      }

      // Call onComplete callback if provided
      if (options.onComplete) {
        const fullResult = await result;
        const usage = fullResult.usage;
        const usageValue = usage ? {
          promptTokens: usage.inputTokens ?? 0,
          completionTokens: usage.outputTokens ?? 0,
          totalTokens: (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
        } : {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        };
        options.onComplete({
          content: fullResult.text,
          usage: usageValue,
          finishReason: fullResult.finishReason,
        });
      }
    } catch (error) {
      if (options.onError) {
        options.onError(error as Error);
      }
      throw error;
    }
  }

  return generate();
}

// ============================================
// RAG PIPELINE WITH AI SDK
// ============================================

/**
 * RAG Pipeline using AI SDK for generation
 */
export class RAGPipelineAI {
  private defaultProvider: 'openai' | 'anthropic' | 'google';
  private defaultModel: string;

  constructor(
    defaultProvider: 'openai' | 'anthropic' | 'google' = 'openai',
    defaultModel?: string
  ) {
    this.defaultProvider = defaultProvider;
    this.defaultModel = defaultModel || 'gpt-4o-mini';
  }

  /**
   * Execute RAG query with AI SDK
   */
  async query(options: RAGOptions): Promise<RAGResult> {
    const {
      query,
      context,
      systemPrompt = DEFAULT_RAG_SYSTEM_PROMPT,
      maxContextChunks = 5,
      provider = this.defaultProvider,
      model = this.defaultModel,
    } = options;

    // Limit context chunks
    const limitedContext = context.slice(0, maxContextChunks);

    // Build context string
    const contextStr = limitedContext
      .map((item, i) => `[Document ${i + 1}: ${item.documentTitle}]\n${item.content}`)
      .join('\n\n---\n\n');

    // Build the prompt with context
    const prompt = `Context from documents:
${contextStr}

Question: ${query}

Based on the context above, please provide a helpful answer. Cite the document titles when you use information from them.`;

    // Generate response using AI SDK
    const generateOptions: {
      prompt: string;
      systemPrompt: string;
      provider: 'openai' | 'anthropic' | 'google';
      model?: string;
    } = {
      prompt,
      systemPrompt,
      provider,
    };
    if (model) {
      generateOptions.model = model;
    }
    const result = await generateTextAI(generateOptions);

    // Format sources
    const sources = limitedContext.map((item) => ({
      documentTitle: item.documentTitle,
      chunkContent: item.content,
      score: item.score,
    }));

    return {
      answer: result.content,
      sources,
      usage: result.usage ?? {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }

  /**
   * Stream RAG query for real-time responses
   */
  async *queryStream(options: RAGOptions): AsyncGenerator<string> {
    const {
      query,
      context,
      systemPrompt = DEFAULT_RAG_SYSTEM_PROMPT,
      maxContextChunks = 5,
      provider = this.defaultProvider,
      model = this.defaultModel,
    } = options;

    const limitedContext = context.slice(0, maxContextChunks);

    const contextStr = limitedContext
      .map((item, i) => `[Document ${i + 1}: ${item.documentTitle}]\n${item.content}`)
      .join('\n\n---\n\n');

    const prompt = `Context from documents:
${contextStr}

Question: ${query}

Based on the context above, please provide a helpful answer.`;

    // Stream using AI SDK
    const streamOptions: {
      prompt: string;
      systemPrompt: string;
      provider: 'openai' | 'anthropic' | 'google';
      model?: string;
    } = {
      prompt,
      systemPrompt,
      provider,
    };
    if (model) {
      streamOptions.model = model;
    }
    const generator = await streamTextAI(streamOptions);

    for await (const chunk of generator) {
      yield chunk;
    }
  }
}

// ============================================
// TOOL CALLING (AI SDK)
// ============================================

/**
 * Example: Weather tool schema using Zod
 * In AI SDK v6, tools are defined differently - see official docs for full implementation
 */
export const weatherSchema = z.object({
  location: z.string().describe('The city and country, e.g. San Francisco, CA'),
  unit: z.enum(['celsius', 'fahrenheit']).optional().default('fahrenheit'),
});

export type WeatherInput = z.infer<typeof weatherSchema>;

/**
 * Example tool handler - demonstrates tool execution pattern
 * Tools in AI SDK v6 are passed to generateText/streamText
 */
export async function handleToolExecution(
  toolName: string, 
  input: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case 'weather':
      // In production, call actual weather API
      return {
        location: input.location,
        temperature: 72,
        unit: input.unit || 'fahrenheit',
        conditions: 'Partly cloudy',
        humidity: 65,
      };
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

/**
 * Generate text with tools using AI SDK
 * Note: Tools are passed to generateText via the 'tools' parameter
 * 
 * @example
 * const result = await generateText({
 *   model: openai('gpt-4'),
 *   prompt: 'What is the weather?',
 *   tools: {
 *     weather: {
 *       description: 'Get weather',
 *       parameters: weatherSchema,
 *     }
 *   }
 * });
 */
export async function generateTextWithTools(
  _prompt: string,
  _tools: Record<string, any>,
  _options: {
    provider?: 'openai' | 'anthropic' | 'google';
    model?: string;
    systemPrompt?: string;
    temperature?: number;
    maxOutputTokens?: number;
  } = {}
) {
  // This is a placeholder - in practice, pass tools directly to generateText
  throw new Error('Use generateText from AI SDK directly with tools parameter');
}

// ============================================
// STRUCTURED OUTPUT (AI SDK v6 Output API)
// ============================================

/**
 * Generate structured object using AI SDK
 * Uses generateText with output property for type-safe responses
 * 
 * @example
 * import { z } from 'zod';
 * 
 * const schema = z.object({
 *   name: z.string(),
 *   age: z.number(),
 * });
 * 
 * const result = await generateStructured(schema, 'Generate a person named John who is 30 years old');
 */
export async function generateStructured<T extends z.ZodType>(
  schema: T,
  prompt: string,
  options: {
    provider?: 'openai' | 'anthropic' | 'google';
    model?: string;
    systemPrompt?: string;
    temperature?: number;
    maxOutputTokens?: number;
  } = {}
): Promise<z.infer<T>> {
  const {
    provider = 'openai',
    model,
    systemPrompt,
    temperature = 0.7,
    maxOutputTokens = 4096,
  } = options;

  try {
    let result;

    switch (provider) {
      case 'openai': {
        const sdk = await getOpenAIProvider();
        const modelId = model || 'gpt-4o-mini';
        result = await generateText({
          model: sdk(modelId),
          system: systemPrompt,
          prompt,
          temperature,
          maxOutputTokens,
          ...{ output: 'object' as any, schema },
        } as any);
        break;
      }

      case 'anthropic': {
        const sdk = await getAnthropicProvider();
        const modelId = model || 'claude-sonnet-4-5-20250929';
        result = await generateText({
          model: sdk(modelId),
          system: systemPrompt,
          prompt,
          temperature,
          maxOutputTokens,
          ...{ output: 'object' as any, schema },
        } as any);
        break;
      }

      case 'google': {
        const sdk = await getGoogleProvider();
        const modelId = model || 'gemini-2.5-flash';
        result = await generateText({
          model: sdk(modelId),
          system: systemPrompt,
          prompt,
          temperature,
          maxOutputTokens,
          ...{ output: 'object' as any, schema },
        } as any);
        break;
      }

      default:
        throw new Error(`Unsupported provider for structured output: ${provider}`);
    }

    // In AI SDK v6 with generateText output, the result is in result.output
    return result.output as z.infer<T>;
  } catch (error) {
    console.error('Structured generation error:', error);
    throw error;
  }
}

/**
 * Generate structured array using AI SDK
 * Uses generateText with output property for type-safe array responses
 * 
 * @example
 * import { z } from 'zod';
 * 
 * const itemSchema = z.object({
 *   name: z.string(),
 *   quantity: z.number(),
 * });
 * 
 * const result = await generateArray(itemSchema, 'Generate a shopping list with 3 items');
 */
export async function generateArray<T extends z.ZodType>(
  schema: T,
  prompt: string,
  options: {
    provider?: 'openai' | 'anthropic' | 'google';
    model?: string;
    systemPrompt?: string;
    temperature?: number;
    maxOutputTokens?: number;
  } = {}
): Promise<z.infer<T>[]> {
  const {
    provider = 'openai',
    model,
    systemPrompt,
    temperature = 0.7,
    maxOutputTokens = 4096,
  } = options;

  try {
    let result;

    switch (provider) {
      case 'openai': {
        const sdk = await getOpenAIProvider();
        const modelId = model || 'gpt-4o-mini';
        result = await generateText({
          model: sdk(modelId),
          system: systemPrompt,
          prompt,
          temperature,
          maxOutputTokens,
          ...{ output: { type: 'array', schema } as any },
        } as any);
        break;
      }

      case 'anthropic': {
        const sdk = await getAnthropicProvider();
        const modelId = model || 'claude-sonnet-4-5-20250929';
        result = await generateText({
          model: sdk(modelId),
          system: systemPrompt,
          prompt,
          temperature,
          maxOutputTokens,
          ...{ output: { type: 'array', schema } as any },
        } as any);
        break;
      }

      case 'google': {
        const sdk = await getGoogleProvider();
        const modelId = model || 'gemini-2.5-flash';
        result = await generateText({
          model: sdk(modelId),
          system: systemPrompt,
          prompt,
          temperature,
          maxOutputTokens,
          ...{ output: { type: 'array', schema } as any },
        } as any);
        break;
      }

      default:
        throw new Error(`Unsupported provider for array output: ${provider}`);
    }

    // In AI SDK v6 with generateText output, the result is in result.output
    return result.output as unknown as z.infer<T>[];
  } catch (error) {
    console.error('Array generation error:', error);
    throw error;
  }
}

/**
 * Generate enum value using AI SDK
 * Uses generateText with output property for enum responses
 * 
 * @example
 * const result = await generateEnum(
 *   ['red', 'blue', 'green'],
 *   'What is the color of the sky?'
 * );
 */
export async function generateEnum(
  enumValues: string[],
  prompt: string,
  options: {
    provider?: 'openai' | 'anthropic' | 'google';
    model?: string;
    systemPrompt?: string;
    temperature?: number;
    maxOutputTokens?: number;
  } = {}
): Promise<string> {
  const {
    provider = 'openai',
    model,
    systemPrompt,
    temperature = 0.7,
    maxOutputTokens = 1024,
  } = options;

  try {
    let result;

    switch (provider) {
      case 'openai': {
        const sdk = await getOpenAIProvider();
        const modelId = model || 'gpt-4o-mini';
        result = await generateText({
          model: sdk(modelId),
          system: systemPrompt,
          prompt,
          temperature,
          maxOutputTokens,
          ...{ output: { type: 'enum', enum: enumValues } as any },
        } as any);
        break;
      }

      case 'anthropic': {
        const sdk = await getAnthropicProvider();
        const modelId = model || 'claude-sonnet-4-5-20250929';
        result = await generateText({
          model: sdk(modelId),
          system: systemPrompt,
          prompt,
          temperature,
          maxOutputTokens,
          ...{ output: { type: 'enum', enum: enumValues } as any },
        } as any);
        break;
      }

      case 'google': {
        const sdk = await getGoogleProvider();
        const modelId = model || 'gemini-2.5-flash';
        result = await generateText({
          model: sdk(modelId),
          system: systemPrompt,
          prompt,
          temperature,
          maxOutputTokens,
          ...{ output: { type: 'enum', enum: enumValues } as any },
        } as any);
        break;
      }

      default:
        throw new Error(`Unsupported provider for enum output: ${provider}`);
    }

    // In AI SDK v6 with generateText output, the result is in result.output
    return result.output as string;
  } catch (error) {
    console.error('Enum generation error:', error);
    throw error;
  }
}

/**
 * Generate JSON without schema using AI SDK
 * Uses generateText with output property for raw JSON responses
 * 
 * @example
 * const result = await generateJson('Generate a JSON object representing a person');
 */
export async function generateJson(
  prompt: string,
  options: {
    provider?: 'openai' | 'anthropic' | 'google';
    model?: string;
    systemPrompt?: string;
    temperature?: number;
    maxOutputTokens?: number;
  } = {}
): Promise<unknown> {
  const {
    provider = 'openai',
    model,
    systemPrompt,
    temperature = 0.7,
    maxOutputTokens = 4096,
  } = options;

  try {
    let result;

    switch (provider) {
      case 'openai': {
        const sdk = await getOpenAIProvider();
        const modelId = model || 'gpt-4o-mini';
        result = await generateText({
          model: sdk(modelId),
          system: systemPrompt,
          prompt,
          temperature,
          maxOutputTokens,
          ...{ output: { type: 'no-schema' } as any },
        } as any);
        break;
      }

      case 'anthropic': {
        const sdk = await getAnthropicProvider();
        const modelId = model || 'claude-sonnet-4-5-20250929';
        result = await generateText({
          model: sdk(modelId),
          system: systemPrompt,
          prompt,
          temperature,
          maxOutputTokens,
          ...{ output: { type: 'no-schema' } as any },
        } as any);
        break;
      }

      case 'google': {
        const sdk = await getGoogleProvider();
        const modelId = model || 'gemini-2.5-flash';
        result = await generateText({
          model: sdk(modelId),
          system: systemPrompt,
          prompt,
          temperature,
          maxOutputTokens,
          ...{ output: { type: 'no-schema' } as any },
        } as any);
        break;
      }

      default:
        throw new Error(`Unsupported provider for JSON output: ${provider}`);
    }

    // In AI SDK v6 with generateText output, the result is in result.output
    return result.output as unknown;
  } catch (error) {
    console.error('JSON generation error:', error);
    throw error;
  }
}

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Create RAG pipeline with AI SDK
 */
export function createRAGPipelineAI(
  provider: 'openai' | 'anthropic' | 'google' = 'openai',
  model?: string
): RAGPipelineAI {
  return new RAGPipelineAI(provider, model);
}

/**
 * Get default provider from environment
 */
export function getDefaultProvider(): 'openai' | 'anthropic' | 'google' {
  const provider = process.env.LLM_PROVIDER?.toLowerCase();
  if (provider === 'anthropic' || provider === 'google') {
    return provider;
  }
  return 'openai';
}

/**
 * Get default model for provider
 */
export function getDefaultModel(provider: string): string {
  const modelMap: Record<string, string> = {
    openai: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    anthropic: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
    google: process.env.GOOGLE_MODEL || 'gemini-2.5-flash',
    deepseek: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    cohere: process.env.COHERE_MODEL || 'command-r-plus',
  };
  return modelMap[provider] || 'gpt-4o-mini';
}

// ============================================
// ERROR HANDLING (Following AI SDK Core Skill)
// ============================================

export class AIGenerationError extends Error {
  constructor(
    message: string,
    public provider: string,
    public statusCode?: number,
    public responseBody?: string
  ) {
    super(message);
    this.name = 'AIGenerationError';
  }
}

export class AIAPIError extends Error {
  constructor(
    message: string,
    public provider: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AIAPIError';
  }
}

/**
 * Handle AI SDK errors with proper classification
 * Based on ai-sdk-core skill error handling patterns
 */
export function handleAIError(error: unknown, provider?: string): Error {
  if (error instanceof Error) {
    // Check for common AI SDK error patterns
    if ('statusCode' in error) {
      const statusCode = (error as any).statusCode;
      if (statusCode === 401) {
        return new AIAPIError('Invalid API key', provider || 'unknown', 401);
      } else if (statusCode === 429) {
        return new AIAPIError('Rate limit exceeded - implement backoff', provider || 'unknown', 429);
      } else if (statusCode >= 500) {
        return new AIAPIError('Provider server error - will retry', provider || 'unknown', statusCode);
      }
    }
    return error;
  }
  return new AIGenerationError('Unknown error during AI generation', provider || 'unknown');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Count tokens (approximate)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Truncate text to fit token limit
 */
export function truncateToTokenLimit(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '...';
}

/**
 * Build context window with token budgeting
 */
export function buildContextWindow(
  chunks: SearchResult[],
  maxTokens: number,
  queryTokens: number = 500
): SearchResult[] {
  const availableTokens = maxTokens - queryTokens - 200;
  const selected: SearchResult[] = [];
  let currentTokens = 0;

  for (const chunk of chunks) {
    const chunkTokens = estimateTokens(chunk.content);
    if (currentTokens + chunkTokens > availableTokens) break;
    selected.push(chunk);
    currentTokens += chunkTokens;
  }

  return selected;
}

// ============================================
// RE-EXPORT LEGACY FUNCTIONS FOR BACKWARDS COMPATIBILITY
// ============================================

// Re-export from original for backwards compatibility
export { LLMClient, RAGPipeline } from './index';
export type { LLMConfig, GenerateOptions as GenerateOptionsOld, GenerateResult as GenerateResultOld } from './index';

