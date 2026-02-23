/**
 * Pinecone Vector Database Client
 * 
 * Integration with Pinecone for vector storage and similarity search
 * Provides an alternative to Weaviate for vector operations
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { generateEmbedding } from './index';
import type { SearchResult } from './index';

// Type for query match in Pinecone v2
interface QueryMatch {
  id: string;
  score?: number;
  value?: number;
  metadata?: Record<string, unknown>;
}

// ============================================
// TYPES
// ============================================

export interface PineconeSearchOptions {
  tenantId: string;
  query: string;
  topK?: number;
  namespace?: string;
  includeMetadata?: boolean;
  includeValues?: boolean;
  filter?: Record<string, unknown>;
}

export interface PineconeVector {
  id: string;
  values: number[];
  metadata?: Record<string, unknown>;
}

export interface PineconeUpsertOptions {
  vectors: PineconeVector[];
  namespace?: string;
}

export interface PineconeDeleteOptions {
  ids?: string[];
  deleteAll?: boolean;
  namespace?: string;
  filter?: Record<string, unknown>;
}

// ============================================
// PINEONE CLIENT
// ============================================

/**
 * Pinecone client wrapper with tenant isolation
 * Uses the latest Pinecone SDK v2
 */
export class PineconeClient {
  private client: Pinecone;
  private indexName: string;
  private index: any = null;

