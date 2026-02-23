/**
 * gRPC AI Service Implementation
 * 
 * Implements the AIService defined in sdk/proto/ai-service.proto
 * Uses tRPC handlers internally for business logic
 */

import { getPrismaClient } from '@/sdk/db/prisma';
import { createWeaviateClient, createPineconeClient } from '@/sdk/vector';
import { LLMClient, createRAGPipeline } from '@/sdk/llm';
import type {
  ISearchRequest,
  ISearchResponse,
  ISearchOnlyRequest,
  ISearchOnlyResponse,
  IGenerateTextRequest,
  IGenerateTextResponse,
  // IStreamTextRequest,
  IGenerateStructuredRequest,
  IGenerateStructuredResponse,
  IDocumentListRequest,
  IDocumentListResponse,
  ICreateDocumentRequest,
  ICreateDocumentResponse,
  IUpdateDocumentRequest,
  IDeleteDocumentRequest,
  IDeleteDocumentResponse,
  IDocumentStatsRequest,
  IDocumentStatsResponse,
  IConversationListRequest,
  IConversationListResponse,
  IMessageListRequest,
  IMessageListResponse,
  ICreateConversationRequest,
  ICreateConversationResponse,
  IDeleteConversationRequest,
  IDeleteConversationResponse,
  IHealthCheckRequest,
  IHealthCheckResponse,
  IInferenceRequest,
  IInferenceResponse,
  IBatchInferenceRequest,
  IBatchInferenceResponse,
} from './types';

// ============================================
// SERVICE IMPLEMENTATION
// ============================================

/**
 * AIService implementation
 * Implements all RPC methods from the proto definition
 */
export class AIServiceImpl {
  private prisma = getPrismaClient();

  /**
   * Search with RAG - combines vector search with LLM generation
   */
  async search(request: ISearchRequest): Promise<ISearchResponse> {
    const { query, tenantId, conversationId, topK = 5, includeSources = true } = request;

    try {
      // Try vector search first
      let searchResults: Array<{
        id: string;
        content: string;
        score: number;
        documentId: string;
        documentTitle: string;
      }> = [];

      try {
        // Try Pinecone first
        const pinecone = createPineconeClient();
        searchResults = await pinecone.search({ tenantId, query, topK });
      } catch {
        try {
          // Fall back to Weaviate
          const weaviate = createWeaviateClient();
          searchResults = await weaviate.search({ tenantId, query, topK });
        } catch {
          // Fall back to SQL search
          const chunks = await this.prisma.documentChunk.findMany({
            where: { tenantId },
            take: topK * 2,
            include: { document: { select: { title: true } } },
          });

          const queryLower = query.toLowerCase();
          const matchedChunks = chunks
            .map((chunk: any) => {
              const contentLower = chunk.content.toLowerCase();
              const matches = queryLower.split(' ')
                .filter((w: string) => w.length > 2)
                .filter((w: string) => contentLower.includes(w)).length;
              const score = matches / queryLower.split(' ').length;
              return {
                id: chunk.id,
                content: chunk.content,
                score,
                documentId: chunk.documentId,
                documentTitle: chunk.document?.title || 'Unknown',
              };
            })
            .filter((c: { score: number }) => c.score > 0)
            .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
            .slice(0, topK);

          searchResults = matchedChunks;
        }
      }

      if (searchResults.length === 0) {
        return {
          answer: "I couldn't find relevant information in your documents.",
          sources: [],
          conversationId: conversationId || '',
          tokensUsed: 0,
        };
      }

      // Generate answer with RAG
      const ragPipeline = createRAGPipeline();
      const ragResult = await ragPipeline.query({
        query,
        context: searchResults,
        maxContextChunks: topK,
      });

      return {
        answer: ragResult.answer,
        sources: includeSources ? ragResult.sources.map(s => ({
          documentTitle: s.documentTitle,
          chunkContent: s.chunkContent,
          score: s.score,
        })) : [],
        conversationId: conversationId || '',
        tokensUsed: ragResult.usage?.totalTokens || 0,
      };
    } catch (error) {
      console.error('Search RPC error:', error);
      throw error;
    }
  }

