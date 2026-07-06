import { BaseAgent, AgentTask, AgentResult } from '../core/base.agent';
import { MLService } from '../../../sdk/ml';
import { Logger } from '../../../sdk/shared/logger';

export interface DocumentProcessorPayload {
  action: 'process' | 'chunk' | 'embed' | 'index' | 'summarize';
  documentId?: string;
  content?: string;
  metadata?: Record<string, any>;
  chunkSize?: number;
  overlap?: number;
  batchId?: string;
}

export class DocumentProcessorAgent extends BaseAgent {
  private mlService: MLService;

  constructor(logger: Logger) {
    super('DocumentProcessorAgent', '1.0.0', logger);
    this.mlService = new MLService(logger);
    this.capabilities = [
      {
        name: 'process-document',
        description: 'Process document into chunks and embeddings',
        inputSchema: { content: 'string', metadata: 'object' },
        outputSchema: { chunks: 'array', vectorIds: 'array' },
        version: '1.0.0'
      },
      {
        name: 'summarize-document',
        description: 'Generate summary of document',
        inputSchema: { content: 'string' },
        outputSchema: { summary: 'string' },
        version: '1.0.0'
      }
    ];
  }

  canHandle(task: AgentTask): boolean {
    return ['process-document', 'summarize-document'].includes(task.type);
  }

  async execute(task: AgentTask<DocumentProcessorPayload>): Promise<AgentResult> {
    const { action, content, metadata, chunkSize = 512, overlap = 50 } = task.payload;

    switch (action || 'process') {
      case 'process':
        return this.processDocument(content!, metadata, chunkSize, overlap, task);
      case 'summarize':
        return this.summarizeDocument(content!, task);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async processDocument(
    content: string,
    metadata: Record<string, any>,
    chunkSize: number,
    overlap: number,
    task: AgentTask
  ): Promise<AgentResult> {
    return this.withMetrics('document-processing', async () => {
      try {
        if (!content) throw new Error('Content is required for document processing');
        const chunks = this.chunkText(content, chunkSize, overlap);
        this.logger.info(`Document chunked into ${chunks.length} chunks`);
        const embeddingResults = await this.mlService.batchEmbed(chunks);
        this.logger.info(`Generated ${embeddingResults.vectors.length} embeddings`);

        const results = chunks.map((chunk, i) => ({
          chunkIndex: i,
          text: chunk,
          vector: embeddingResults.vectors[i],
          metadata: {
            ...metadata,
            chunkIndex: i,
            totalChunks: chunks.length,
            chunkSize,
            overlap,
            processedAt: new Date().toISOString(),
            tenantId: task.context.tenantId
          }
        }));

        return {
          success: true,
          data: {
            documentId: task.id,
            chunks: results,
            totalChunks: chunks.length,
            status: 'COMPLETED',
            vectorCount: embeddingResults.vectors.length,
            dimension: embeddingResults.dimensions
          },
          taskId: task.id,
          metadata: {
            chunkSize,
            overlap,
            timestamp: new Date().toISOString()
          }
        };
      } catch (error) {
        this.logger.error('Document processing failed:', error);
        return {
          success: false,
          error: error.message,
          taskId: task.id
        };
      }
    });
  }

  private async summarizeDocument(content: string, task: AgentTask): Promise<AgentResult> {
    return this.withMetrics('document-summarization', async () => {
      try {
        const summary = await this.mlService.summarize(content, 'Xenova/distilbart-cnn-6-6', {
          maxLength: 150,
          minLength: 50
        });
        return {
          success: true,
          data: { summary, originalLength: content.length, summaryLength: summary.length },
          taskId: task.id,
          metadata: { timestamp: new Date().toISOString() }
        };
      } catch (error) {
        this.logger.error('Summarization failed:', error);
        return {
          success: false,
          error: error.message,
          taskId: task.id
        };
      }
    });
  }

  private chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentChunk = '';
    let wordCount = 0;
    
    for (const sentence of sentences) {
      const sentenceWords = sentence.split(' ').length;
      if (wordCount + sentenceWords > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(overlap / 10));
        currentChunk = overlapWords.join(' ') + ' ';
        wordCount = overlapWords.length;
      }
      currentChunk += sentence + ' ';
      wordCount += sentenceWords;
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    return chunks;
  }
}
