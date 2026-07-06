---
name: Search Skill
id: search-v1
version: 1.0.0
category: search
---

# Search Skill

## Description

Unified search interface supporting vector, keyword, and hybrid search across documents.

## Capabilities

- **Multi-modal Search**: Vector, keyword, hybrid
- **Filtering**: Apply filters on metadata
- **Re-ranking**: Cross-encoder reranking
- **Pagination**: Cursor-based pagination

## Input Schema

```typescript
{
  query: string;
  topK?: number;
  filters?: Record<string, any>;
  searchType?: 'vector' | 'keyword' | 'hybrid';
  rerank?: boolean;
  cursor?: string;
}
```

## Output Schema

```typescript
{
  results: SearchResult[];
  total: number;
  cursor?: string;
  searchType: string;
}
```

## Configuration

```yaml
search:
  defaultTopK: 10
  hybridWeight: { vector: 0.6, keyword: 0.4 }
  rerankModel: cross-encoder/ms-marco-MiniLM-L-6-v2
```

## Examples

### Hybrid Search

```bash
curl -X POST /api/openclaw/skills \
  -H "Content-Type: application/json" \
  -d '{
    "skillId": "search-v1",
    "input": {
      "query": "artificial intelligence",
      "topK": 20,
      "searchType": "hybrid",
      "rerank": true
    }
  }'
```

### Vector-Only Search

```typescript
const result = await skillRegistry.execute('search-v1', {
  query: 'machine learning',
  searchType: 'vector',
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
- Embedding Skill
- Search Index (BM25)

## Evaluation

- **Benchmark**: `search-benchmark-v1`
- **Tests**: 1000+ queries with relevance judgments
- **Metrics**: NDCG@10, MRR, latency