  constructor(indexName?: string) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY environment variable is required');
    }

    this.client = new Pinecone({
      apiKey,
    });

    this.indexName = indexName || process.env.PINECONE_INDEX || 'document-chunks';
  }

  /**
   * Get or initialize the index
   */
  private async getIndex(): Promise<any> {
    if (!this.index) {
      this.index = this.client.Index(this.indexName);
    }
    return this.index;
  }

  /**
   * Build tenant-scoped namespace
   */
  private getNamespace(tenantId: string): string {
    // Use tenant ID as namespace for isolation
    return `tenant_${tenantId}`;
  }

  /**
   * Search vectors with tenant isolation
   */
  async search(options: PineconeSearchOptions): Promise<SearchResult[]> {
    const { tenantId, query, topK = 5, includeMetadata = true, filter } = options;
    
    // Generate embedding for query
    const embeddingResult = await generateEmbedding(query);
    
    const index = await this.getIndex();
    const namespace = this.getNamespace(tenantId);
    
    // Build query request - namespace goes at top level in v2
    const queryRequest: any = {
      vector: embeddingResult.embedding,
      topK,
      includeMetadata,
      includeValues: false,
      filter: filter || { tenantId: tenantId },
      namespace,
    };
    
    const queryResponse = await index.query(queryRequest);
    
    // Transform results to our SearchResult format
    const matches = queryResponse.matches || [];
    return matches.map((match: QueryMatch) => {
      const metadata = match.metadata || {};
      return {
        id: match.id,
        content: String(metadata.content || ''),
        score: match.score ?? 0,
        documentId: String(metadata.documentId || ''),
        documentTitle: String(metadata.documentTitle || 'Unknown'),
        metadata,
      };
    });
  }

  /**
   * Upsert vectors to Pinecone
   */
  async upsertVectors(options: PineconeUpsertOptions): Promise<void> {
    const { vectors, namespace: customNamespace } = options;
    
    if (vectors.length === 0) {
      return;
    }
    
    const index = await this.getIndex();
    
    // If no namespace provided, use default (no namespace)
    const namespace = customNamespace || '';
    
    // Upsert vectors in batches (max 1000 per request)
    const batchSize = 1000;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      // In Pinecone v2, use 'records' instead of 'vectors'
      const upsertRequest: any = {
        records: batch,
      };
      if (namespace) {
        upsertRequest.namespace = namespace;
      }
      await index.upsert(upsertRequest);
    }
  }

  /**
   * Add vectors with automatic tenant isolation
   */
  async addVectors(vectors: Array<{
    id: string;
    content: string;
    embedding: number[];
    documentId: string;
    documentTitle: string;
    tenantId: string;
    metadata?: Record<string, unknown>;
  }>, namespace?: string): Promise<void> {
    const pineconeVectors: PineconeVector[] = vectors.map(v => ({
      id: v.id,
      values: v.embedding,
      metadata: {
        content: v.content,
        documentId: v.documentId,
        documentTitle: v.documentTitle,
        tenantId: v.tenantId,
        ...v.metadata,
      },
    }));

    await this.upsertVectors({
      vectors: pineconeVectors,
      ...(namespace !== undefined && { namespace }),
    });
  }

  /**
   * Delete vectors by ID
   */
  async deleteByIds(ids: string[], namespace?: string): Promise<void> {
    const index = await this.getIndex();
    // In Pinecone v2, delete accepts ids directly at top level
    await index.delete({
      ids,
      ...(namespace && { namespace }),
    });
  }

  /**
   * Delete vectors by document ID
   */
  async deleteByDocumentId(documentId: string, tenantId: string): Promise<void> {
    const index = await this.getIndex();
    const namespace = this.getNamespace(tenantId);
    
    await index.delete({
      filter: { documentId: documentId },
      ...(namespace && { namespace }),
    });
  }

  /**
   * Delete all vectors for a tenant
   */
  async deleteAllForTenant(tenantId: string): Promise<void> {
    const index = await this.getIndex();
    const namespace = this.getNamespace(tenantId);
    
    await index.delete({
      filter: { tenantId: tenantId },
      ...(namespace && { namespace }),
    });
  }

  /**
   * Fetch vectors by IDs
   */
  async fetchByIds(ids: string[], namespace?: string): Promise<PineconeVector[]> {
    const index = await this.getIndex();
    // In Pinecone v2, fetch accepts ids directly
    const response = await index.fetch({
      ids,
      ...(namespace && { namespace }),
    });
    
    const vectors: PineconeVector[] = [];
    // In Pinecone v2, response has 'records' instead of 'vectors'
    const records = (response as any).records;
    if (records) {
      for (const [id, record] of Object.entries(records)) {
        vectors.push({
          id: id,
          values: Array.from((record as any).values || []),
          metadata: (record as any).metadata,
        });
      }
    }
    return vectors;
  }

  /**
   * Describe index stats
   */
  async describeIndexStats(): Promise<{
    dimension: number;
    totalVectorCount: number;
    namespaceCount: number;
  }> {
    const index = await this.getIndex();
    const stats = await index.describeStats();
    
    return {
      dimension: stats.dimension || 0,
      // In Pinecone v2, use totalRecordCount instead of totalVectorCount
      totalVectorCount: stats.totalRecordCount || 0,
      namespaceCount: stats.namespaces ? Object.keys(stats.namespaces).length : 0,
    };
  }

  /**
   * Update vector metadata
   */
  async updateMetadata(
    id: string,
    metadata: Record<string, unknown>,
    namespace?: string
  ): Promise<void> {
    const index = await this.getIndex();
    // In Pinecone v2, use 'metadata' instead of 'setMetadata'
    await index.update({
      id,
      metadata,
      ...(namespace && { namespace }),
    });
  }

  /**
   * Get list of available indexes
   */
  async listIndexes(): Promise<string[]> {
    const list = await this.client.listIndexes();
    // In Pinecone v2, listIndexes returns an array directly
    if (Array.isArray(list)) {
      return list.map((i: any) => i.name || i);
    }
    return [];
  }

  /**
   * Create a new index (if needed)
   */
  async createIndexIfNotExists(
    name: string,
    dimension: number = 384,
    metric: 'cosine' | 'euclidean' | 'dotproduct' = 'cosine'
  ): Promise<void> {
    const existing = await this.listIndexes();
    
    if (!existing.includes(name)) {
      await this.client.createIndex({
        name,
        dimension,
        metric,
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });
      
      // Wait for index to be ready
      console.log(`Creating Pinecone index: ${name}`);
    }
  }
}

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Create Pinecone client instance
 */
export function createPineconeClient(): PineconeClient {
  return new PineconeClient(process.env.PINECONE_INDEX);
}

/**
 * Create Pinecone client with custom index
 */
export function createPineconeClientWithIndex(indexName: string): PineconeClient {
  return new PineconeClient(indexName);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if Pinecone is configured
 */
export function isPineconeConfigured(): boolean {
  return !!process.env.PINECONE_API_KEY;
}

/**
 * Get embedding dimension for Pinecone
 * Based on the model used (all-MiniLM-L6-v2 = 384)
 */
export function getPineconeDimension(): number {
  return 384;
}

/**
 * Convert Weaviate-style results to Pinecone format
 */
export function convertToPineconeVectors(items: Array<{
  id: string;
  content: string;
  embedding: number[];
  documentId: string;
  documentTitle: string;
  tenantId: string;
  metadata?: Record<string, unknown>;
}>): PineconeVector[] {
  return items.map(item => ({
    id: item.id,
    values: item.embedding,
    metadata: {
      content: item.content,
      documentId: item.documentId,
      documentTitle: item.documentTitle,
      tenantId: item.tenantId,
      ...item.metadata,
    },
  }));
}

