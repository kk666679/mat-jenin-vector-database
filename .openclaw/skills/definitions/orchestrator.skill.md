---
name: Orchestrator Skill
id: orchestrator-v1
version: 1.0.0
category: orchestration
---

# Orchestrator Skill

## Description

The Orchestrator Skill enables complex multi-step workflows by coordinating other skills and agents. It supports parallel execution, dependency management, retries, and error handling.

## Capabilities

- **Workflow Orchestration**: Execute a sequence of steps with dependencies
- **Parallel Execution**: Run multiple tasks concurrently
- **Retry & Fallback**: Automatic retries with exponential backoff
- **Error Handling**: Graceful failure with configurable policies
- **Dynamic Routing**: Route tasks to appropriate agents based on intent

## Input Schema

```typescript
{
  workflowId?: string;      // Identifier of a registered workflow
  tasks?: AgentTask[];      // Array of tasks to execute
  context: AgentContext;    // Tenant, user, request context
  parameters?: Record<string, any>; // Workflow parameters
}
```

## Output Schema

```typescript
{
  success: boolean;
  data?: {
    workflowId: string;
    results: AgentResult[];
    completedSteps: number;
    totalSteps: number;
  };
  error?: string;
  metadata: {
    duration: number;
    timestamp: string;
  };
}
```

## Configuration

```yaml
orchestrator:
  maxConcurrentTasks: 10
  taskTimeout: 30000
  enableParallelExecution: true
  retryOnFailure: true
  maxRetries: 3
  backoffDelay: 1000
```

## Examples

### Execute a Predefined Workflow

```bash
curl -X POST /api/openclaw/skills \
  -H "Content-Type: application/json" \
  -d '{
    "skillId": "orchestrator-v1",
    "input": {
      "workflowId": "process-document",
      "context": { "tenantId": "tenant-123" },
      "parameters": { "documentId": "doc-456" }
    }
  }'
```

### Execute Ad-hoc Tasks

```typescript
const result = await skillRegistry.execute('orchestrator-v1', {
  tasks: [
    { type: 'embed-text', payload: { text: 'Hello' } },
    { type: 'rag-query', payload: { query: 'What is AI?' } }
  ],
  context: { tenantId: 'tenant-123', requestId: 'req-1' }
});
```

## Performance Metrics

| Metric | Target |
|--------|--------|
| Workflow Latency (p95) | < 5s |
| Task Throughput | 100/min |
| Success Rate | > 99% |
| Parallelism | 10 tasks |

## Dependencies

- Agent Registry
- Queue Service (BullMQ)
- Redis

## Evaluation

- **Benchmark**: `orchestration-benchmark-v1`
- **Tests**: 20+ workflow scenarios
- **Metrics**: Correctness, latency, error recovery
