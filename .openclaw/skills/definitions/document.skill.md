---
name: Document Skill
id: document-v1
version: 1.0.0
category: document
---

# Document Skill

## Description

Processes documents for indexing: chunks content, extracts metadata, and generates embeddings.

## Capabilities

- **Chunking**: Split documents into manageable chunks with overlap
- **Parsing**: Supports multiple formats (PDF, DOCX, TXT, HTML, Markdown)
- **Metadata Extraction**: Auto-extract title, author, date, etc.
- **Embedding Generation**: Produce embeddings for each chunk
- **Indexing**: Store chunks and vectors in the vector database

## Input Schema

```typescript
{
  action: 'process' | 'chunk' | 'embed' | 'index' | 'summarize';
  content?: string;           // Document content (required for processing)
  metadata?: Record<string, any>; // Additional metadata
  chunkSize?: number;         // Chunk size in characters (default: 512)
  overlap?: number;           // Overlap between chunks (default: 50)
  documentId?: string;        // Optional document ID
}
```

## Output Schema

```typescript
{
  documentId: string;
  totalChunks: number;
  chunks: {
    chunkIndex: number;
    text: string;
    vector: number[];
    metadata: any;
  }[];
  status: 'COMPLETED' | 'FAILED';
  vectorCount?: number;
  dimension?: number;
}
```

## Configuration

```yaml
document:
  chunkSize: 512
  overlap: 50
  supportedFormats: [txt, pdf, docx, md, html]
  embeddingModel: Xenova/all-MiniLM-L6-v2
```

## Examples

### Process a Document

```bash
curl -X POST /api/openclaw/skills \
  -H "Content-Type: application/json" \
  -d '{
    "skillId": "document-v1",
    "input": {
      "action": "process",
      "content": "Your document text here...",
      "metadata": {
        "filename": "example.txt",
        "author": "John Doe"
      },
      "chunkSize": 512,
      "overlap": 50
    }
  }'
```

### Summarize a Document

```typescript
const result = await skillRegistry.execute('document-v1', {
  action: 'summarize',
  content: longText,
  metadata: { filename: 'report.pdf' }
});
```

## Performance Metrics

| Metric | Target |
|--------|--------|
| Processing Speed | 1MB/s |
| Chunk Quality | > 90% |
| Embedding Accuracy | > 95% |
| Throughput | 100 docs/hour |

## Dependencies

- Embedding Skill
- ML Service
- Vector Database (Weaviate)
- Storage (Vercel Blob)

## Evaluation

- **Benchmark**: `document-benchmark-v1`
- **Tests**: 20+ document types, various sizes
- **Metrics**: Chunk coherence, embedding quality
