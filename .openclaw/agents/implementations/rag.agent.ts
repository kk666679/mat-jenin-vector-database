import { BaseAgent, AgentTask, AgentResult } from '../core/base.agent';
import { MLService } from '../../../sdk/ml';
import { Logger } from '../../../sdk/shared/logger';

export interface RAGTaskPayload {
  query: string;
  topK?: number;
  rerank?: boolean;
  hybridSearch?: boolean;
  includeSources?: boolean;
  includeReasoning?: boolean;
  context?: string;
}

class MockVectorService {
  async search(params: any): Promise<any[]> {
    return [
      { id: '1', text: 'Artificial intelligence is the simulation of human intelligence in machines.', score: 0.95, metadata: { source: 'AI Overview' } },
      { id: '2', text: 'Machine learning is a subset of AI that enables systems to learn from data.', score: 0.87, metadata: { source: 'ML Guide' } },
      { id: '3', text: 'Deep learning uses neural networks with multiple layers to learn representations.', score: 0.82, metadata: { source: 'Deep Learning Book' } }
    ];
  }

  async keywordSearch(params: any): Promise<any[]> {
    return [
      { id: '4', text: 'AI systems use algorithms to process information.', score: 0.85, metadata: { source: 'Algorithms' } },
      { id: '5', text: 'Data is essential for training machine learning models.', score: 0.81, metadata: { source: 'Data Science' } }
    ];
  }
}

export class RAGAgent extends BaseAgent {
  private mlService: MLService;
  private vectorService: MockVectorService;

  constructor(logger: Logger) {
    super('RAGAgent', '1.0.0', logger);
    this.mlService = new MLService(logger);
    this.vectorService = new MockVectorService();
    this.capabilities = [
      {
        name: 'rag-query',
        description: 'Perform RAG query with retrieval and generation',
        inputSchema: { query: 'string', topK: 'number' },
        outputSchema: { answer: 'string', sources: 'array' },
        version: '1.0.0'
      }
    ];
  }

  canHandle(task: AgentTask): boolean {
    return ['rag-query', 'rag-search'].includes(task.type);
  }

  async execute(task: AgentTask<RAGTaskPayload>): Promise<AgentResult> {
    const { query, topK = 10, rerank = true, hybridSearch = true, includeSources = true, includeReasoning = true } = task.payload;

    return this.withMetrics('rag-query', async () => {
      try {
        const embeddingResult = await this.mlService.embedText(query);
        let searchResults = await this.vectorService.search({
          vector: embeddingResult.vector,
          topK: hybridSearch ? topK * 2 : topK,
          filters: { tenantId: task.context.tenantId }
        });

        if (hybridSearch) {
          const keywordResults = await this.vectorService.keywordSearch({
            query,
            topK: topK * 2,
            filters: { tenantId: task.context.tenantId }
          });
          searchResults = this.mergeSearchResults(searchResults, keywordResults, topK);
        }

        if (rerank) {
          searchResults = await this.rerankResults(query, searchResults);
        }

        const context = searchResults.slice(0, 5).map((r, i) => `[${i + 1}] ${r.text}`).join('\n\n');
        const prompt = `Based on the following context, answer the question. If the answer cannot be found in the context, say so.\n\nContext:\n${context}\n\nQuestion: ${query}\n\nAnswer:`;
        const answer = await this.mlService.generateText(prompt, 'Xenova/gpt2', {
          maxTokens: 200,
          temperature: 0.7
        });

        const result = {
          query,
          answer: answer.trim() || 'I cannot find a specific answer in the provided context.',
          sources: includeSources ? searchResults.slice(0, 5).map((r: any) => ({
            id: r.id,
            documentId: r.documentId || r.id,
            text: r.text,
            score: r.score,
            metadata: r.metadata
          })) : undefined,
          reasoning: includeReasoning ? {
            matchedChunks: searchResults.length,
            topMatchScore: searchResults[0]?.score || 0,
            totalDocuments: searchResults.length,
            searchMethod: hybridSearch ? 'hybrid' : 'vector'
          } : undefined,
          metadata: {
            totalMatches: searchResults.length,
            topScore: searchResults[0]?.score || 0,
            hybridSearch,
            rerank
          }
        };

        return {
          success: true,
          data: result,
          taskId: task.id,
          metadata: {
            query,
            topK,
            timestamp: new Date().toISOString()
          }
        };
      } catch (error) {
        this.logger.error('RAG query failed:', error);
        return {
          success: false,
          error: error.message,
          taskId: task.id
        };
      }
    });
  }

  private mergeSearchResults(vectorResults: any[], keywordResults: any[], topK: number): any[] {
    const merged = new Map();
    vectorResults.forEach(r => merged.set(r.id, { ...r, score: r.score * 0.7 }));
    keywordResults.forEach(r => {
      if (merged.has(r.id)) {
        const existing = merged.get(r.id);
        existing.score += r.score * 0.3;
      } else {
        merged.set(r.id, { ...r, score: r.score * 0.3 });
      }
    });
    return Array.from(merged.values()).sort((a, b) => b.score - a.score).slice(0, topK);
  }

  private async rerankResults(query: string, results: any[]): Promise<any[]> {
    const queryEmbedding = await this.mlService.embedText(query);
    const reranked = results.map(result => ({
      ...result,
      score: this.mlService.calculateSimilarity(queryEmbedding.vector, result.vector || result.embedding || result.vector)
    }));
    return reranked.sort((a, b) => b.score - a.score);
  }
}
