# OpenClaw Multi-Agent System

OpenClaw is a powerful multi-agent system integrated with Matjenin for AI-powered document processing, embedding generation, and RAG workflows.

## Quick Start

```bash
# Setup
npm run openclaw:setup

# Start Worker
npm run openclaw:worker

# Test System
npm run openclaw:test

# Check Status
npm run openclaw:status
```

## API Endpoints

### GET /api/openclaw
Get system status

### POST /api/openclaw
Execute actions: enqueue, enqueue-batch, enqueue-bulk, workflow, clean, pause, resume, agents, workflows

## Workflows

- **Document Processing** - Chunks, embeds, and indexes documents
- **RAG Query** - Executes retrieval-augmented generation
- **Batch Processing** - Processes multiple documents in parallel

## Configuration

Edit `.openclaw/config/default.json` for configuration options.

