import { webhookService } from '@/sdk';

/**
 * Webhook Worker
 * Processes pending webhook deliveries and retries
 */
export async function startWebhookWorker() {
  console.log('Starting webhook worker...');
  
  // Process retries every minute
  setInterval(async () => {
    try {
      await webhookService.processRetries();
    } catch (error) {
      console.error('Webhook worker error:', error);
    }
  }, 60000);
}

if (require.main === module) {
  startWebhookWorker();
}
