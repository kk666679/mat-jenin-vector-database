import type { Logger } from 'pino';
import { BaseAgent, type AgentResult, type AgentTask } from '../core';
import { ragService } from '../../services/rag';

export interface QueryAgentPayload {
  query: string;
  topK?: number;
  // If true, will run full RAG (LLM generation). If false: retrieval only.
  includeAnswer?: boolean;
  includeSources?: boolean;
}

export type QueryAgentResult =
  | Awaited<ReturnType<typeof ragService.search>>
  | Awaited<ReturnType<typeof ragService.searchOnly>>;

export class QueryAgent extends BaseAgent<QueryAgentPayload, QueryAgentResult> {
  constructor(logger: Logger) {
    super('QueryAgent', logger);
    this.capabilities = [
      {
        name: 'query',
        description: 'Run retrieval-only or full RAG query via ragService',
      },
    ];
  }

  canHandle(task: AgentTask): boolean {
    return task.type === 'query';
  }

  async execute(task: AgentTask<QueryAgentPayload>): Promise<AgentResult<QueryAgentResult>> {
    const {
      query,
      topK = 5,
      includeAnswer = true,
      includeSources = true,
    } = task.payload;

    return this.withMetrics('query', async () => {
      try {
        if (!includeAnswer) {
          const results = await ragService.searchOnly(
            { tenantId: task.context.tenantId, query, topK },
            'weighted'
          );
          return {
            success: true,
            taskId: task.id,
            data: results as any,
            metadata: { mode: 'retrieval-only' },
          };
        }

        const result = await ragService.search({
          tenantId: task.context.tenantId,
          query,
          topK,
          includeSources,
        });

        return {
          success: true,
          taskId: task.id,
          data: result as any,
          metadata: { mode: 'rag' },
        };
      } catch (err: any) {
        return {
          success: false,
          taskId: task.id,
          error: err?.message ?? String(err),
        };
      }
    });
  }
}

