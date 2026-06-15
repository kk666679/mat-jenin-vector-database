/**
 * Worker entry point - processes document jobs from the queue
 * 
 * IMPORTANT: This worker runs in a separate process and should NOT import
 * from Next.js or any React-related code. It uses its own Prisma client.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createWorker, getDocumentProcessingQueue, chunkText, generateEmbedding, createPineconeClient } from '@/sdk';

// Worker-specific Prisma client (separate from Next.js API routes)
const prisma = new PrismaClient();

console.log('Starting worker...');

/**
 * Process document embedding job
 */
async function processDocumentJob(jobId: string, data: any) {
  console.log(`Processing document job: ${jobId}`, data);
  
  const { documentId, tenantId, traceId } = data;
  
  try {
    // Update job status to processing
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'processing', startedAt: new Date() },
    });
    
    // Get the document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });
    
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }
    
    if (!document.content) {
      throw new Error(`Document has no content: ${documentId}`);
    }
    
    // Chunk the document
    const chunks = chunkText(document.content, {
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    console.log(`Created ${chunks.length} chunks for document ${documentId}`);
    
    // Generate embeddings for all chunks
    const embeddings = await Promise.all(
      chunks.map(async (chunk: string) => {
        const result = await generateEmbedding(chunk);
        return { content: chunk, embedding: result.embedding };
      })
    );
    
    // Store chunks in database
    const chunkRecords = await Promise.all(
      embeddings.map((emb: { content: string; embedding: number[] }, index: number) =>
        prisma.documentChunk.create({
          data: {
            tenantId,
            documentId,
            content: emb.content,
            chunkIndex: index,
            embedding: JSON.stringify(emb.embedding),
            metadata: JSON.stringify({ chunkIndex: index, traceId }),
          },
        })
      )
    );
    
    console.log(`Stored ${chunkRecords.length} chunks in database`);
    
    // Try to store in Pinecone (vector DB)
    try {
      const pineconeClient = createPineconeClient();
      await pineconeClient.addVectors(
        chunkRecords.map((chunk: any, index: number) => {
          const embedding = embeddings[index]!;
          return {
            id: chunk.id,
            content: chunk.content,
            embedding: embedding.embedding,
            documentId: document.id,
            documentTitle: document.title,
            tenantId,
          };
        })
      );
      console.log('Stored vectors in Pinecone');
    } catch (error) {
      console.log('Pinecone not available, vectors stored in DB only');
    }
    
    // Update document status
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'completed',
        chunkCount: chunks.length,
      },
    });
    
    // Update job status
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
        result: JSON.stringify({ chunkCount: chunks.length, traceId }),
      },
    });
    
    console.log(`Document job ${jobId} completed successfully (traceId: ${traceId})`);
  } catch (error) {
    console.error(`Document job ${jobId} failed:`, error);
    
    // Update job with error
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      },
    });
    
    // Update document status
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'failed' },
    });
  }
}

/**
 * Main worker function
 */
async function main() {
  console.log('Worker started, processing jobs...');
  
  // Get the document processing queue (for future use)
  void getDocumentProcessingQueue();
  
  // Create a worker to process document jobs
  const worker = createWorker(
    'document-processing',
    async (job: any) => {
      console.log(`Processing job: ${job.id}`);
      await processDocumentJob(job.id ?? 'unknown', job.data);
    }
  );
  
  worker.on('completed', (job: any) => {
    console.log(`Job ${job.id} completed`);
  });
  
  worker.on('failed', (job: any, err: Error) => {
    if (job) {
      console.error(`Job ${job.id} failed:`, err.message);
    } else {
      console.error('Job failed:', err.message);
    }
  });
  
  console.log('Worker is listening for jobs...');
  
  // Handle graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down...`);
    await worker.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch(console.error);

