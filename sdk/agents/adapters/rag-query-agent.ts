import type { Logger } from 'pino';
import { BaseAgent, type AgentResult, type AgentTask } from '../core';
import { ragService } from '../../services/rag';

export interface RagQueryAgentPayload {
  query: string;
  topK?: number;
  conversationId?: string | null;
  includeSources?: boolean;
}

export type RagQueryAgentResult = Awaited<ReturnType<typeof ragService.search>>;

export class RagQueryAgent extends BaseAgent<RagQueryAgentPayload, RagQueryAgentResult> {
  constructor(logger: Logger) {
    super('RagQueryAgent', logger);
    this.capabilities = [
      {
        name: 'rag-query',
        description: 'Run full RAG query using Matjenin ragService',
      },
    ];
  }

  canHandle(task: AgentTask): boolean {
    return task.type === 'rag-query';
  }

  async execute(task: AgentTask<RagQueryAgentPayload>): Promise<AgentResult<RagQueryAgentResult>> {
    const { query, topK = 5, conversationId = null, includeSources = true } = task.payload;

    return this.withMetrics('rag-query', async () => {
      try {
        const ragResult = await ragService.search({
          tenantId: task.context.tenantId,
          query,
          topK,
          conversationId,
          includeSources,
        });

        return {
          success: true,
          data: ragResult,
          taskId: task.id,
          metadata: {
            model: 'matjenin-rag',
          },
        };
      } catch (err: any) {
        return {
          success: false,
          error: err?.message ?? String(err),
          taskId: task.id,
        };
      }
    });
  }
}

