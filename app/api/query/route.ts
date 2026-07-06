import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient, createPineconeClient, createRAGPipeline } from '@/sdk';

// Explicitly declare runtime as Node.js (required for Pinecone and LLM SDK)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'default-tenant';
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    const pineconeClient = createPineconeClient();
    
    let searchResults: any[] = [];
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
      const matchedChunks: Array<{id: string; content: string; score: number; documentId: string; documentTitle: string}> = chunks
        .map((chunk: { id: string; content: string; documentId: string }) => ({
          id: chunk.id,
          content: chunk.content,
          score: chunk.content.toLowerCase().includes(queryLower) ? 1 : 0,
          documentId: chunk.documentId,
          documentTitle: 'Document',
        }))
        .filter((c: { score: number }) => c.score > 0)
        .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
        .slice(0, 5);
      
      const documentIds = [...new Set(matchedChunks.map((c: { documentId: string }) => c.documentId))];
      const documents = await prisma.document.findMany({
        where: { id: { in: documentIds } },
      });
      const docMap = new Map(documents.map((d: { id: string; title: string }) => [d.id, d.title]));
      
      searchResults = matchedChunks.map((c: { id: string; content: string; score: number; documentId: string; documentTitle: string }) => ({
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

    const ragPipeline = createRAGPipeline();
    const ragResult = await ragPipeline.query({
      query,
      context: searchResults,
    });

    return NextResponse.json({
      success: true,
      data: {
        answer: ragResult.answer,
        sources: ragResult.sources.map(s => ({
          documentTitle: s.documentTitle,
          chunkContent: s.chunkContent,
          score: s.score,
        })),
      },
    });
  } catch (error) {
    console.error('RAG query failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process query' },
      { status: 500 }
    );
  }
}

