#!/usr/bin/env node

import { createLogger } from '../../sdk/shared/logger';
import { OpenClawSystem } from '../index';

const logger = createLogger({ level: process.env.LOG_LEVEL || 'info', name: 'openclaw-worker' });
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let openclaw: OpenClawSystem | null = null;

async function startWorker() {
  logger.info('Starting OpenClaw worker...');

  try {
    openclaw = OpenClawSystem.getInstance({ 
      redisUrl,
      concurrency: parseInt(process.env.WORKER_CONCURRENCY || '10'),
      logLevel: process.env.LOG_LEVEL || 'info',
      enableMonitoring: true
    });

    const status = await openclaw.getStatus();
    logger.info('Worker initialized:', status);

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      if (openclaw) await openclaw.close();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    const statusInterval = setInterval(async () => {
      if (openclaw) {
        try {
          const status = await openclaw.getStatus();
          logger.info('Worker status:', {
            queue: status.queueStats,
            workflows: status.runningWorkflows?.length || 0,
            agents: status.agents?.total || 0
          });
        } catch (error) {
          logger.error('Error getting status:', error);
        }
      }
    }, parseInt(process.env.STATUS_INTERVAL || '60000'));

    process.on('exit', () => clearInterval(statusInterval));
    logger.info('OpenClaw worker started successfully');
  } catch (error) {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  }
}

startWorker();
