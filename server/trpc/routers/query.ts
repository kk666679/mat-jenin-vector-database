// ============================================
// RAG QUERY ROUTER
// Handles RAG (Retrieval-Augmented Generation) queries
// ============================================

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, TRPCError } from '../trpc';
import { getPrismaClient, ragService } from '@/sdk';

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
      const { query, topK, includeSources, conversationId } = input;

      try {
        const result = await ragService.search({
          tenantId: ctx.tenantId,
          query,
          topK,
          includeSources,
          conversationId: conversationId || null,
        });

        return {
          answer: result.answer,
          sources: result.sources,
          conversationId: result.conversationId,
          tokensUsed: result.tokensUsed,
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
        return await ragService.searchOnly(
          { tenantId: ctx.tenantId, query, topK },
          'binary'
        );
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