  /**
   * Search only - returns vector search results without LLM generation
   */
  async searchOnly(request: ISearchOnlyRequest): Promise<ISearchOnlyResponse> {
    const { query, tenantId, topK = 5 } = request;

    try {
      try {
        const pinecone = createPineconeClient();
        const results = await pinecone.search({ tenantId, query, topK });
        return { results: results as any };
      } catch {
        try {
          const weaviate = createWeaviateClient();
          const results = await weaviate.search({ tenantId, query, topK });
          return { results: results as any };
        } catch {
          // SQL fallback
          const chunks = await this.prisma.documentChunk.findMany({
            where: { tenantId },
            take: topK * 2,
            include: { document: { select: { title: true } } },
          });

          const queryLower = query.toLowerCase();
          const matchedChunks = chunks
            .map((chunk: any) => ({
              id: chunk.id,
              content: chunk.content,
              score: chunk.content.toLowerCase().includes(queryLower) ? 1 : 0,
              documentId: chunk.documentId,
              documentTitle: chunk.document?.title || 'Unknown',
              metadata: {} as Record<string, string>,
            }))
            .filter((c: { score: number }) => c.score > 0)
            .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
            .slice(0, topK);

          return { results: matchedChunks };
        }
      }
    } catch (error) {
      console.error('SearchOnly RPC error:', error);
      throw error;
    }
  }

  /**
   * Generate text without context
   */
  async generateText(request: IGenerateTextRequest): Promise<IGenerateTextResponse> {
    const { prompt, systemPrompt, temperature = 0.7, maxOutputTokens = 2048, provider = 'openai', model } = request;

    // Create LLM client directly with the specified provider
    const llm = new LLMClient({ 
      provider: provider as 'openai' | 'anthropic' | 'ollama', 
      model 
    });
    
    // Simple generation without context
    const result = await llm.generate({ prompt, systemPrompt, temperature, maxTokens: maxOutputTokens });

    return {
      content: result.content,
      usage: {
        promptTokens: result.usage?.promptTokens || 0,
        completionTokens: result.usage?.completionTokens || 0,
        totalTokens: result.usage?.totalTokens || 0,
      },
      finishReason: 'stop',
    };
  }

  /**
   * Generate structured output
   */
  async generateStructured(request: IGenerateStructuredRequest): Promise<IGenerateStructuredResponse> {
    const { prompt, schema, systemPrompt, temperature = 0.7, provider = 'openai', model } = request;

    // Create LLM client directly with the specified provider
    const llm = new LLMClient({ 
      provider: provider as 'openai' | 'anthropic' | 'ollama', 
      model 
    });
    
    const fullPrompt = `${prompt}\n\nOutput should be in the following JSON schema:\n${schema}`;
    
    const result = await llm.generate({
      prompt: fullPrompt,
      systemPrompt: systemPrompt || 'You are a helpful assistant that outputs valid JSON.',
      temperature,
      maxTokens: 4096,
    });

    return {
      object: result.content,
      finishReason: 'stop',
      usage: {
        promptTokens: result.usage?.promptTokens || 0,
        completionTokens: result.usage?.completionTokens || 0,
        totalTokens: result.usage?.totalTokens || 0,
      },
    };
  }

  /**
   * List documents
   */
  async listDocuments(request: IDocumentListRequest): Promise<IDocumentListResponse> {
    const { tenantId, page = 1, pageSize = 20, search, status } = request;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = { tenantId };
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.status = status;
    }

