/**
 * Query API with AI SDK Streaming Support
 * Uses Vercel AI SDK for better streaming and provider support
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/sdk/db';
import { createPineconeClient, generateEmbedding } from '@/sdk/vector';
import { streamTextAI, getDefaultProvider } from '@/sdk/llm/ai-sdk';

// Explicitly declare runtime as Node.js (required for Pinecone and LLM SDK)
export const runtime = 'nodejs';

// Get prisma client instance
const prisma = getPrismaClient();

/**
 * POST /api/query/stream
 * Streaming RAG query using AI SDK
 */
export async function POST(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id') || 'default-tenant';
  const body = await request.json();
  const query = body.query;
  const provider = body.provider;
  const model = body.model;

  if (!query) {
    return NextResponse.json(
      { success: false, error: 'Query is required' },
      { status: 400 }
    );
  }

  try {
    // Generate embedding for the query
    await generateEmbedding(query);
    const pineconeClient = createPineconeClient();
    
    let searchResults: any[] = [];
    
    // Try Pinecone first, fall back to database
    try {
      const pineconeResults = await pineconeClient.search({
        tenantId,
        query,
        topK: 5,
      });
      searchResults = pineconeResults;
    } catch {
      console.log('Pinecone not available, falling back to database');
      
      const chunks = await prisma.documentChunk.findMany({
        where: { tenantId },
        take: 10,
      });
      
      const queryLower = query.toLowerCase();
      const matchedChunks = chunks
        .map((chunk: any) => ({
          id: chunk.id,
          content: chunk.content,
          score: chunk.content.toLowerCase().includes(queryLower) ? 1 : 0,
          documentId: chunk.documentId,
          documentTitle: 'Document',
        }))
        .filter((c: any) => c.score > 0)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 5);
      
      const documentIds = [...new Set(matchedChunks.map((c: any) => c.documentId))];
      const documents = await prisma.document.findMany({
        where: { id: { in: documentIds } },
      });
      const docMap = new Map(documents.map((d: any) => [d.id, d.title]));
      
      searchResults = matchedChunks.map((c: any) => ({
        ...c,
        documentTitle: docMap.get(c.documentId) || 'Unknown',
      }));
    }

    if (searchResults.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          answer: "I couldn't find relevant info in your documents. Try uploading more documents first.",
          sources: [],
        },
      });
    }

    // Use AI SDK for streaming
    const selectedProvider = provider || getDefaultProvider();
    const limitedContext = searchResults.slice(0, 5);
    
    const contextStr = limitedContext
      .map((item: any, i: number) => `[Document ${i + 1}: ${item.documentTitle}]\n${item.content}`)
      .join('\n\n---\n\n');

    const prompt = `Context from documents:
${contextStr}

Question: ${query}

Based on the context above, please provide a helpful answer. Cite the document titles when you use information from them.`;

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullAnswer = '';
        
        try {
          const generator = await streamTextAI({
            prompt,
            provider: selectedProvider as 'openai' | 'anthropic' | 'google',
            model,
            onChunk: (chunk: string) => {
              fullAnswer += chunk;
              // Send each chunk as SSE
              const data = JSON.stringify({ 
                type: 'chunk', 
                content: chunk,
                done: false 
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            },
          });

          // Consume the generator
          for await (const _ of generator) {
            // Chunks already sent via onChunk
          }

          // Send final message with sources
          const finalData = JSON.stringify({
            type: 'done',
            content: fullAnswer,
            sources: limitedContext.map((s: any) => ({
              documentTitle: s.documentTitle,
              chunkContent: s.content,
              score: s.score,
            })),
          });
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const data = JSON.stringify({ 
            type: 'error', 
            error: errorMessage 
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('RAG stream failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process query' },
      { status: 500 }
    );
  }
}

