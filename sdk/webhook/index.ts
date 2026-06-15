import crypto from 'crypto';
import { getPrismaClient } from '@/sdk/db/prisma';

export type WebhookEvent = 
  | 'document.created'
  | 'document.processed'
  | 'document.failed'
  | 'document.deleted'
  | 'query.completed'
  | 'conversation.created';

export interface WebhookPayload {
  event: WebhookEvent;
  tenantId: string;
  timestamp: string;
  data: Record<string, any>;
}

export class WebhookService {
  private prisma = getPrismaClient();

  async createWebhook(data: {
    tenantId: string;
    name: string;
    url: string;
    events: WebhookEvent[];
    secret?: string;
    headers?: Record<string, string>;
  }) {
    return this.prisma.webhook.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        url: data.url,
        events: JSON.stringify(data.events),
        secret: data.secret || this.generateSecret(),
        headers: data.headers ? JSON.stringify(data.headers) : null,
      },
    });
  }

  async triggerWebhook(tenantId: string, event: WebhookEvent, data: Record<string, any>) {
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        tenantId,
        isActive: true,
      },
    });

    const payload: WebhookPayload = {
      event,
      tenantId,
      timestamp: new Date().toISOString(),
      data,
    };

    for (const webhook of webhooks) {
      const events = JSON.parse(webhook.events) as WebhookEvent[];
      if (events.includes(event)) {
        await this.queueDelivery(webhook.id, tenantId, payload);
      }
    }
  }

  private async queueDelivery(webhookId: string, tenantId: string, payload: WebhookPayload) {
    await this.prisma.webhookDelivery.create({
      data: {
        webhookId,
        tenantId,
        event: payload.event,
        payload: JSON.stringify(payload),
        status: 'pending',
      },
    });
  }

  async deliverWebhook(deliveryId: string) {
    const delivery = await this.prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: { webhook: true },
    });

    if (!delivery || !delivery.webhook) return;

    const webhook = delivery.webhook;
    const payload = JSON.parse(delivery.payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Matjenin-Webhook/1.0',
      'X-Webhook-Signature': this.generateSignature(payload, webhook.secret || ''),
      'X-Webhook-Event': delivery.event,
      'X-Webhook-Delivery': deliveryId,
      ...(webhook.headers ? JSON.parse(webhook.headers) : {}),
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), webhook.timeout);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      await this.prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: response.ok ? 'success' : 'failed',
          statusCode: response.status,
          response: await response.text(),
          attempts: delivery.attempts + 1,
          deliveredAt: new Date(),
        },
      });
    } catch (error: any) {
      const shouldRetry = delivery.attempts < webhook.retryCount;
      await this.prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: shouldRetry ? 'pending' : 'failed',
          error: error.message,
          attempts: delivery.attempts + 1,
          nextRetryAt: shouldRetry ? new Date(Date.now() + Math.pow(2, delivery.attempts) * 60000) : null,
        },
      });
    }
  }

  async processRetries() {
    const pending = await this.prisma.webhookDelivery.findMany({
      where: {
        status: 'pending',
        nextRetryAt: { lte: new Date() },
      },
      take: 100,
    });

    for (const delivery of pending) {
      await this.deliverWebhook(delivery.id);
    }
  }

  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateSignature(payload: any, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }
}

export const webhookService = new WebhookService();
