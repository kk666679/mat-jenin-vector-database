# @tanstack/intent Integration for OpenClaw

## Overview

This integration provides natural language understanding capabilities to the OpenClaw multi-agent system using `@tanstack/intent`.

## Features

- **Intent Detection**: Understand user intent from natural language
- **Entity Extraction**: Extract entities from user input
- **Intent Routing**: Route requests to appropriate handlers based on intent
- **Training Pipeline**: Train custom intent models
- **Evaluation**: Test intent accuracy with custom test suites
- **Confidence Scoring**: Measure confidence in intent predictions

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Input (Text)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Intent Agent                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Intent Service                           │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         @tanstack/intent Model                 │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Intent Routes                           │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  upload_document → Document Agent              │  │  │
│  │  │  rag_query      → RAG Agent                   │  │  │
│  │  │  chat           → Chat Agent                   │  │  │
│  │  │  system_status  → Monitoring Agent             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Intent Detection

```bash
# Detect intent from text
POST /api/openclaw/intent
{
  "text": "Upload a document for processing",
  "action": "detect"
}

# Route intent to handler
POST /api/openclaw/intent
{
  "text": "Search for documents about AI",
  "action": "route"
}
```

### Training

```bash
# Train the intent model
POST /api/openclaw/intent
{
  "action": "train",
  "trainingData": [
    { "text": "Upload a PDF", "intent": "upload_document" }
  ]
}

# Update the model
PUT /api/openclaw/intent
{
  "trainingData": [...] 
}
```

### Evaluation

```bash
# Run intent evaluation
POST /api/openclaw/intent/evaluate
{
  "suiteId": "document-intents"
}

# Get evaluation results
GET /api/openclaw/intent/evaluate?suiteId=document-intents
```

## Training Data Format

```typescript
interface TrainingData {
  text: string;
  intent: string;
  entities?: Record<string, any>;
}
```

## Example Usage

```typescript
// Detect intent
const response = await fetch('/api/openclaw/intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'What does the document say about AI?',
    action: 'detect'
  })
});

const result = await response.json();
// {
//   success: true,
//   data: {
//     intent: 'rag_query',
//     confidence: 0.95,
//     entities: { topic: 'AI' }
//   }
// }
```

## Adding New Intents

1. Add training data to `.openclaw/intent/training/training.data.ts`
2. Register a route handler in `.openclaw/intent/routes/index.ts`
3. Train the model with the new data
4. Test with the evaluation suite

## Evaluation Suites

Built-in test suites:
- `document-intents`: Document-related intents
- `rag-intents`: RAG-related intents
- `chat-intents`: Chat-related intents
- `system-intents`: System-related intents
