import type { Logger } from 'pino';
import { BaseAgent, type AgentResult, type AgentTask } from '../core';
import { getPrismaClient } from '../../db/prisma';
import { chunkText, generateEmbedding } from '../../vector';
import { createPineconeClient } from '../../vector/pinecone';

export interface DocumentProcessingAgentPayload {
  documentId: string;
  // Optional override
  chunkSize?: number;
  chunkOverlap?: number;
  titleOverride?: string;
}

export class DocumentProcessingAgent extends BaseAgent<
  DocumentProcessingAgentPayload,
  {
    documentId: string;
    chunkCount: number;
  }
> {
  constructor(logger: Logger) {
    super('DocumentProcessingAgent', logger);
    this.capabilities = [
      {
        name: 'process-document',
        description: 'Chunk a document, embed chunks, and store in DB + (optionally) Pinecone',
      },
    ];
  }

  canHandle(task: AgentTask): boolean {
    return task.type === 'process-document';
  }

  async execute(task: AgentTask<DocumentProcessingAgentPayload>): Promise<AgentResult<any>> {
    const {
      documentId,
      chunkSize = 1000,
      chunkOverlap = 200,
    } = task.payload;

    return this.withMetrics('process-document', async () => {
      const prisma = getPrismaClient();

      try {
        const document = await prisma.document.findUnique({
          where: { id: documentId },
        });
        if (!document) {
          throw new Error(`Document not found: ${documentId}`);
        }
        if (!document.content) {
          throw new Error(`Document has no content: ${documentId}`);
        }

        const chunks = chunkText(document.content, {
          chunkSize,
          chunkOverlap,
        });

        // Embed all chunks
        const embeddings = await Promise.all(
          chunks.map(async (chunk) => {
            const result = await generateEmbedding(chunk);
            return { content: chunk, embedding: result.embedding };
          })
        );

        // Store chunks in DB
        await prisma.documentChunk.deleteMany({
          where: {
            documentId,
            tenantId: task.context.tenantId,
          },
        });

        await Promise.all(
          embeddings.map((emb, index) =>
            prisma.documentChunk.create({
              data: {
                tenantId: task.context.tenantId,
                documentId,
                content: emb.content,
                chunkIndex: index,
                embedding: JSON.stringify(emb.embedding),
                metadata: JSON.stringify({
                  chunkIndex: index,
                  traceId: task.context.requestId,
                }),
              },
            })
          )
        );

        // Store vectors in Pinecone if configured
        try {
          const pineconeClient = createPineconeClient();
          await pineconeClient.addVectors(
            embeddings.map((emb, index) => {
              return {
                id: `${documentId}-chunk-${index}`,
                content: emb.content,
                embedding: emb.embedding,
                documentId,
                documentTitle: document.title || task.payload.titleOverride || 'Unknown',
                tenantId: task.context.tenantId,
              };
            })
          );
        } catch {
          // Pinecone optional
        }

        await prisma.document.update({
          where: { id: documentId },
          data: {
            status: 'completed',
            chunkCount: chunks.length,
          },
        });

        return {
          success: true,
          taskId: task.id,
          data: { documentId, chunkCount: chunks.length },
          metadata: {
            chunkSize,
            chunkOverlap,
          },
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

