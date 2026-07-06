---
name: RAG Skill
id: rag-v1
version: 1.0.0
category: rag
---

# RAG Skill

## Description

Performs Retrieval-Augmented Generation: retrieves relevant document chunks and generates answers using an LLM.

## Capabilities

- **Hybrid Retrieval**: Combines vector and keyword search
- **Reranking**: Cross-encoder reranking for improved relevance
- **Source Citation**: Returns references to source documents
- **Reasoning**: Provides reasoning traces for transparency
- **Multi-Provider**: Works with any LLM provider

## Input Schema

```typescript
{
  query: string;              // User question
  topK?: number;              // Number of chunks to retrieve (default: 10)
  rerank?: boolean;           // Apply reranking (default: true)
  hybridSearch?: boolean;     // Use hybrid search (default: true)
  includeSources?: boolean;   // Include source citations (default: true)
  includeReasoning?: boolean; // Include reasoning trace (default: true)
  context?: string;           // Additional context (optional)
}
```

## Output Schema

```typescript
{
  answer: string;             // Generated answer
  sources?: {                 // Source documents
    id: string;
    text: string;
    score: number;
    metadata: any;
  }[];
  reasoning?: {               // Reasoning trace
    matchedChunks: number;
    topMatchScore: number;
    totalDocuments: number;
    searchMethod: string;
  };
  metadata: {
    totalMatches: number;
    topScore: number;
    hybridSearch: boolean;
    rerank: boolean;
  };
}
```

## Configuration

```yaml
rag:
  topK: 10
  rerank: true
  hybridSearch: true
  includeSources: true
  includeReasoning: true
  rerankModel: cross-encoder/ms-marco-MiniLM-L-6-v2
```

## Examples

### Basic Query

```bash
curl -X POST /api/openclaw/skills \
  -H "Content-Type: application/json" \
  -d '{
    "skillId": "rag-v1",
    "input": {
      "query": "What are the benefits of AI?",
      "topK": 5,
      "includeSources": true
    }
  }'
```

### Advanced Query with Hybrid Search

```typescript
const result = await skillRegistry.execute('rag-v1', {
  query: 'How does machine learning work?',
  topK: 15,
  rerank: true,
  hybridSearch: true,
  includeReasoning: true,
  context: 'Only consider documents from 2024 onwards'
});
```

## Performance Metrics

| Metric | Target |
|--------|--------|
| Latency (p95) | < 2s |
| Answer Accuracy | > 90% |
| Source Relevance | > 85% |
| Throughput | 30 queries/min |

## Dependencies

- Embedding Skill
- Search Skill
- LLM Service
- Vector Database (Weaviate)

## Evaluation

- **Benchmark**: `rag-benchmark-v1`
- **Tests**: 50+ QA pairs, multi-hop questions
- **Metrics**: Accuracy, faithfulness, source quality
