/**
 * LLM Service for RAG - handles AI generation with context
 * 
 * This is the legacy custom LLM client.
 * For AI SDK integration, use ai-sdk.ts
 */

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

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'ollama';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateResult {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface RAGOptions {
  query: string;
  context: SearchResult[];
  systemPrompt?: string;
  maxContextChunks?: number;
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
// LLM CLIENT
// ============================================

export class LLMClient {
  private config: LLMConfig;

constructor(config: LLMConfig) {
    this.config = {
      ...config,
      provider: config.provider || 'openai',
      model: config.model || 'gpt-4o-mini',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 2048,
    };
  }

  /**
   * Generate text with given prompt
   */
  async generate(options: GenerateOptions): Promise<GenerateResult> {
    const { prompt, systemPrompt, temperature, maxTokens } = options;

    switch (this.config.provider) {
      case 'openai':
        return this.generateWithOpenAI(prompt, systemPrompt, temperature, maxTokens);
      case 'anthropic':
        return this.generateWithAnthropic(prompt, systemPrompt, temperature, maxTokens);
      case 'ollama':
        return this.generateWithOllama(prompt, systemPrompt, temperature, maxTokens);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  /**
   * Generate using OpenAI API
   */
  private async generateWithOpenAI(
    prompt: string,
    systemPrompt?: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<GenerateResult> {
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(
      this.config.baseUrl || 'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || 'gpt-4o-mini',
          messages,
          temperature: temperature ?? this.config.temperature,
          max_tokens: maxTokens ?? this.config.maxTokens,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage,
    };
  }

  /**
   * Generate using Anthropic API
   */
  private async generateWithAnthropic(
    prompt: string,
    systemPrompt?: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<GenerateResult> {
    const apiKey = this.config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }

    const messages = [
      ...(systemPrompt ? [{ role: 'system' as const, text: systemPrompt }] : []),
      { role: 'user' as const, text: prompt },
    ];

    const response = await fetch(
      this.config.baseUrl || 'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.model || 'claude-3-haiku-20240307',
          messages,
          temperature: temperature ?? this.config.temperature,
          max_tokens: maxTokens ?? this.config.maxTokens ?? 1024,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json();
    return {
      content: data.content[0]?.text || '',
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
    };
  }

  /**
   * Generate using Ollama (local)
   */
  private async generateWithOllama(
    prompt: string,
    systemPrompt?: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<GenerateResult> {
    const baseUrl = this.config.baseUrl || 'http://localhost:11434';
    
    const payload: Record<string, unknown> = {
      model: this.config.model || 'llama2',
      prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
      temperature: temperature ?? this.config.temperature,
      stream: false,
    };
    
    if (maxTokens) {
      (payload as Record<string, unknown>).num_predict = maxTokens;
    }

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${error}`);
    }

    const data = await response.json();
    return {
      content: data.response || '',
    };
  }
}

// ============================================
// RAG PIPELINE
// ============================================

/**
 * Create RAG pipeline with context retrieval and generation
 */
export class RAGPipeline {
  private llm: LLMClient;

  constructor(config: LLMConfig) {
    this.llm = new LLMClient(config);
  }

  /**
   * Execute RAG query
   */
  async query(options: RAGOptions): Promise<RAGResult> {
    const {
      query,
      context,
      systemPrompt = DEFAULT_RAG_SYSTEM_PROMPT,
      maxContextChunks = 5,
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

    // Generate response
    const result = await this.llm.generate({
      prompt,
      systemPrompt,
    });

    // Format sources
    const sources = limitedContext.map((item) => ({
      documentTitle: item.documentTitle,
      chunkContent: item.content,
      score: item.score,
    }));

    return {
      answer: result.content,
      sources,
      ...(result.usage !== undefined && { usage: result.usage }),
    };
  }

  /**
   * Stream RAG query (for real-time responses)
   */
  async *queryStream(options: RAGOptions): AsyncGenerator<string> {
    const {
      query,
      context,
      systemPrompt = DEFAULT_RAG_SYSTEM_PROMPT,
      maxContextChunks = 5,
    } = options;

    const limitedContext = context.slice(0, maxContextChunks);

    const contextStr = limitedContext
      .map((item, i) => `[Document ${i + 1}: ${item.documentTitle}]\n${item.content}`)
      .join('\n\n---\n\n');

    const prompt = `Context from documents:
${contextStr}

Question: ${query}

Based on the context above, please provide a helpful answer.`;

    // For streaming, we'll just return the full response
    // A proper implementation would use Server-Sent Events
    const result = await this.llm.generate({
      prompt,
      systemPrompt,
    });

    yield result.content;
  }
}

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Create LLM client from environment
 */
export function createLLMClient(): LLMClient {
  const provider = (process.env.LLM_PROVIDER as 'openai' | 'anthropic' | 'ollama') || 'openai';
  const configParts: Partial<LLMConfig> = {
    provider,
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2048'),
  };

  if (process.env.LLM_API_KEY) {
    configParts.apiKey = process.env.LLM_API_KEY;
  }
  if (process.env.LLM_BASE_URL) {
    configParts.baseUrl = process.env.LLM_BASE_URL;
  }
  if (process.env.LLM_MODEL) {
    configParts.model = process.env.LLM_MODEL;
  }

  return new LLMClient(configParts as LLMConfig);
}

/**
 * Create RAG pipeline from environment
 */
export function createRAGPipeline(): RAGPipeline {
  const configParts: Partial<LLMConfig> = {
    provider: (process.env.LLM_PROVIDER as 'openai' | 'anthropic' | 'ollama') || 'openai',
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2048'),
  };

  if (process.env.LLM_API_KEY) {
    configParts.apiKey = process.env.LLM_API_KEY;
  }
  if (process.env.LLM_BASE_URL) {
    configParts.baseUrl = process.env.LLM_BASE_URL;
  }
  if (process.env.LLM_MODEL) {
    configParts.model = process.env.LLM_MODEL;
  }

  return new RAGPipeline(configParts as LLMConfig);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Count tokens (approximate)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
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
  const availableTokens = maxTokens - queryTokens - 200; // Reserve for prompt
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
// AI SDK INTEGRATION
// ============================================
// For AI SDK v6 integration, use the ai-sdk.ts module
// Import directly: import { generateTextAI, createRAGPipelineAI } from '@/sdk/llm/ai-sdk';

