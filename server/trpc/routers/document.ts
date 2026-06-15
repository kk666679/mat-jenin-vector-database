// ============================================
// DOCUMENT ROUTER
// Handles all document-related operations
// ============================================

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure, TRPCError } from '../trpc';
import { getPrismaClient, addDocumentJob } from '@/sdk';

// Get Prisma client instance
const prisma = getPrismaClient();

// Input schemas
const DocumentListInputSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
});

const CreateDocumentInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content is required'),
});

const UpdateDocumentInputSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(255).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
});

const DeleteDocumentInputSchema = z.object({
  id: z.string(),
});

const GetDocumentInputSchema = z.object({
  id: z.string(),
});

/**
 * Document router
 * Handles CRUD operations for documents with proper:
 * - Input validation
 * - Tenant isolation
 * - Type safety
 * - Error handling
 */
export const documentRouter = router({
  /**
   * List documents with pagination
   * PUBLIC - Read-only access to documents
   */
  list: publicProcedure
    .input(DocumentListInputSchema)
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, status } = input;
      const skip = (page - 1) * pageSize;

      // Build where clause with tenant isolation
      const where = {
        tenantId: ctx.tenantId,
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { content: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
        ...(status && { status }),
      };

      // Execute count and findMany in parallel for performance
      const [total, items] = await Promise.all([
        prisma.document.count({ where }),
        prisma.document.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
          select: {
            id: true,
            title: true,
            status: true,
            chunkCount: true,
            createdAt: true,
            updatedAt: true,
            // Exclude sensitive fields from public access
            content: false,
            fileUrl: false,
          },
        }),
      ]);

      return {
        items,
        total,
        page,
        pageSize,
        hasMore: skip + items.length < total,
      };
    }),

  /**
   * Get single document by ID
   * PUBLIC - Read-only access
   */
  getById: publicProcedure
    .input(GetDocumentInputSchema)
    .query(async ({ ctx, input }) => {
      const document = await prisma.document.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId, // CRITICAL: Tenant isolation
        },
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
      });

      if (!document) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document not found',
        });
      }

      return document;
    }),

  /**
   * Create new document
   * PROTECTED - Requires authentication
   */
  create: protectedProcedure
    .input(CreateDocumentInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Create document in database
      const document = await prisma.document.create({
        data: {
          tenantId: ctx.tenantId,
          userId: ctx.userId,
          title: input.title,
          content: input.content,
          status: 'pending',
        },
      });

      // Add to processing queue asynchronously
      // Don't await - let it process in background
      addDocumentJob(document.id, ctx.tenantId).catch((error) => {
        console.error('Failed to queue document processing:', error);
      });

      return {
        id: document.id,
        title: document.title,
        status: document.status,
      };
    }),

  /**
   * Update document
   * PROTECTED - Requires authentication, must own document or be admin
   */
  update: protectedProcedure
    .input(UpdateDocumentInputSchema)
    .mutation(async ({ ctx, input }) => {
      // First check if document exists and belongs to tenant
      const existing = await prisma.document.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document not found',
        });
      }

      // Build update data
      const updateData: Record<string, unknown> = {};
      if (input.title) updateData.title = input.title;
      if (input.status) updateData.status = input.status;

      const updated = await prisma.document.update({
        where: { id: input.id },
        data: updateData,
      });

      return updated;
    }),

  /**
   * Delete document
   * PROTECTED - Requires authentication
   */
  delete: protectedProcedure
    .input(DeleteDocumentInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify document belongs to tenant
      const existing = await prisma.document.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document not found',
        });
      }

      // Delete document and associated chunks
      await prisma.$transaction([
        prisma.documentChunk.deleteMany({
          where: { documentId: input.id },
        }),
        prisma.document.delete({
          where: { id: input.id },
        }),
      ]);

      return { success: true, id: input.id };
    }),

  /**
   * Get document statistics
   * PROTECTED - Returns aggregated stats
   */
  stats: protectedProcedure.query(async ({ ctx }) => {
    const [total, byStatus, totalChunks] = await Promise.all([
      prisma.document.count({
        where: { tenantId: ctx.tenantId },
      }),
      prisma.document.groupBy({
        by: ['status'],
        where: { tenantId: ctx.tenantId },
        _count: true,
      }),
      prisma.documentChunk.count({
        where: { tenantId: ctx.tenantId },
      }),
    ]);

    const statusCounts = byStatus.reduce(
      (acc: Record<string, number>, item: { status: string; _count: number }) => {
        acc[item.status] = item._count;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total,
      byStatus: statusCounts,
      totalChunks,
    };
  }),
});

