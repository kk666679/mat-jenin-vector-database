import { Skill } from '../registry/skill.registry';
import { Logger } from '../../../sdk/shared/logger';

export function createDocumentSkill(logger: Logger): Skill {
  return {
    id: 'document-v1',
    name: 'Document Processing',
    version: '1.0.0',
    description: 'Process documents for RAG and search',
    category: 'document',
    capabilities: ['chunking', 'parsing', 'indexing'],
    config: {
      chunkSize: 512,
      overlap: 50,
      supportedFormats: ['text/plain', 'application/pdf', 'text/markdown']
    },
    estimatedCost: 0.005,

    validate: (input: any) => {
      return input && typeof input.content === 'string';
    },

    execute: async (input: any, context: any) => {
      const { content, chunkSize = 512, overlap = 50, metadata = {} } = input;

      // Chunk text
      const chunks = chunkText(content, chunkSize, overlap);
      
      // Process chunks
      const processedChunks = chunks.map((chunk, index) => ({
        index,
        text: chunk,
        metadata: {
          ...metadata,
          chunkIndex: index,
          totalChunks: chunks.length,
          timestamp: new Date().toISOString()
        }
      }));

      return {
        chunks: processedChunks,
        totalChunks: chunks.length,
        status: 'processed',
        metadata
      };
    }
  };
}

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
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