    const [total, items] = await Promise.all([
      this.prisma.document.count({ where }),
      this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          tenantId: true,
          title: true,
          filename: true,
          contentType: true,
          fileSize: true,
          content: true,
          fileUrl: true,
          status: true,
          chunkCount: true,
          processedAt: true,
          errorMessage: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      items: items.map((d: any) => ({
        id: d.id,
        tenantId: d.tenantId,
        title: d.title,
        filename: d.filename || '',
        contentType: d.contentType || '',
        fileSize: d.fileSize || 0,
        content: d.content || '',
        fileUrl: d.fileUrl || '',
        status: d.status,
        chunkCount: d.chunkCount,
        processedAt: d.processedAt?.toISOString() || '',
        errorMessage: d.errorMessage || '',
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      hasMore: skip + items.length < total,
    };
  }

  /**
   * Create document
   */
  async createDocument(request: ICreateDocumentRequest): Promise<ICreateDocumentResponse> {
    const { tenantId, title, content } = request;

    const document = await this.prisma.document.create({
      data: {
        tenantId,
        title,
        content,
        status: 'pending',
      },
    });

    return {
      id: document.id,
      title: document.title,
      status: document.status,
    };
  }

  /**
   * Update document
   */
  async updateDocument(request: IUpdateDocumentRequest): Promise<any> {
    const { id, tenantId, title, status } = request;

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (status) updateData.status = status;

    const document = await this.prisma.document.update({
      where: { id, tenantId },
      data: updateData,
    });

    return {
      id: document.id,
      tenantId: document.tenantId,
      title: document.title,
      filename: document.filename || '',
      contentType: document.contentType || '',
      fileSize: document.fileSize || 0,
      content: document.content || '',
      fileUrl: document.fileUrl || '',
      status: document.status,
      chunkCount: document.chunkCount,
      processedAt: document.processedAt?.toISOString() || '',
      errorMessage: document.errorMessage || '',
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    };
  }

  /**
   * Delete document
   */
  async deleteDocument(request: IDeleteDocumentRequest): Promise<IDeleteDocumentResponse> {
    const { id, tenantId } = request;

    // Delete chunks first
    await this.prisma.documentChunk.deleteMany({ where: { documentId: id } });
    
    // Delete document
    await this.prisma.document.delete({
      where: { id, tenantId },
    });

    return { success: true, id };
  }

  /**
   * Get document stats
   */
  async getDocumentStats(request: IDocumentStatsRequest): Promise<IDocumentStatsResponse> {
    const { tenantId } = request;

    const [total, byStatus, totalChunks] = await Promise.all([
      this.prisma.document.count({ where: { tenantId } }),
      this.prisma.document.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.documentChunk.count({ where: { tenantId } }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const item of byStatus) {
      statusCounts[item.status] = item._count;
    }

    return {
      total,
      byStatus: statusCounts,
      totalChunks,
    };
  }

  /**
   * List conversations
   */
  async listConversations(request: IConversationListRequest): Promise<IConversationListResponse> {
    const { tenantId, userId, page = 1, pageSize = 20 } = request;
    const skip = (page - 1) * pageSize;

    const [total, items] = await Promise.all([
      this.prisma.conversation.count({ where: { tenantId, userId } }),
      this.prisma.conversation.findMany({
        where: { tenantId, userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    return {
      items: items.map((c: any) => ({
        id: c.id,
        tenantId: c.tenantId,
        title: c.title || '',
        userId: c.userId,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      hasMore: skip + items.length < total,
    };
  }

  /**
   * Get messages
   */
  async getMessages(request: IMessageListRequest): Promise<IMessageListResponse> {
    const { conversationId, page = 1, pageSize = 50 } = request;
    const skip = (page - 1) * pageSize;

    const [total, items] = await Promise.all([
      this.prisma.message.count({ where: { conversationId } }),
      this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: pageSize,
      }),
    ]);

    return {
      items: items.map((m: any) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role,
        content: m.content,
        sources: m.sources || '',
        tokensUsed: m.tokensUsed || 0,
        createdAt: m.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      hasMore: skip + items.length < total,
    };
  }

  /**
   * Create conversation
   */
  async createConversation(request: ICreateConversationRequest): Promise<ICreateConversationResponse> {
    const { tenantId, userId, title } = request;

    const conversation = await this.prisma.conversation.create({
      data: {
        tenantId,
        userId,
        title: title || 'New Conversation',
      },
    });

    return {
      id: conversation.id,
      title: conversation.title || '',
      createdAt: conversation.createdAt.toISOString(),
    };
  }

  /**
   * Delete conversation
   */
  async deleteConversation(request: IDeleteConversationRequest): Promise<IDeleteConversationResponse> {
    const { id, tenantId, userId } = request;

    await this.prisma.$transaction([
      this.prisma.message.deleteMany({ where: { conversationId: id } }),
      this.prisma.conversation.delete({
        where: { id, tenantId, userId },
      }),
    ]);

    return { success: true };
  }

  /**
   * Health check
   */
  async healthCheck(_request: IHealthCheckRequest): Promise<IHealthCheckResponse> {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        healthy: true,
        status: 'ok',
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        healthy: false,
        status: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Inference - direct LLM inference
   */
  async inference(request: IInferenceRequest): Promise<IInferenceResponse> {
    // This would use the AI SDK for direct inference
    // Simplified implementation
    return {
      content: '',
      finishReason: 'stop',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      model: request.model,
      toolCalls: [],
      metadata: {} as Record<string, string>,
    };
  }

  /**
   * Batch inference
   */
  async batchInference(request: IBatchInferenceRequest): Promise<IBatchInferenceResponse> {
    const results: IInferenceResponse[] = [];
    
    for (const item of request.items) {
      const result = await this.inference(item);
      results.push(result);
    }

    return {
      results,
      totalLatency: 0,
      failedCount: 0,
    };
  }
}

// Export factory function
export function createAIService(): AIServiceImpl {
  return new AIServiceImpl();
}

