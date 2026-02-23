/**
 * Webhook Configuration for Matjenin
 * Domain: https://matjenin.space
 */

export const WEBHOOK_CONFIG = {
  domain: 'https://matjenin.space',
  callbackUrl: 'https://matjenin.space/api/webhook/callback',
  
  events: {
    DOCUMENT_CREATED: 'document.created',
    DOCUMENT_PROCESSED: 'document.processed',
    DOCUMENT_FAILED: 'document.failed',
    DOCUMENT_DELETED: 'document.deleted',
    QUERY_COMPLETED: 'query.completed',
    CONVERSATION_CREATED: 'conversation.created',
  },
  
  retryPolicy: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelayMs: 60000, // 1 minute
  },
  
  timeout: 30000, // 30 seconds
  
  headers: {
    'User-Agent': 'Matjenin-Webhook/1.0',
    'Content-Type': 'application/json',
  },
};

export type WebhookEventType = typeof WEBHOOK_CONFIG.events[keyof typeof WEBHOOK_CONFIG.events];
