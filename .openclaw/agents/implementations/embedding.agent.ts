import { BaseAgent, AgentTask, AgentResult } from '../core/base.agent';
import { MLService } from '../../../sdk/ml';
import { Logger } from '../../../sdk/shared/logger';

export interface EmbeddingTaskPayload {
  text?: string;
  texts?: string[];
  model?: string;
  batch?: boolean;
  normalize?: boolean;
}

export class EmbeddingAgent extends BaseAgent {
  private mlService: MLService;

  constructor(logger: Logger) {
    super('EmbeddingAgent', '1.0.0', logger);
    this.mlService = new MLService(logger);
    this.capabilities = [
      {
        name: 'embed-text',
        description: 'Generate embeddings for text',
        inputSchema: { text: 'string' },
        outputSchema: { vector: 'number[]', dimensions: 'number' },
        version: '1.0.0'
      },
      {
        name: 'embed-batch',
        description: 'Generate embeddings for multiple texts',
        inputSchema: { texts: 'string[]' },
        outputSchema: { vectors: 'number[][]', dimensions: 'number' },
        version: '1.0.0'
      }
    ];
  }

  canHandle(task: AgentTask): boolean {
    return ['embed-text', 'embed-batch'].includes(task.type);
  }

  async execute(task: AgentTask<EmbeddingTaskPayload>): Promise<AgentResult> {
    const { text, texts, model = 'Xenova/all-MiniLM-L6-v2', batch = false, normalize = true } = task.payload;

    return this.withMetrics('embedding', async () => {
      try {
        let data;

        if (batch && texts) {
          const result = await this.mlService.batchEmbed(texts, model);
          data = {
            vectors: result.vectors,
            dimensions: result.dimensions,
            count: result.vectors.length,
            model: result.model,
            duration: result.duration
          };
        } else if (text) {
          const result = await this.mlService.embedText(text, model);
          data = {
            vector: result.vector,
            dimensions: result.dimensions,
            model: result.model,
            duration: result.duration
          };
        } else {
          throw new Error('Either text or texts must be provided');
        }

        return {
          success: true,
          data,
          taskId: task.id,
          metadata: {
            model,
            batch,
            normalize,
            timestamp: new Date().toISOString()
          }
        };
      } catch (error) {
        this.logger.error('Embedding failed:', error);
        return {
          success: false,
          error: error.message,
          taskId: task.id
        };
      }
    });
  }
}
