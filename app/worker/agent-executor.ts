import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import pino from 'pino';

import { AgentRegistry } from '@/sdk/agents/registry';
import { AgentExecutor, RagQueryAgent, DocumentProcessingAgent, QueryAgent, OrchestratorAgent } from '@/sdk/agents';
import { createWorker } from '@/sdk/queue';


const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const prisma = new PrismaClient();

async function main() {
  logger.info('Starting agent execution worker...');

  const registry = new AgentRegistry(logger);
  registry.register(new DocumentProcessingAgent(logger));
  registry.register(new RagQueryAgent(logger));
  registry.register(new QueryAgent(logger));
  registry.register(new OrchestratorAgent(logger, registry));

  const executor = new AgentExecutor(logger, registry);

  const worker = createWorker(
    'agent-execution',
    async (job: any) => {
      const { agentTask } = job.data || {};
      if (!agentTask) {
        throw new Error('Missing agentTask in job.data');
      }

      const result = await executor.execute(agentTask);

      // Best-effort persistence: if Prisma schema matches, update job status.
      try {
        if (job?.id && prisma.job) {
          const data: any = {
            status: result.success ? 'completed' : 'failed',
            completedAt: new Date(),
          };

          if (result.success) {
            data.progress = 100;
            data.result = JSON.stringify(result.data ?? {});
            data.error = null;
          } else {
            data.progress = 0;
            data.error = result.error;
            data.result = null;
          }

          await prisma.job.update({
            where: { id: String(job.id) },
            data,
          });
        }
      } catch {
        // ignore
      }

      // BullMQ worker processor for this project expects Promise<void>.
      // We still compute result for optional persistence.
      return;
    }
  );

  worker.on('completed', (job: any) => logger.info({ id: job?.id }, 'Agent job completed'));
  worker.on('failed', (job: any, err: Error) => logger.error({ id: job?.id, err }, 'Agent job failed'));

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down agent worker...');
    await worker.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  logger.info('Agent execution worker is listening for jobs...');
}

main().catch((err) => {
  logger.error({ err }, 'Agent executor worker crashed');
  process.exit(1);
});

