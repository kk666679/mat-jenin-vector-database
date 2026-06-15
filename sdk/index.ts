/**
 * Matjenin SDK - Root Barrel
 *
 * Single, consolidated entry point for every SDK module. Application code
 * (tRPC routers, gRPC service, API routes, workers, webhooks) should import
 * from `@/sdk` instead of reaching into deep module paths.
 *
 * Two access styles are supported:
 *
 *   // 1. Direct named imports for the common, collision-free surface
 *   import { getPrismaClient, createRAGPipeline, ragService } from '@/sdk';
 *
 *   // 2. Namespaced access for modules that share type names
 *   //    (e.g. both `vector` and `llm` export `SearchResult`)
 *   import { vector, llm } from '@/sdk';
 *   const client = vector.createWeaviateClient();
 *
 * Namespaces are used for `vector` and `llm` because they both export a
 * `SearchResult` type; re-exporting them flat would create an ambiguous
 * name. Everything else is re-exported flat for ergonomics.
 */

// ----------------------------------------------------------------------------
// Namespaced modules
//   - `vector` & `llm` both export `SearchResult`
//   - `models` shares `ModelConfig`/`ModelProvider`/`Message` with `shared`
// Namespacing keeps the flat surface unambiguous.
// ----------------------------------------------------------------------------
export * as vector from './vector';
export * as llm from './llm';
export * as models from './models';

// ----------------------------------------------------------------------------
// Database (canonical Prisma client + helpers)
// ----------------------------------------------------------------------------
export * from './db';

// ----------------------------------------------------------------------------
// Infrastructure modules (collision-free)
// ----------------------------------------------------------------------------
export * from './cache';
export * from './queue';
export * from './webhook';
export * from './ml';
export * from './shared';

// ----------------------------------------------------------------------------
// High-level shared services (business logic shared across transports)
// ----------------------------------------------------------------------------
export * from './services';

// ----------------------------------------------------------------------------
// Frequently-used LLM helpers promoted to the top level for convenience.
// (Selective re-export keeps these ergonomic without pulling in the
//  colliding `SearchResult` type.)
// ----------------------------------------------------------------------------
export {
  LLMClient,
  RAGPipeline,
  createLLMClient,
  createRAGPipeline,
  buildContextWindow,
  estimateTokens,
  truncateToTokenLimit,
  DEFAULT_RAG_SYSTEM_PROMPT,
  DEFAULT_SUMMARIZE_PROMPT,
} from './llm';
export type {
  LLMConfig,
  GenerateOptions,
  GenerateResult,
  RAGOptions,
  RAGResult,
} from './llm';

// Frequently-used vector helpers promoted to the top level.
export {
  WeaviateClient,
  createWeaviateClient,
  generateEmbedding,
  generateEmbeddings,
  chunkText,
  cosineSimilarity,
  normalizeVector,
  getEmbeddingDimension,
} from './vector';
export { PineconeClient, createPineconeClient, isPineconeConfigured } from './vector/pinecone';
