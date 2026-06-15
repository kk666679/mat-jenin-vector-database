/**
 * Shared RAG Service
 *
 * Single source of truth for the Retrieval-Augmented Generation pipeline.
 *
 * Previously this logic was duplicated in:
 *   - server/trpc/routers/query.ts   (tRPC transport)
 *   - server/grpc/aiservice.ts       (gRPC transport)
 *
 * Both transports now delegate to this service so search behaviour,
 * provider fallback order, and answer generation stay consistent.
 *
 * Provider fallback order for vector search:
 *   1. Pinecone   (if configured)
 *   2. Weaviate   (if reachable)
 *   3. SQL keyword search over document chunks (always available)
 */

import { getPrismaClient } from '../db/prisma';
import { createPineconeClient, createWeaviateClient } from '../vector';
import { createRAGPipeline, type SearchResult } from '../llm';

export interface RagSearchParams {
  tenantId: string;
  query: string;
  topK?: number;
}

export interface RagQueryParams extends RagSearchParams {
  conversationId?: string | null;
  includeSources?: boolean;
}

export interface RagSource {
  documentTitle: string;
  chunkContent: string;
  score: number;
}

export interface RagAnswer {
  answer: string;
  sources: RagSource[];
  conversationId: string | null;
  tokensUsed: number;
}

const NO_RESULTS_ANSWER =
  "I couldn't find relevant information in your documents.";

/**
 * Run a SQL keyword-search fallback over document chunks.
 *
 * @param mode `weighted` scores by proportion of matched query words
 *             (used by full RAG search), `binary` scores 1 when the whole
 *             query string is contained (used by searchOnly).
 */
async function sqlFallbackSearch(
  tenantId: string,
  query: string,
  topK: number,
  mode: 'weighted' | 'binary'
): Promise<SearchResult[]> {
  const prisma = getPrismaClient();

  const chunks = await prisma.documentChunk.findMany({
    where: { tenantId },
    take: topK * 2,
    orderBy: { createdAt: 'desc' },
    include: { document: { select: { title: true } } },
  });

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(' ').filter((w) => w.length > 2);

  return chunks
    .map((chunk: any): SearchResult => {
      const contentLower = chunk.content.toLowerCase();
      let score: number;

      if (mode === 'weighted') {
        const words = queryLower.split(' ');
        const matches = queryWords.filter((w) => contentLower.includes(w)).length;
        score = words.length > 0 ? matches / words.length : 0;
      } else {
        score = contentLower.includes(queryLower) ? 1 : 0;
      }

      return {
        id: chunk.id,
        content: chunk.content,
        score,
        documentId: chunk.documentId,
        documentTitle: chunk.document?.title || 'Unknown',
      };
    })
    .filter((c: SearchResult) => c.score > 0)
    .sort((a: SearchResult, b: SearchResult) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Retrieve relevant chunks for a query using the provider fallback chain.
 * Returns raw search results without LLM generation.
 */
export async function searchDocuments(
  params: RagSearchParams,
  mode: 'weighted' | 'binary' = 'weighted'
): Promise<SearchResult[]> {
  const { tenantId, query, topK = 5 } = params;

  // 1. Pinecone
  try {
    const pinecone = createPineconeClient();
    return await pinecone.search({ tenantId, query, topK });
  } catch {
    // 2. Weaviate
    try {
      const weaviate = createWeaviateClient();
      return await weaviate.search({ tenantId, query, topK });
    } catch {
      // 3. SQL keyword fallback
      return sqlFallbackSearch(tenantId, query, topK, mode);
    }
  }
}

/**
 * Full RAG query: retrieve context then generate an answer with the LLM.
 */
export async function ragQuery(params: RagQueryParams): Promise<RagAnswer> {
  const {
    tenantId,
    query,
    topK = 5,
    conversationId = null,
    includeSources = true,
  } = params;

  const searchResults = await searchDocuments({ tenantId, query, topK }, 'weighted');

  if (searchResults.length === 0) {
    return {
      answer: NO_RESULTS_ANSWER,
      sources: [],
      conversationId,
      tokensUsed: 0,
    };
  }

  const ragPipeline = createRAGPipeline();
  const ragResult = await ragPipeline.query({
    query,
    context: searchResults,
    maxContextChunks: topK,
  });

  return {
    answer: ragResult.answer,
    sources: includeSources
      ? ragResult.sources.map((s) => ({
          documentTitle: s.documentTitle,
          chunkContent: s.chunkContent,
          score: s.score,
        }))
      : [],
    conversationId,
    tokensUsed: ragResult.usage?.totalTokens ?? 0,
  };
}

/**
 * RAG service object — convenient namespaced access via `ragService`.
 */
export const ragService = {
  search: ragQuery,
  searchOnly: searchDocuments,
};

export type RagService = typeof ragService;
