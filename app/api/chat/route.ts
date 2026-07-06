import { NextRequest, NextResponse } from 'next/server';
import { ragService } from '@/sdk/services';
import { getDefaultProvider } from '@/sdk/llm/ai-sdk';

export const runtime = 'nodejs';

interface ChatRequestBody {
  query: string;
  provider?: 'openai' | 'anthropic' | 'google';
  model?: string;
  attachments?: Array<{
    filename: string;
    mediaType: string;
    url?: string;
    type: string;
  }>;
}

const encodeEvent = (payload: Record<string, unknown>) => {
  return `data: ${JSON.stringify(payload)}\n\n`;
};

export async function POST(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id') || 'default-tenant';

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body?.query || typeof body.query !== 'string') {
    return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
  }

  const provider = body.provider || getDefaultProvider();
  const model = body.model;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const sendChunk = (payload: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(encodeEvent(payload)));
      };

      try {
        const ragResponse = await ragService.search({
          tenantId,
          query: body.query,
          topK: 5,
        });

        if (!ragResponse.answer || ragResponse.sources.length === 0) {
          sendChunk({
            type: 'done',
            content: ragResponse.answer || 'No relevant documents found.',
            sources: [],
          });
          controller.close();
          return;
        }


        const contextSources = ragResponse.sources.map((source) => ({
          documentTitle: source.documentTitle,
          chunkContent: source.chunkContent,
          score: source.score,
        }));

        // Initial metadata event
        sendChunk({ type: 'metadata', provider, model, sources: contextSources });

        // ragService.search currently returns full text (non-token streaming)
        // so we emit a single SSE content event for compatibility.
        sendChunk({ type: 'content', content: ragResponse.answer });
        sendChunk({ type: 'sources', sources: contextSources });
        sendChunk({ type: 'done', content: ragResponse.answer, sources: contextSources });

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        sendChunk({ type: 'error', error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
