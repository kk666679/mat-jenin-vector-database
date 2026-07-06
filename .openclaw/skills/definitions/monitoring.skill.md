---
name: Monitoring Skill
id: monitor-v1
version: 1.0.0
category: monitoring
---

# Monitoring Skill

## Description

Collects, aggregates, and reports metrics, logs, and health checks for the system.

## Capabilities

- **Metrics Collection**: Gather performance metrics from agents and services
- **Health Checks**: Verify system component health
- **Alerting**: Trigger alerts based on thresholds
- **Reporting**: Generate reports for dashboards
- **Tracing**: Capture traces for debugging

## Input Schema

```typescript
{
  action: 'collect' | 'health' | 'report' | 'alert';
  metrics?: string[];           // Metric names to collect
  timeRange?: { start: Date; end: Date; };
  thresholds?: Record<string, number>;
  filters?: Record<string, any>;
}
```

## Output Schema

```typescript
{
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  checks: HealthCheckResult[];
  metrics: Record<string, any>;
  alerts: Alert[];
}
```

## Configuration

```yaml
monitoring:
  enabled: true
  metricsInterval: 60000
  alertThresholds:
    errorRate: 0.1
    queueLength: 1000
    responseTime: 5000
```

## Examples

### Check System Health

```bash
curl -X POST /api/openclaw/skills \
  -H "Content-Type: application/json" \
  -d '{
    "skillId": "monitor-v1",
    "input": {
      "action": "health"
    }
  }'
```

### Collect Metrics

```typescript
const result = await skillRegistry.execute('monitor-v1', {
  action: 'collect',
  metrics: ['task_duration', 'queue_length', 'error_rate'],
  timeRange: { start: new Date('2026-07-01'), end: new Date() }
});
```

## Performance Metrics

| Metric | Target |
|--------|--------|
| Collection Overhead | < 1% CPU |
| Report Generation | < 1s |
| Alert Latency | < 10s |

## Dependencies

- Metrics Collector
- Health Checkers
- Alert Manager

## Evaluation

- **Benchmark**: `monitoring-benchmark-v1`
- **Tests**: 20+ monitoring scenarios
- **Metrics**: Accuracy, overhead, latency
