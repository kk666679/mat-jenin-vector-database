---
name: Validation Skill
id: validate-v1
version: 1.0.0
category: quality
---

# Validation Skill

## Description

Validates data against schemas, rules, and constraints. Ensures data quality before processing.

## Capabilities

- **Schema Validation**: Validate against JSON Schema or Zod schemas
- **Data Quality Checks**: Check for missing fields, types, formats
- **Business Rules**: Apply custom business rules
- **Error Reporting**: Detailed error messages

## Input Schema

```typescript
{
  data: any;                  // Data to validate
  schema: any;                // JSON Schema or Zod schema
  rules?: ValidationRule[];   // Custom validation rules
  strict?: boolean;           // Strict mode (default: true)
}
```

## Output Schema

```typescript
{
  valid: boolean;
  errors?: string[];          // List of validation errors
  warnings?: string[];        // Validation warnings
  metadata?: any;             // Additional info
}
```

## Configuration

```yaml
validation:
  strict: true
  schemas:
    - .openclaw/validation/agent.validator.ts
    - .openclaw/validation/workflow.validator.ts
  rules:
    - no_empty_strings
    - no_undefined_values
    - validate_tenant_ids
```

## Examples

### Validate Agent Task

```bash
curl -X POST /api/openclaw/skills \
  -H "Content-Type: application/json" \
  -d '{
    "skillId": "validate-v1",
    "input": {
      "data": {
        "id": "task-1",
        "type": "embed-text",
        "payload": { "text": "Hello" }
      },
      "schema": {
        "type": "object",
        "required": ["id", "type", "payload"]
      }
    }
  }'
```

### Validate Workflow

```typescript
const result = await skillRegistry.execute('validate-v1', {
  data: workflowDefinition,
  schema: workflowSchema,
  rules: [
    (data) => data.steps.length > 0 || 'Workflow must have at least one step'
  ]
});
```

## Performance Metrics

| Metric | Target |
|--------|--------|
| Validation Speed | < 10ms |
| Error Detection Rate | > 99% |
| False Positive Rate | < 1% |

## Dependencies

- Zod library
- JSON Schema validators

## Evaluation

- **Benchmark**: `validation-benchmark-v1`
- **Tests**: 100+ validation scenarios
- **Metrics**: Accuracy, speed, coverage
