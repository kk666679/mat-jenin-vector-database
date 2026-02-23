/**
 * Hybrid SQL + Vector Query Optimizer
 * 
 * Optimizes queries by combining SQL filtering with vector similarity search
 * Supports multiple vector database backends (Weaviate, Pinecone)
 */

import { PrismaClient } from '@prisma/client';
import type { SearchResult } from '../vector';
import { createWeaviateClient, WeaviateClient, createPineconeClient, PineconeClient } from '../vector';

// ============================================
// TYPES
// ============================================

export interface HybridQueryOptions {
  // Query configuration
  query: string;
  tenantId: string;
  
  // SQL filters (applied before vector search)
  sqlFilters?: {
    documentIds?: string[];
    status?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    createdBy?: string;
    contentType?: string[];
  };
  
  // Vector search options
  vectorOptions?: {
    topK?: number;
    minScore?: number;
    includeMetadata?: boolean;
  };
  
  // Hybrid strategy
  strategy?: 'sql-first' | 'vector-first' | 'parallel';
  
  // Vector DB preference
  vectorDb?: 'weaviate' | 'pinecone' | 'auto';
}

export interface HybridQueryResult {
  // Results from different sources
  sqlResults: SqlSearchResult[];
  vectorResults: SearchResult[];
  hybridResults: HybridResult[];
  
  // Metadata
  strategy: 'sql-first' | 'vector-first' | 'parallel';
  sqlQueryTime: number;
  vectorQueryTime: number;
  totalTime: number;
  
  // Execution details
  executedSteps: string[];
}

export interface SqlSearchResult {
  id: string;
  documentId: string;
  title: string;
  content: string;
  chunkIndex: number;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface HybridResult {
  id: string;
  documentId: string;
  title: string;
  content: string;
  combinedScore: number;
  sqlScore: number;
  vectorScore: number;
  source: 'sql' | 'vector' | 'hybrid';
  metadata?: Record<string, unknown>;
}

// ============================================
// CHECK PINEONE CONFIGURATION
// ============================================

function isPineconeConfigured(): boolean {
  return !!(process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_NAME);
}

// ============================================
// HYBRID QUERY OPTIMIZER
// ============================================

/**
 * Hybrid Query Optimizer
 * Combines SQL filtering with vector search for optimal results
 */
class HybridQueryOptimizerClass {
  private prisma: PrismaClient;
  private weaviate: WeaviateClient | null = null;
  private pinecone: PineconeClient | null = null;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Initialize vector database clients
   */
  private async initVectorClients(): Promise<void> {
    try {
      this.weaviate = createWeaviateClient();
    } catch {
      console.log('Weaviate not available');
    }

    if (isPineconeConfigured()) {
      try {
        this.pinecone = createPineconeClient();
      } catch {
        console.log('Pinecone not available');
      }
    }
  }

  /**
   * Select best vector DB based on availability
   */
  private selectVectorDb(preference?: 'weaviate' | 'pinecone' | 'auto'): 'weaviate' | 'pinecone' | 'none' {
    if (preference === 'weaviate' && this.weaviate) return 'weaviate';
    if (preference === 'pinecone' && this.pinecone) return 'pinecone';
    
    // Auto-select based on availability
    if (this.pinecone) return 'pinecone';
    if (this.weaviate) return 'weaviate';
    return 'none';
  }

  /**
   * Execute SQL-only search (full-text search fallback)
   */
  private async sqlSearch(
    query: string,
    tenantId: string,
    filters?: HybridQueryOptions['sqlFilters'],
    limit: number = 20
  ): Promise<SqlSearchResult[]> {
    const where: Record<string, unknown> = {
      tenantId,
    };

    // Apply SQL filters
    if (filters?.documentIds && filters.documentIds.length > 0) {
      where.id = { in: filters.documentIds };
    }
    if (filters?.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }
    if (filters?.createdBy) {
      where.createdBy = filters.createdBy;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        (where.createdAt as Record<string, Date>).gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        (where.createdAt as Record<string, Date>).lte = filters.dateTo;
      }
    }

    // Get chunks with their documents
    const chunks = await this.prisma.documentChunk.findMany({
      where: {
        tenantId,
        document: where,
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      take: limit * 2,
    });

    // Calculate relevance scores based on keyword matching
    const queryTerms = query.toLowerCase().split(/\s+/).filter((t: string) => t.length > 2);
    
    return chunks.map((chunk: any) => {
      const contentLower = chunk.content.toLowerCase();
      let matches = 0;
      
      for (const term of queryTerms) {
        if (contentLower.includes(term)) {
          matches++;
        }
      }
      
      const score = queryTerms.length > 0 ? matches / queryTerms.length : 0;
      
      return {
        id: chunk.id,
        documentId: chunk.documentId,
        title: chunk.document?.title || 'Unknown',
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        score,
        metadata: chunk.metadata ? JSON.parse(chunk.metadata) : undefined,
      };
    })
    .filter((r: SqlSearchResult) => r.score > 0)
    .sort((a: SqlSearchResult, b: SqlSearchResult) => b.score - a.score)
    .slice(0, limit);
  }

