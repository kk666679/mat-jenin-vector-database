// ============================================
// RAG QUERY ROUTER
// Handles RAG (Retrieval-Augmented Generation) queries
// ============================================

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, TRPCError } from '../trpc';
import { getPrismaClient } from '@/sdk/db/prisma';
import { createWeaviateClient } from '@/sdk/vector';
import { createRAGPipeline } from '@/sdk/llm';

// Get Prisma client instance
const prisma = getPrismaClient();

// Input schemas
const QueryInputSchema = z.object({
  query: z.string().min(1, 'Query is required').max(5000, 'Query too long'),
  conversationId: z.string().optional(),
  topK: z.number().min(1).max(20).default(5),
  includeSources: z.boolean().default(true),
});

const ConversationListInputSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(50).default(20),
});

const MessageListInputSchema = z.object({
  conversationId: z.string(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(50),
});

// Type definitions for search results
interface SearchResultItem {
  id: string;
  content: string;
  score: number;
  documentId: string;
  documentTitle: string;
}

// Prisma types
interface PrismaDocumentChunk {
  id: string;
  content: string;
  documentId: string;
}

interface PrismaDocument {
  id: string;
  title: string;
}

/**
 * RAG Query router
 * Handles:
 * - Vector search queries
 * - LLM-powered answers with context
 * - Conversation history management
 */
export const queryRouter = router({
  /**
   * Execute RAG query with document search
   * PUBLIC - Read-only access
   */
  search: publicProcedure
    .input(QueryInputSchema)
    .query(async ({ ctx, input }) => {
      const { query, topK, includeSources } = input;

      try {
        let searchResults: SearchResultItem[] = [];

        try {
          const weaviateClient = createWeaviateClient();
          const weaviateResults = await weaviateClient.search({
            tenantId: ctx.tenantId,
            query,
            topK,
          });
          searchResults = weaviateResults;
        } catch {
          console.log('Weaviate not available, falling back to database');

          const chunks = await prisma.documentChunk.findMany({
            where: { tenantId: ctx.tenantId },
            take: topK * 2,
          });

          const queryLower = query.toLowerCase();
          const matchedChunks: SearchResultItem[] = chunks
            .map((chunk: PrismaDocumentChunk) => {
              const contentLower = chunk.content.toLowerCase();
              const matches = queryLower.split(' ').filter((w: string) => w.length > 2).filter((w: string) => contentLower.includes(w)).length;
              const score = matches / queryLower.split(' ').length;
              return {
                id: chunk.id,
                content: chunk.content,
                score,
                documentId: chunk.documentId,
                documentTitle: 'Document',
              };
            })
            .filter((c: SearchResultItem) => c.score > 0)
            .sort((a: SearchResultItem, b: SearchResultItem) => b.score - a.score)
            .slice(0, topK);

          const documentIds = [...new Set(matchedChunks.map(c => c.documentId))];
          const documents: PrismaDocument[] = await prisma.document.findMany({
            where: { id: { in: documentIds } },
            select: { id: true, title: true },
          });
          const docMap = new Map<string, string>(documents.map(d => [d.id, d.title]));

          searchResults = matchedChunks.map(c => ({
            ...c,
            documentTitle: docMap.get(c.documentId) || 'Unknown',
          }));
        }

        if (searchResults.length === 0) {
          return {
            answer: "I couldn't find relevant information in your documents.",
            sources: [],
            conversationId: input.conversationId || null,
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
          sources: includeSources ? ragResult.sources.map(s => ({
            documentTitle: s.documentTitle,
            chunkContent: s.chunkContent,
            score: s.score,
          })) : [],
          conversationId: input.conversationId || null,
          tokensUsed: ragResult.usage?.totalTokens,
        };
      } catch (error) {
        console.error('RAG query failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process query',
          cause: error,
        });
      }
    }),

  /**
   * Get search results without LLM generation
   * PUBLIC - Read-only
   */
  searchOnly: publicProcedure
    .input(QueryInputSchema)
    .query(async ({ ctx, input }) => {
      const { query, topK } = input;

      try {
        try {
          const weaviateClient = createWeaviateClient();
          return await weaviateClient.search({
            tenantId: ctx.tenantId,
            query,
            topK,
          });
        } catch {
          const chunks = await prisma.documentChunk.findMany({
            where: { tenantId: ctx.tenantId },
            take: topK * 2,
            orderBy: { createdAt: 'desc' },
          });

          const queryLower = query.toLowerCase();
          const matchedChunks: SearchResultItem[] = chunks
            .map((chunk: PrismaDocumentChunk) => ({
              id: chunk.id,
              content: chunk.content,
              score: chunk.content.toLowerCase().includes(queryLower) ? 1 : 0,
              documentId: chunk.documentId,
              documentTitle: 'Document',
            }))
            .filter((c: SearchResultItem) => c.score > 0)
            .sort((a: SearchResultItem, b: SearchResultItem) => b.score - a.score)
            .slice(0, topK);

          const documentIds = [...new Set(matchedChunks.map(c => c.documentId))];
          const documents: PrismaDocument[] = await prisma.document.findMany({
            where: { id: { in: documentIds } },
            select: { id: true, title: true },
          });
          const docMap = new Map<string, string>(documents.map(d => [d.id, d.title]));

          return matchedChunks.map(c => ({
            ...c,
            documentTitle: docMap.get(c.documentId) || 'Unknown',
          }));
        }
      } catch (error) {
        console.error('Search failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search documents',
          cause: error,
        });
      }
    }),

  /**
   * List conversations
   * PROTECTED
   */
  listConversations: protectedProcedure
    .input(ConversationListInputSchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;
      const skip = (page - 1) * pageSize;

      const [total, conversations] = await Promise.all([
        prisma.conversation.count({ where: { tenantId: ctx.tenantId, userId: ctx.userId } }),
        prisma.conversation.findMany({
          where: { tenantId: ctx.tenantId, userId: ctx.userId },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: pageSize,
          select: { id: true, title: true, createdAt: true, updatedAt: true },
        }),
      ]);

      return { items: conversations, total, page, pageSize, hasMore: skip + conversations.length < total };
    }),

  /**
   * Get messages for a conversation
   * PROTECTED
   */
  getMessages: protectedProcedure
    .input(MessageListInputSchema)
    .query(async ({ ctx, input }) => {
      const { conversationId, page, pageSize } = input;
      const skip = (page - 1) * pageSize;

      const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, tenantId: ctx.tenantId, userId: ctx.userId },
      });

      if (!conversation) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Conversation not found' });
      }

      const [total, messages] = await Promise.all([
        prisma.message.count({ where: { conversationId } }),
        prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'asc' },
          skip,
          take: pageSize,
          select: { id: true, role: true, content: true, sources: true, tokensUsed: true, createdAt: true },
        }),
      ]);

      return { items: messages, total, page, pageSize, hasMore: skip + messages.length < total };
    }),

  /**
   * Create new conversation
   * PROTECTED
   */
  createConversation: protectedProcedure
    .input(z.object({ title: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const conversation = await prisma.conversation.create({
        data: { tenantId: ctx.tenantId, userId: ctx.userId, title: input.title || 'New Conversation' },
      });
      return { id: conversation.id, title: conversation.title, createdAt: conversation.createdAt };
    }),

  /**
   * Delete conversation
   * PROTECTED
   */
  deleteConversation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const conversation = await prisma.conversation.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId, userId: ctx.userId },
      });

      if (!conversation) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Conversation not found' });
      }

      await prisma.$transaction([
        prisma.message.deleteMany({ where: { conversationId: input.id } }),
        prisma.conversation.delete({ where: { id: input.id } }),
      ]);

      return { success: true };
    }),
});

