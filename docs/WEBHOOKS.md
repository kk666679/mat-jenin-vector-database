# Webhook System Documentation

## Overview
Matjenin webhook system allows you to receive real-time notifications when events occur in your account.

## Configuration

### Domain
- **Production Domain**: `https://matjenin.space`
- **Callback URL**: `https://matjenin.space/api/webhook/callback`

### DNS Records (Vercel)
```
Type: ALIAS
Name: *
Value: cname.vercel-dns-017.com
TTL: 60

Type: ALIAS
Name: @
Value: cname.vercel-dns-017.com
TTL: 60

Type: CAA
Value: 0 issue "letsencrypt.org"
TTL: 60
```

### SSL Certificates
- Auto-renewed by Vercel
- Covers: `*.matjenin.space` and `matjenin.space`
- Expiration: May 18, 202

## Webhook Events

| Event | Description |
|-------|-------------|
| `document.created` | Triggered when a document is uploaded |
| `document.processed` | Triggered when document processing completes |
| `document.failed` | Triggered when document processing fails |
| `document.deleted` | Triggered when a document is deleted |
| `query.completed` | Triggered when a RAG query completes |
| `conversation.created` | Triggered when a new conversation starts |

## Creating a Webhook

### Via API (tRPC)
```typescript
const webhook = await trpc.webhook.create.mutate({
  name: "My Webhook",
  url: "https://your-domain.com/webhook",
  events: ["document.processed", "query.completed"],
  secret: "your-secret-key", // optional
  headers: { // optional
    "Authorization": "Bearer token"
  }
});
```

### Via UI
1. Navigate to `/webhooks`
2. Click "Create Webhook"
3. Fill in the form:
   - Name: Descriptive name for your webhook
   - URL: Your endpoint URL
   - Events: Select events to subscribe to
4. Click "Create"

## Webhook Payload

All webhooks receive a JSON payload with this structure:

```json
{
  "event": "document.processed",
  "tenantId": "tenant-uuid",
  "timestamp": "2026-02-18T10:30:00Z",
  "data": {
    "documentId": "doc-uuid",
    "title": "My Document",
    "status": "completed",
    "chunkCount": 42,
    "processedAt": "2026-02-18T10:30:00Z"
  }
}
```

## Security

### Signature Verification
Each webhook includes an `X-Webhook-Signature` header with HMAC-SHA256 signature:

```typescript
import crypto from 'crypto';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}
```

### Headers
```
Content-Type: application/json
User-Agent: Matjenin-Webhook/1.0
X-Webhook-Signature: <hmac-sha256-signature>
X-Webhook-Event: <event-type>
X-Webhook-Delivery: <delivery-uuid>
```

## Retry Policy

- **Max Attempts**: 3
- **Backoff**: Exponential (1min, 2min, 4min)
- **Timeout**: 30 seconds per request

Failed deliveries are automatically retried with exponential backoff.

## Testing Your Webhook

### Test Endpoint
```bash
curl https://matjenin.space/api/webhook/callback
```

Response:
```json
{
  "service": "Matjenin Webhook Callback",
  "domain": "https://matjenin.space",
  "status": "active"
}
```

### Trigger Test Event
```typescript
await trpc.webhook.retry.mutate({
  deliveryId: "delivery-uuid"
});
```

## Monitoring

### View Deliveries
```typescript
const deliveries = await trpc.webhook.deliveries.query({
  webhookId: "webhook-uuid", // optional
  status: "failed", // optional: pending, success, failed
  limit: 50
});
```

### Delivery Status
- `pending`: Queued for delivery
- `success`: Successfully delivered
- `failed`: All retry attempts exhausted

## Best Practices

1. **Idempotency**: Handle duplicate deliveries gracefully
2. **Fast Response**: Return 200 OK quickly, process asynchronously
3. **Verify Signatures**: Always verify webhook signatures
4. **Monitor Failures**: Set up alerts for failed deliveries
5. **Use HTTPS**: Only use HTTPS endpoints
6. **Handle Retries**: Expect and handle retry attempts

## Example Implementation

```typescript
// Your webhook endpoint
export async function POST(req: Request) {
  const signature = req.headers.get('x-webhook-signature');
  const body = await req.text();
  
  // Verify signature
  if (!verifySignature(body, signature, process.env.WEBHOOK_SECRET)) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  const payload = JSON.parse(body);
  
  // Process webhook asynchronously
  processWebhookAsync(payload);
  
  // Return success immediately
  return new Response('OK', { status: 200 });
}
```

## Troubleshooting

### Webhook Not Firing
- Check webhook is active: `isActive: true`
- Verify event subscription includes the event
- Check tenant ID matches

### Signature Verification Fails
- Ensure secret matches on both sides
- Verify payload is not modified before verification
- Check signature header is present

### Timeouts
- Ensure endpoint responds within 30 seconds
- Process heavy tasks asynchronously
- Return 200 OK immediately

## API Reference

### Create Webhook
```typescript
trpc.webhook.create.mutate({
  name: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  headers?: Record<string, string>;
})
```

### List Webhooks
```typescript
trpc.webhook.list.query()
```

### Update Webhook
```typescript
trpc.webhook.update.mutate({
  id: string;
  name?: string;
  url?: string;
  events?: string[];
  isActive?: boolean;
  headers?: Record<string, string>;
})
```

### Delete Webhook
```typescript
trpc.webhook.delete.mutate({ id: string })
```

### View Deliveries
```typescript
trpc.webhook.deliveries.query({
  webhookId?: string;
  status?: 'pending' | 'success' | 'failed';
  limit?: number;
})
```

### Retry Delivery
```typescript
trpc.webhook.retry.mutate({ deliveryId: string })
```