  /**
   * Execute vector search
   */
  private async vectorSearch(
    query: string,
    tenantId: string,
    topK: number = 10,
    vectorDb: 'weaviate' | 'pinecone'
  ): Promise<SearchResult[]> {
    if (vectorDb === 'pinecone' && this.pinecone) {
      return this.pinecone.search({
        tenantId,
        query,
        topK,
      });
    }
    
    if (vectorDb === 'weaviate' && this.weaviate) {
      return this.weaviate.search({
        tenantId,
        query,
        topK,
      });
    }
    
    return [];
  }

  /**
   * Merge SQL and vector results with scoring
   */
  private mergeResults(
    sqlResults: SqlSearchResult[],
    vectorResults: SearchResult[],
    minScore: number = 0
  ): HybridResult[] {
    const resultMap = new Map<string, HybridResult>();

    // Add SQL results
    for (const sql of sqlResults) {
      resultMap.set(sql.id, {
        id: sql.id,
        documentId: sql.documentId,
        title: sql.title,
        content: sql.content,
        combinedScore: sql.score,
        sqlScore: sql.score,
        vectorScore: 0,
        source: 'sql',
        ...(sql.metadata !== undefined && { metadata: sql.metadata }),
      });
    }

    // Add/merge vector results
    for (const vector of vectorResults) {
      const existing = resultMap.get(vector.id);
      
      if (existing) {
        // Merge with existing SQL result
        existing.vectorScore = vector.score;
        existing.combinedScore = (existing.sqlScore + vector.score) / 2;
        existing.source = 'hybrid';
      } else {
        resultMap.set(vector.id, {
          id: vector.id,
          documentId: vector.documentId,
          title: vector.documentTitle,
          content: vector.content,
          combinedScore: vector.score,
          sqlScore: 0,
          vectorScore: vector.score,
          source: 'vector',
          ...(vector.metadata !== undefined && { metadata: vector.metadata }),
        });
      }
    }

    // Filter by minimum score and return sorted
    return Array.from(resultMap.values())
      .filter((r: HybridResult) => r.combinedScore >= minScore)
      .sort((a: HybridResult, b: HybridResult) => b.combinedScore - a.combinedScore);
  }

  /**
   * Execute hybrid query with specified strategy
   */
  async execute(options: HybridQueryOptions): Promise<HybridQueryResult> {
    const startTime = Date.now();
    const executedSteps: string[] = [];
    
    // Initialize vector clients if needed
    await this.initVectorClients();
    
    const {
      query,
      tenantId,
      sqlFilters,
      vectorOptions = {},
      strategy = 'sql-first',
      vectorDb: vectorDbPreference = 'auto',
    } = options;

    const { topK = 10, minScore = 0 } = vectorOptions;

    let sqlResults: SqlSearchResult[] = [];
    let vectorResults: SearchResult[] = [];
    let sqlQueryTime = 0;
    let vectorQueryTime = 0;

    // Select vector DB
    const vectorDb = this.selectVectorDb(vectorDbPreference);

    // Execute based on strategy
    switch (strategy) {
      case 'sql-first': {
        executedSteps.push('Executing SQL search first');
        
        // SQL search
        const sqlStart = Date.now();
        sqlResults = await this.sqlSearch(query, tenantId, sqlFilters, topK);
        sqlQueryTime = Date.now() - sqlStart;
        executedSteps.push(`SQL search completed in ${sqlQueryTime}ms, found ${sqlResults.length} results`);
        
        // If SQL returned enough results, use them directly
        if (sqlResults.length >= topK) {
          executedSteps.push('SQL results sufficient, skipping vector search');
        } else {
          // Vector search for additional results
          if (vectorDb !== 'none') {
            executedSteps.push('SQL results insufficient, executing vector search');
            const vecStart = Date.now();
            vectorResults = await this.vectorSearch(query, tenantId, topK, vectorDb);
            vectorQueryTime = Date.now() - vecStart;
            executedSteps.push(`Vector search completed in ${vectorQueryTime}ms, found ${vectorResults.length} results`);
          }
        }
        break;
      }

      case 'vector-first': {
        executedSteps.push('Executing vector search first');
        
        // Vector search
        if (vectorDb !== 'none') {
          const vecStart = Date.now();
          vectorResults = await this.vectorSearch(query, tenantId, topK, vectorDb);
          vectorQueryTime = Date.now() - vecStart;
          executedSteps.push(`Vector search completed in ${vectorQueryTime}ms, found ${vectorResults.length} results`);
          
          // Use vector results to filter SQL
          if (vectorResults.length > 0) {
            executedSteps.push('Using vector results to refine SQL query');
            const docIds = vectorResults.map((v: SearchResult) => v.documentId);
            const refinedFilters = { ...sqlFilters, documentIds: docIds };
            
            const sqlStart = Date.now();
            sqlResults = await this.sqlSearch(query, tenantId, refinedFilters, topK);
            sqlQueryTime = Date.now() - sqlStart;
            executedSteps.push(`Refined SQL search found ${sqlResults.length} results`);
          }
        } else {
          executedSteps.push('Vector DB not available, falling back to SQL-only');
          const sqlStart = Date.now();
          sqlResults = await this.sqlSearch(query, tenantId, sqlFilters, topK);
          sqlQueryTime = Date.now() - sqlStart;
        }
        break;
      }

      case 'parallel': {
        executedSteps.push('Executing SQL and vector searches in parallel');
        
        // Execute both in parallel
        const [sqlParallel, vecParallel] = await Promise.all([
          this.sqlSearch(query, tenantId, sqlFilters, topK),
          vectorDb !== 'none' 
            ? this.vectorSearch(query, tenantId, topK, vectorDb)
            : Promise.resolve([]),
        ]);
        
        sqlResults = sqlParallel;
        vectorResults = vecParallel;
        
        sqlQueryTime = vectorQueryTime = 0; // Not tracked in parallel
        executedSteps.push(`Parallel search completed: ${sqlResults.length} SQL, ${vectorResults.length} vector results`);
        break;
      }
    }

    // Merge results
    const hybridResults = this.mergeResults(sqlResults, vectorResults, minScore);
    executedSteps.push(`Merged results: ${hybridResults.length} unique items`);

    const totalTime = Date.now() - startTime;
    executedSteps.push(`Total query time: ${totalTime}ms`);

    return {
      sqlResults,
      vectorResults,
      hybridResults,
      strategy,
      sqlQueryTime,
      vectorQueryTime,
      totalTime,
      executedSteps,
    };
  }

