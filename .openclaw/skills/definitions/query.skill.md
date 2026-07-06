---
name: Query Skill
id: query-v1
version: 1.0.0
category: search
---

# Query Skill

## Description

Performs semantic, keyword, or hybrid search over documents. Returns ranked results with scores and metadata.

## Capabilities

- **Semantic Search**: Vector similarity search
- **Keyword Search**: BM25 or full-text search
- **Hybrid Search**: Combines both with weighted fusion
- **Filtering**: Apply metadata filters
- **Scoring**: Return relevance scores

## Input Schema

```typescript
{
  query: string;              // Search query
  topK?: number;              // Number of results (default: 10)
  filters?: Record<string, any>; // Metadata filters
  searchType?: 'vector' | 'keyword' | 'hybrid'; // (default: hybrid)
  includeScores?: boolean;    // Include scores (default: true)
}
```

## Output Schema

```typescript
{
  results: {
    id: string;
    text: string;
    score: number;
    metadata: any;
    documentId?: string;
  }[];
  total: number;
  searchType: string;
  filters: any;
}
```

## Configuration

```yaml
query:
  defaultTopK: 10
  hybridWeight: { vector: 0.6, keyword: 0.4 }
  rerank: true
  rerankModel: cross-encoder/ms-marco-MiniLM-L-6-v2
```

## Examples

### Hybrid Search

```bash
curl -X POST /api/openclaw/skills \
  -H "Content-Type: application/json" \
  -d '{
    "skillId": "query-v1",
    "input": {
      "query": "artificial intelligence",
      "topK": 20,
      "searchType": "hybrid",
      "filters": { "tenantId": "tenant-123" }
    }
  }'
```

### Keyword-Only Search

```typescript
const result = await skillRegistry.execute('query-v1', {
  query: 'machine learning algorithms',
  searchType: 'keyword',
  topK: 5
});
```

## Performance Metrics

| Metric | Target |
|--------|--------|
| Latency (p95) | < 200ms |
| Recall | > 90% |
| Throughput | 500 queries/min |

## Dependencies

- Vector Database (Weaviate)
- Embedding Skill (for vector search)
- Search Index (BM25)

## Evaluation

- **Benchmark**: `query-benchmark-v1`
- **Tests**: 1000+ queries with relevance judgments
- **Metrics**: NDCG@10, MRR, latency
