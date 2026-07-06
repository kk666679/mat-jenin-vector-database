---
name: Storage Skill
id: storage-v1
version: 1.0.0
category: storage
---

# Storage Skill

## Description

Handles file storage operations using Vercel Blob Storage.

## Capabilities

- **Upload**: Store files securely
- **Download**: Retrieve files
- **Delete**: Remove files
- **List**: Enumerate files by prefix
- **Metadata**: Manage file metadata

## Input Schema

```typescript
{
  action: 'upload' | 'download' | 'delete' | 'list' | 'metadata';
  path?: string;
  data?: Buffer | string;
  metadata?: Record<string, string>;
  prefix?: string;
}
```

## Output Schema

```typescript
{
  success: boolean;
  data?: {
    url: string;
    path: string;
    size: number;
    metadata: Record<string, string>;
  };
  error?: string;
}
```

## Configuration

```yaml
storage:
  token: ${BLOB_READ_WRITE_TOKEN}
  prefix: openclaw
  publicAccess: false
  cacheControl: public, max-age=31536000, immutable
```

## Examples

### Upload a File

```bash
curl -X POST /api/openclaw/skills \
  -H "Content-Type: application/json" \
  -d '{
    "skillId": "storage-v1",
    "input": {
      "action": "upload",
      "path": "documents/doc-123/content",
      "data": "file content here",
      "metadata": { "documentId": "doc-123" }
    }
  }'
```

### List Files

```typescript
const result = await skillRegistry.execute('storage-v1', {
  action: 'list',
  prefix: 'documents/doc-123/'
});
```

## Performance Metrics

| Metric | Target |
|--------|--------|
| Upload Latency (p95) | < 500ms |
| Download Latency (p95) | < 300ms |
| Throughput | 1000 ops/min |

## Dependencies

- Vercel Blob Storage
- @vercel/blob package

## Evaluation

- **Benchmark**: `storage-benchmark-v1`
- **Tests**: Upload, download, delete, list
- **Metrics**: Latency, success rate, throughput