  /**
   * Get query plan without execution
   */
  async getQueryPlan(options: HybridQueryOptions): Promise<{
    recommendedStrategy: 'sql-first' | 'vector-first' | 'parallel';
    estimatedSqlResults: number;
    estimatedVectorResults: number;
    reasoning: string;
  }> {
    // Analyze query characteristics
    const queryLength = options.query.length;
    const hasFilters = !!(options.sqlFilters && Object.keys(options.sqlFilters).length > 0);
    
    // Initialize vector clients
    await this.initVectorClients();
    const vectorDb = this.selectVectorDb(options.vectorDb);
    
    // Determine best strategy
    let recommendedStrategy: 'sql-first' | 'vector-first' | 'parallel' = 'sql-first';
    let reasoning = '';
    
    if (!hasFilters && vectorDb !== 'none') {
      // No filters + vector available = vector-first is better
      recommendedStrategy = 'vector-first';
      reasoning = 'No SQL filters specified and vector DB is available. Vector-first provides better semantic search.';
    } else if (hasFilters && queryLength > 100) {
      // Has filters + long query = parallel
      recommendedStrategy = 'parallel';
      reasoning = 'SQL filters with complex query. Parallel execution provides best of both worlds.';
    } else {
      // Default to sql-first
      reasoning = 'Default strategy provides reliable fallback if vector DB is unavailable.';
    }

    // Estimate result counts (simplified)
    const estimatedSqlResults = hasFilters ? 10 : 20;
    const estimatedVectorResults = vectorDb !== 'none' ? 10 : 0;

    return {
      recommendedStrategy,
      estimatedSqlResults,
      estimatedVectorResults,
      reasoning,
    };
  }
}

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Create hybrid query optimizer
 */
export function createHybridQueryOptimizer(prisma?: PrismaClient): HybridQueryOptimizerClass {
  const client = prisma || new PrismaClient();
  return new HybridQueryOptimizerClass(client);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Determine if hybrid search is beneficial
 */
export function shouldUseHybridSearch(query: string, hasFilters: boolean): boolean {
  // Use hybrid for complex queries or when filters are present
  return query.length > 50 || hasFilters;
}

/**
 * Calculate optimal topK based on filters
 */
export function calculateOptimalTopK(
  hasSqlFilters: boolean,
  vectorDbAvailable: boolean
): number {
  if (!vectorDbAvailable) {
    // SQL-only: need more results for filtering
    return hasSqlFilters ? 20 : 30;
  }
  
  // With vector DB: can use smaller topK
  return hasSqlFilters ? 15 : 10;
}

/**
 * Combine scores from SQL and vector results
 */
export function combineScores(
  sqlScore: number,
  vectorScore: number,
  weights: { sql?: number; vector?: number } = {}
): number {
  const sqlWeight = weights.sql ?? 0.3;
  const vectorWeight = weights.vector ?? 0.7;
  
  return (sqlScore * sqlWeight) + (vectorScore * vectorWeight);
}

// Export the class for external use
export { HybridQueryOptimizerClass };

