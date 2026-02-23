import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { webhookService } from '@/sdk/webhook';
import { getPrismaClient } from '@/sdk/db/prisma';

// Get Prisma client instance
const prisma = getPrismaClient();

export const webhookRouter = router({
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      url: z.string().url(),
      events: z.array(z.enum([
        'document.created',
        'document.processed',
        'document.failed',
        'document.deleted',
        'query.completed',
        'conversation.created',
      ])),
      secret: z.string().optional(),
      headers: z.record(z.string(), z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const createData: {
        tenantId: string;
        name: string;
        url: string;
        events: Array<'document.created' | 'document.processed' | 'document.failed' | 'document.deleted' | 'query.completed' | 'conversation.created'>;
        secret?: string;
        headers?: Record<string, string>;
      } = {
        tenantId: ctx.tenantId,
        name: input.name,
        url: input.url,
        events: input.events,
      };
      if (input.secret) {
        createData.secret = input.secret;
      }
      if (input.headers) {
        createData.headers = input.headers;
      }
      return webhookService.createWebhook(createData);
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      return prisma.webhook.findMany({
        where: { tenantId: ctx.tenantId },
        orderBy: { createdAt: 'desc' },
      });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return prisma.webhook.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      url: z.string().url().optional(),
      events: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
      headers: z.record(z.string(), z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: {
        name?: string;
        url?: string;
        events?: string;
        isActive?: boolean;
        headers?: string;
      } = {};
      if (data.name !== undefined) {
        updateData.name = data.name;
      }
      if (data.url !== undefined) {
        updateData.url = data.url;
      }
      if (data.events !== undefined) {
        updateData.events = JSON.stringify(data.events);
      }
      if (data.isActive !== undefined) {
        updateData.isActive = data.isActive;
      }
      if (data.headers !== undefined) {
        updateData.headers = JSON.stringify(data.headers);
      }
      return prisma.webhook.update({
        where: { id },
        data: updateData,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.webhook.delete({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
      });
    }),

  deliveries: protectedProcedure
    .input(z.object({
      webhookId: z.string().optional(),
      status: z.enum(['pending', 'success', 'failed']).optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const where: {
        tenantId: string;
        webhookId?: string;
        status?: 'pending' | 'success' | 'failed';
      } = {
        tenantId: ctx.tenantId,
      };
      if (input.webhookId !== undefined) {
        where.webhookId = input.webhookId;
      }
      if (input.status !== undefined) {
        where.status = input.status;
      }
      return prisma.webhookDelivery.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        include: { webhook: true },
      });
    }),

  retry: protectedProcedure
    .input(z.object({ deliveryId: z.string() }))
    .mutation(async ({ input }) => {
      await webhookService.deliverWebhook(input.deliveryId);
      return { success: true };
    }),
});
