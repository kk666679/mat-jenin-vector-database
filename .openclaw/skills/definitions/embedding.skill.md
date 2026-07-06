---
name: Embedding Skill
id: embedding-v1
version: 1.0.0
category: embedding
---

# Embedding Skill

## Description

Generates high-quality vector embeddings from text using transformer models. Supports both single and batch processing.

## Capabilities

- **Single Embedding**: Generate a vector for a single text
- **Batch Embedding**: Generate vectors for multiple texts efficiently
- **Model Selection**: Choose from multiple embedding models
- **Normalization**: Optional L2 normalization
- **Caching**: Cache embeddings for repeated texts

## Input Schema

```typescript
{
  text?: string;              // Text to embed (single)
  texts?: string[];           // Texts to embed (batch)
  model?: string;             // Model name (default: 'Xenova/all-MiniLM-L6-v2')
  batch?: boolean;            // Use batch processing
  normalize?: boolean;        // Normalize vectors (default: true)
}
```

## Output Schema

```typescript
{
  vector?: number[];          // Single embedding vector
  vectors?: number[][];       // Batch of embedding vectors
  dimensions: number;         // Vector dimension
  model: string;              // Model used
  duration: number;           // Processing time in ms
  count?: number;             // Number of vectors (batch)
}
```

## Configuration

```yaml
embedding:
  defaultModel: Xenova/all-MiniLM-L6-v2
  batchSize: 32
  cacheEnabled: true
  cacheTTL: 3600
```

## Examples

### Single Embedding

```bash
curl -X POST /api/openclaw/skills \
  -H "Content-Type: application/json" \
  -d '{
    "skillId": "embedding-v1",
    "input": {
      "text": "Artificial intelligence is transforming the world."
    }
  }'
```

### Batch Embedding

```typescript
const result = await skillRegistry.execute('embedding-v1', {
  texts: ['Text 1', 'Text 2', 'Text 3'],
  batch: true,
  model: 'Xenova/all-mpnet-base-v2'
});
// Returns { vectors: [...], dimensions: 768, model: '...', duration: 120 }
```

## Performance Metrics

| Metric | Target |
|--------|--------|
| Latency (single) | < 50ms |
| Throughput (batch) | 100 texts/s |
| Dimension | 384 (MiniLM) / 768 (MPNet) |
| Cache Hit Rate | > 80% |

## Dependencies

- ML Service (Transformers.js)
- TensorFlow.js backend

## Evaluation

- **Benchmark**: `embedding-benchmark-v1`
- **Tests**: Similarity accuracy, speed, dimension consistency
- **Metrics**: Cosine similarity correlation, latency
