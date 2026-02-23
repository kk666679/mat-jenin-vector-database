import { webhookService } from '@/sdk/webhook';

/**
 * Example: Trigger webhook when document is processed
 */
export async function onDocumentProcessed(tenantId: string, documentId: string, document: any) {
  await webhookService.triggerWebhook(tenantId, 'document.processed', {
    documentId,
    title: document.title,
    status: document.status,
    chunkCount: document.chunkCount,
    processedAt: document.processedAt,
  });
}

/**
 * Example: Trigger webhook when document creation fails
 */
export async function onDocumentFailed(tenantId: string, documentId: string, error: string) {
  await webhookService.triggerWebhook(tenantId, 'document.failed', {
    documentId,
    error,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Example: Trigger webhook when query is completed
 */
export async function onQueryCompleted(tenantId: string, queryData: any) {
  await webhookService.triggerWebhook(tenantId, 'query.completed', {
    conversationId: queryData.conversationId,
    query: queryData.query,
    answer: queryData.answer,
    tokensUsed: queryData.tokensUsed,
    sources: queryData.sources,
  });
}
