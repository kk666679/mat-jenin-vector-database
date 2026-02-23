/**
 * Vector package for embeddings and vector search
 * Uses Transformers.js for local embeddings and Weaviate for storage
 */

import { pipeline, env } from '@xenova/transformers';

// Skip local model checks
env.allowLocalModels = false;
env.useBrowserCache = true;

// ============================================
// TYPES
// ============================================

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
}

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  documentId: string;
  documentTitle: string;
  metadata?: Record<string, unknown>;
}

export interface ChunkResult {
  id: string;
  content: string;
  chunkIndex: number;
  documentId: string;
}

// ============================================
// EMBEDDINGS
// ============================================

let embeddingPipeline: any = null;

/**
 * Get or initialize the embedding pipeline
 */
async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    // Use a lightweight model for embeddings
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embeddingPipeline;
}

/**
 * Generate embedding for a text
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const extractor = await getEmbeddingPipeline();
  
  const output = extractor(text, {
    pooling: 'mean',
    normalize: true,
  });
  
  return {
    embedding: Array.from(output.data),
    tokens: output.data.length,
  };
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  const extractor = await getEmbeddingPipeline();
  
  const results: EmbeddingResult[] = [];
  
  for (const text of texts) {
    const output = extractor(text, {
      pooling: 'mean',
      normalize: true,
    });
    
    results.push({
      embedding: Array.from(output.data),
      tokens: output.data.length,
    });
  }
  
  return results;
}

/**
 * Get embedding dimension
 */
export function getEmbeddingDimension(): number {
  return 384; // all-MiniLM-L6-v2 dimension
}

// ============================================
// TEXT CHUNKING
// ============================================

export interface ChunkOptions {
  chunkSize: number;
  chunkOverlap: number;
}

/**
 * Split text into chunks
 */
export function chunkText(text: string, options: ChunkOptions = { chunkSize: 1000, chunkOverlap: 200 }): string[] {
  const { chunkSize, chunkOverlap } = options;
  const chunks: string[] = [];
  
  // Clean up text
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  
  // Split by paragraphs first
  const paragraphs = cleanText.split(/\n\n+/);
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If single paragraph exceeds chunk size, split by sentences
    if (paragraph.length > chunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      // Split long paragraph by sentences
      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
      let sentenceChunk = '';
      
      for (const sentence of sentences) {
        if ((sentenceChunk + sentence).length > chunkSize) {
          if (sentenceChunk) {
            chunks.push(sentenceChunk.trim());
          }
          // Keep overlap for context
          sentenceChunk = sentenceChunk.slice(-chunkOverlap) + sentence;
        } else {
          sentenceChunk += sentence;
        }
      }
      
      if (sentenceChunk) {
        currentChunk = sentenceChunk;
      }
    } else if ((currentChunk + '\n\n' + paragraph).length > chunkSize) {
      // Current chunk is full, push it
      chunks.push(currentChunk.trim());
      
      // Keep overlap
      const overlapText = currentChunk.slice(-chunkOverlap);
      currentChunk = overlapText + '\n\n' + paragraph;
    } else {
      // Add paragraph to current chunk
      if (currentChunk) {
        currentChunk += '\n\n' + paragraph;
      } else {
        currentChunk = paragraph;
      }
    }
  }
  
  // Push remaining chunk
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// ============================================
// WEAVIATE CLIENT (Placeholder - will be implemented)
// ============================================

/**
 * Weaviate client for vector storage
 * Note: Requires Weaviate instance running
 */
export class WeaviateClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string = 'http://localhost:8080', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey || '';
  }

  /**
   * Get headers for Weaviate requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  /**
   * Search vectors with tenant isolation
   */
  async search(options: {
    tenantId: string;
    query: string;
    topK?: number;
    className?: string;
  }): Promise<SearchResult[]> {
    const { tenantId, query, topK = 5, className = 'DocumentChunk' } = options;
    
    // Generate embedding for query
    const embedding = await generateEmbedding(query);
    
    const response = await fetch(`${this.baseUrl}/v1/objects`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        class: className,
        tenant: tenantId,
        nearVector: {
          vector: embedding.embedding,
          certainty: 0.7,
        },
        limit: topK,
        properties: ['content', 'documentId', 'documentTitle', 'metadata'],
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Weaviate search failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return (data.objects || []).map((obj: any) => ({
      id: obj.id,
      content: obj.properties.content,
      score: obj.certainty || 0,
      documentId: obj.properties.documentId,
      documentTitle: obj.properties.documentTitle,
      metadata: obj.properties.metadata,
    }));
  }

  /**
   * Add vectors to Weaviate
   */
  async addVectors(vectors: Array<{
    id: string;
    content: string;
    embedding: number[];
    documentId: string;
    documentTitle: string;
    metadata?: Record<string, unknown>;
  }>, className: string = 'DocumentChunk'): Promise<void> {
    const batch = vectors.map(v => ({
      class: className,
      id: v.id,
      properties: {
        content: v.content,
        documentId: v.documentId,
        documentTitle: v.documentTitle,
        metadata: v.metadata ? JSON.stringify(v.metadata) : null,
      },
      vector: v.embedding,
    }));
    
    const response = await fetch(`${this.baseUrl}/v1/batch/objects`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ objects: batch }),
    });
    
    if (!response.ok) {
      throw new Error(`Weaviate batch add failed: ${response.statusText}`);
    }
  }

  /**
   * Delete vectors by document ID
   */
  async deleteByDocumentId(documentId: string, className: string = 'DocumentChunk'): Promise<void> {
    const response = await fetch(`${this.baseUrl}/v1/objects/${className}?where={"path":["documentId"],"operator":"Equal","valueString":"${documentId}"}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok && response.status !== 404) {
      throw new Error(`Weaviate delete failed: ${response.statusText}`);
    }
  }
}

/**
 * Create Weaviate client instance
 */
export function createWeaviateClient(): WeaviateClient {
  return new WeaviateClient(
    process.env.WEAVIATE_URL || 'http://localhost:8080',
    process.env.WEAVIATE_API_KEY
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same dimension');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += (a[i] ?? 0) * (b[i] ?? 0);
    normA += (a[i] ?? 0) * (a[i] ?? 0);
    normB += (b[i] ?? 0) * (b[i] ?? 0);
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Normalize vector to unit length
 */
export function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vector;
  return vector.map(val => val / magnitude);
}

// ============================================
// EXPORTS
// ============================================

// Re-export from pinecone
export { PineconeClient, createPineconeClient, isPineconeConfigured } from './pinecone';
export type { PineconeSearchOptions, PineconeVector, PineconeUpsertOptions, PineconeDeleteOptions } from './pinecone';

