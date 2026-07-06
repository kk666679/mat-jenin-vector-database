# OpenClaw Skills & Evaluation System

## Skills

Skills are reusable capabilities that agents can use to perform specific tasks.

### Built-in Skills

1. **Embedding** (`embedding-v1`)
   - Generate text embeddings
   - Support for batch processing
   - Configurable models

2. **RAG** (`rag-v1`)
   - Retrieval-augmented generation
   - Configurable top-k and reranking
   - Source citation

3. **Document** (`document-v1`)
   - Document chunking
   - Text processing
   - Metadata extraction

### Creating a Skill

```typescript
export function createMySkill(logger: Logger): Skill {
  return {
    id: 'my-skill-v1',
    name: 'My Skill',
    version: '1.0.0',
    description: 'Description of my skill',
    category: 'custom',
    capabilities: ['capability1', 'capability2'],
    config: { /* config options */ },
    validate: (input) => { /* validation logic */ },
    execute: async (input, context) => { /* execution logic */ }
  };
}
```

## Evaluation

The evaluation system benchmarks skills against test suites.

### Benchmarks

1. **RAG Benchmark** - Tests RAG skills on accuracy and quality
2. **Embedding Benchmark** - Tests embedding quality and similarity

### Running Evaluations

```bash
# Evaluate a specific skill
curl -X POST http://localhost:3000/api/openclaw/evaluate \
  -H "Content-Type: application/json" \
  -d '{"skillId": "rag-v1", "benchmarkId": "rag-benchmark-v1"}'

# Evaluate all skills
curl -X POST http://localhost:3000/api/openclaw/evaluate \
  -H "Content-Type: application/json" \
  -d '{"benchmarkId": "rag-benchmark-v1"}'

# Get evaluation results
curl http://localhost:3000/api/openclaw/evaluate?skillId=rag-v1
```

## Metrics

Skills automatically track:
- Latency
- Success rate
- Throughput
- Input/Output sizes
- Error rates

## API Endpoints

### Skills
- `GET /api/openclaw/skills` - List all skills
- `POST /api/openclaw/skills` - Execute a skill

### Evaluation
- `GET /api/openclaw/evaluate` - Get evaluation results
- `POST /api/openclaw/evaluate` - Run evaluation
