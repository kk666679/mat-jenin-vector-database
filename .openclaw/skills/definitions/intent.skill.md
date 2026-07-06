---
name: Intent Skill
id: intent-v1
version: 1.0.0
category: nlp
---

# Intent Skill

## Description

Detects intent and extracts entities from natural language text using machine learning models.

## Capabilities

- **Intent Detection**: Classify user intent into predefined categories
- **Entity Extraction**: Extract entities like fileType, topic, query, etc.
- **Confidence Scoring**: Provide confidence level for predictions
- **Routing**: Route to appropriate handlers based on intent
- **Training**: Fine-tune model with custom data

## Input Schema

```typescript
{
  text: string;               // Natural language input
  action: 'detect' | 'train' | 'route';
  trainingData?: TrainingData[]; // For training
  context?: Record<string, any>; // Additional context for routing
}
```

## Output Schema

```typescript
{
  intent: string;             // Detected intent
  confidence: number;         // Confidence score (0-1)
  entities: Record<string, any>; // Extracted entities
  routed?: boolean;           // Whether routing was performed
  result?: any;               // Routing result
}
```

## Configuration

```yaml
intent:
  enabled: true
  confidenceThreshold: 0.7
  modelPath: .openclaw/intent/models
  trainingDataPath: .openclaw/intent/training
  maxEntities: 10
  cacheEnabled: true
```

## Examples

### Detect Intent

```bash
curl -X POST /api/openclaw/skills \
  -H "Content-Type: application/json" \
  -d '{
    "skillId": "intent-v1",
    "input": {
      "text": "Upload a PDF document for processing",
      "action": "detect"
    }
  }'
```

### Route Intent

```typescript
const result = await skillRegistry.execute('intent-v1', {
  text: 'What does the document say about AI?',
  action: 'route',
  context: { tenantId: 'tenant-123' }
});
// Returns { routed: true, handler: 'rag_query', result: { ... } }
```

## Performance Metrics

| Metric | Target |
|--------|--------|
| Intent Accuracy | > 95% |
| Entity Extraction F1 | > 90% |
| Latency | < 50ms |
| Confidence Calibration | Well-calibrated |

## Dependencies

- @tanstack/intent library
- Training data
- Model persistence

## Evaluation

- **Benchmark**: `intent-benchmark-v1`
- **Tests**: 200+ utterances, 12 intent classes
- **Metrics**: Accuracy, F1, confidence calibration
