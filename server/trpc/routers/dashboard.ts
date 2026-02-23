// ============================================
// DASHBOARD ROUTER
// Provides aggregated statistics and overview data
// ============================================

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import { getPrismaClient } from '@/sdk/db/prisma';

// Get Prisma client instance
const prisma = getPrismaClient();

/**
 * Input schemas
 */
const DashboardStatsSchema = z.object({
  tenantId: z.string().optional(), // Will use context if not provided
});

const RecentItemsSchema = z.object({
  model: z.enum(['document', 'user', 'job', 'session', 'auditLog']),
  limit: z.number().min(1).max(50).default(10),
  tenantId: z.string().optional(),
});

const ModelStatsSchema = z.object({
  model: z.enum(['document', 'user', 'job', 'session', 'apiKey', 'conversation']),
  tenantId: z.string().optional(),
});

/**
 * Dashboard router
 * Provides aggregated data for the dashboard overview
 * Requires authentication for tenant-specific data
 */
export const dashboardRouter = router({
  /**
   * Get overall dashboard statistics
   * Returns key metrics for the current tenant
   */
  stats: protectedProcedure
    .input(DashboardStatsSchema)
    .query(async ({ ctx }) => {
      const tenantId = ctx.tenantId;

      // Execute all queries in parallel for performance
      const [
        tenant,
        documentStats,
        userStats,
        jobStats,
        sessionStats,
        apiKeyStats,
        conversationStats,
        recentDocuments,
        recentJobs,
      ] = await Promise.all([
        // Tenant info
        prisma.tenant.findUnique({
          where: { id: tenantId },
          select: {
            name: true,
            plan: true,
            maxUsers: true,
            maxDocuments: true,
            maxStorageMb: true,
            rateLimitRpm: true,
          },
        }),

        // Document stats
        prisma.document.aggregate({
          where: { tenantId },
          _count: true,
          _avg: { fileSize: true },
        }),

        // User stats
        prisma.user.aggregate({
          where: { tenantId },
          _count: true,
        }),

        // Job stats
        prisma.job.groupBy({
          by: ['status'],
          where: { tenantId },
          _count: true,
        }),

        // Active sessions
        prisma.session.count({
          where: { 
            tenantId,
            expiresAt: { gt: new Date() },
          },
        }),

        // API keys
        prisma.apiKey.aggregate({
          where: { tenantId, isActive: true },
          _count: true,
        }),

        // Conversations
        prisma.conversation.aggregate({
          where: { tenantId },
          _count: true,
        }),

        // Recent documents
        prisma.document.findMany({
          where: { tenantId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        }),

        // Recent jobs
        prisma.job.findMany({
          where: { tenantId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            type: true,
            status: true,
            progress: true,
            createdAt: true,
          },
        }),
      ]);

      // Process job stats
      const jobStatusCounts = jobStats.reduce(
        (acc: Record<string, number>, item: { status: string; _count: number }) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        tenant: tenant ? {
          name: tenant.name,
          plan: tenant.plan,
          limits: {
            users: tenant.maxUsers,
            documents: tenant.maxDocuments,
            storageMb: tenant.maxStorageMb,
            rateLimitRpm: tenant.rateLimitRpm,
          },
        } : null,
        
        documents: {
          total: documentStats._count,
          avgFileSize: documentStats._avg.fileSize || 0,
        },
        
        users: {
          total: userStats._count,
        },
        
        jobs: {
          total: Object.values(jobStatusCounts).reduce((a, b) => Number(a) + Number(b), 0),
          pending: jobStatusCounts.pending || 0,
          processing: jobStatusCounts.processing || 0,
          completed: jobStatusCounts.completed || 0,
          failed: jobStatusCounts.failed || 0,
        },
        
        sessions: {
          active: sessionStats,
        },
        
        apiKeys: {
          active: apiKeyStats._count,
        },
        
        conversations: {
          total: conversationStats._count,
        },
        
        recentDocuments,
        recentJobs,
      };
    }),

  /**
   * Get usage metrics over time
   */
  usageMetrics: protectedProcedure
    .input(z.object({
      metricType: z.enum(['api_requests', 'documents_processed', 'tokens_used', 'storage_mb']),
      period: z.enum(['hourly', 'daily', 'monthly']).default('daily'),
      days: z.number().min(1).max(90).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const { metricType, period, days } = input;
      const tenantId = ctx.tenantId;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const metrics = await prisma.usageMetric.findMany({
        where: {
          tenantId,
          metricType,
          period,
          periodStart: { gte: startDate },
        },
        orderBy: { periodStart: 'asc' },
        select: {
          periodStart: true,
          value: true,
        },
      });

      return metrics;
    }),

  /**
   * Get recent items from a specific model
   */
  recentItems: protectedProcedure
    .input(RecentItemsSchema)
    .query(async ({ ctx, input }) => {
      const { model, limit } = input;
      const tenantId = ctx.tenantId;

      let items: unknown[] = [];

      switch (model) {
        case 'document':
          items = await prisma.document.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          });
          break;

        case 'user':
          items = await prisma.user.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
              createdAt: true,
            },
          });
          break;

        case 'job':
          items = await prisma.job.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
              id: true,
              type: true,
              status: true,
              progress: true,
              createdAt: true,
              completedAt: true,
            },
          });
          break;

        case 'session':
          items = await prisma.session.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
              id: true,
              userId: true,
              ipAddress: true,
              createdAt: true,
              expiresAt: true,
            },
          });
          break;

        case 'auditLog':
          items = await prisma.auditLog.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
              id: true,
              action: true,
              entityType: true,
              userId: true,
              createdAt: true,
            },
          });
          break;
      }

      return items;
    }),

  /**
   * Get detailed stats for a specific model
   */
  modelStats: protectedProcedure
    .input(ModelStatsSchema)
    .query(async ({ ctx, input }) => {
      const { model } = input;
      const tenantId = ctx.tenantId;

      let stats: unknown = null;

      switch (model) {
        case 'document': {
          const [total, docByStatus, docByType] = await Promise.all([
            prisma.document.count({ where: { tenantId } }),
            prisma.document.groupBy({
              by: ['status'],
              where: { tenantId },
              _count: true,
            }),
            prisma.document.groupBy({
              by: ['contentType'],
              where: { tenantId },
              _count: true,
            }),
          ]);
          stats = {
            total,
            byStatus: docByStatus.reduce((acc: Record<string, number>, s: { status: string; _count: number }) => ({ ...acc, [s.status]: s._count }), {}),
            byType: docByType.reduce((acc: Record<string, number>, s: { contentType: string | null; _count: number }) => ({ ...acc, [s.contentType || 'unknown']: s._count }), {}),
          };
          break;
        }

        case 'user': {
          const [userTotal, byRole, activeCount] = await Promise.all([
            prisma.user.count({ where: { tenantId } }),
            prisma.user.groupBy({
              by: ['role'],
              where: { tenantId },
              _count: true,
            }),
            prisma.user.count({ where: { tenantId, isActive: true } }),
          ]);
          stats = {
            total: userTotal,
            byRole: byRole.reduce((acc: Record<string, number>, s: { role: string; _count: number }) => ({ ...acc, [s.role]: s._count }), {}),
            active: activeCount,
          };
          break;
        }

        case 'job': {
          const [jobTotal, jobByStatus, jobTypeStats] = await Promise.all([
            prisma.job.count({ where: { tenantId } }),
            prisma.job.groupBy({
              by: ['status'],
              where: { tenantId },
              _count: true,
            }),
            prisma.job.groupBy({
              by: ['type'],
              where: { tenantId },
              _count: true,
            }),
          ]);
          stats = {
            total: jobTotal,
            byStatus: jobByStatus.reduce((acc: Record<string, number>, s: { status: string; _count: number }) => ({ ...acc, [s.status]: s._count }), {}),
            byType: jobTypeStats.reduce((acc: Record<string, number>, s: { type: string; _count: number }) => ({ ...acc, [s.type]: s._count }), {}),
          };
          break;
        }

        case 'session': {
          const [sessionTotal, activeSessions] = await Promise.all([
            prisma.session.count({ where: { tenantId } }),
            prisma.session.count({ where: { tenantId, expiresAt: { gt: new Date() } } }),
          ]);
          stats = {
            total: sessionTotal,
            active: activeSessions,
          };
          break;
        }

        case 'apiKey': {
          const [keyTotal, activeKeys] = await Promise.all([
            prisma.apiKey.count({ where: { tenantId } }),
            prisma.apiKey.count({ where: { tenantId, isActive: true } }),
          ]);
          stats = {
            total: keyTotal,
            active: activeKeys,
          };
          break;
        }

        case 'conversation': {
          const [convTotal, withMessages] = await Promise.all([
            prisma.conversation.count({ where: { tenantId } }),
            prisma.message.count({
              where: { conversation: { tenantId } },
            }),
          ]);
          stats = {
            total: convTotal,
            totalMessages: withMessages,
          };
          break;
        }
      }

      return stats;
    }),

  /**
   * Health check for dashboard
   */
  health: publicProcedure.query(async () => {
    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }),
});

