# Dashboard & Prisma Studio Core Integration Guide

## Overview

This document describes how the Dashboard integrates with Prisma Studio Core and provides technical instructions for developers.

## Dashboard Architecture

### Components Created

| Component | Path | Description |
|-----------|------|-------------|
| Dashboard Router | `server/trpc/routers/dashboard.ts` | tRPC API endpoints for stats |
| Dashboard Page | `app/dashboard/page.tsx` | Main dashboard UI |
| StatCard | `app/dashboard/components/StatCard.tsx` | KPI display component |
| DataTable | `app/dashboard/components/DataTable.tsx` | Reusable table with pagination |
| DashboardCharts | `app/dashboard/components/DashboardCharts.tsx` | Charts and visualizations |
| PrismaStudioEmbed | `app/dashboard/components/PrismaStudioEmbed.tsx` | Studio Core integration |

## Prisma Studio Core Integration

### Overview

The Dashboard includes integration with **Prisma Studio Core** (`@prisma/studio-core` package already installed). This provides:

- Embedded database management interface
- Full CRUD operations on all models
- Real-time data visualization

### Security Considerations

⚠️ **IMPORTANT**: Prisma Studio Core provides full database access. Follow these guidelines:

1. **Restrict Access**: Only allow admin users to access the studio
2. **Role-Based Access**: Use the `requireAdmin` prop to restrict access
3. **Audit Logging**: All operations are logged in `AuditLog` model
4. **Tenant Isolation**: Operations are scoped to the current tenant

### Component Usage

```tsx
import { PrismaStudioEmbed, StudioStatus, SecurityWarning } from './components/PrismaStudioEmbed';

// Basic usage
<PrismaStudioEmbed 
  userRole="admin"
  tenantId="your-tenant-id"
/>

// With admin-only restriction
<PrismaStudioEmbed 
  requireAdmin={true}
  userRole={userRole}
  tenantId={tenantId}
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `studioUrl` | string | No | Base URL for Studio (default: `/api/studio`) |
| `requireAdmin` | boolean | No | Restrict to admin users (default: `true`) |
| `userRole` | `'admin' \| 'member'` | No | Current user role |
| `tenantId` | string | No | Tenant ID for display |
| `onReady` | () => void | No | Callback when Studio loads |
| `onError` | (error: Error) => void | No | Error callback |

## Dashboard API (tRPC)

### Available Endpoints

#### `dashboard.stats`

Get overall dashboard statistics:

```typescript
const { data } = trpc.dashboard.stats.useQuery();

// Returns:
{
  tenant: { name, plan, limits },
  documents: { total, avgFileSize },
  users: { total },
  jobs: { total, pending, processing, completed, failed },
  sessions: { active },
  apiKeys: { active },
  conversations: { total },
  recentDocuments: [...],
  recentJobs: [...]
}
```

#### `dashboard.recentItems`

Get recent items from a model:

```typescript
const { data } = trpc.dashboard.recentItems.useQuery({
  model: 'document', // 'document' | 'user' | 'job' | 'session' | 'auditLog'
  limit: 10,
});
```

#### `dashboard.modelStats`

Get detailed stats for a model:

```typescript
const { data } = trpc.dashboard.modelStats.useQuery({
  model: 'document', // any model name
});
```

#### `dashboard.usageMetrics`

Get usage metrics over time:

```typescript
const { data } = trpc.dashboard.usageMetrics.useQuery({
  metricType: 'api_requests', // 'api_requests' | 'documents_processed' | 'tokens_used' | 'storage_mb'
  period: 'daily', // 'hourly' | 'daily' | 'monthly'
  days: 30,
});
```

#### `dashboard.health`

Check database health:

```typescript
const { data } = trpc.dashboard.health.useQuery();

// Returns:
{
  status: 'healthy' | 'unhealthy',
  database: 'connected' | 'disconnected',
  timestamp: string,
  error?: string
}
```

## Using with tRPC in Dashboard

### Setup

The dashboard is already configured to work with tRPC. To fetch real data:

```tsx
// In app/dashboard/page.tsx
import { trpc } from '@/lib/trpc/client';

export default function DashboardPage() {
  // Fetch stats
  const { data: stats, isLoading, refetch } = trpc.dashboard.stats.useQuery();
  
  // Fetch recent documents
  const { data: documents } = trpc.dashboard.recentItems.useQuery({
    model: 'document',
    limit: 10,
  });

  if (isLoading) return <Loading />;
  
  return (
    // Use stats and documents data
  );
}
```

### Updating Data

Use the `refetch` function to refresh data:

```tsx
const { refetch } = trpc.dashboard.stats.useQuery();

<Button onClick={() => refetch()}>
  <RefreshCwIcon className="h-4 w-4" />
  Refresh
</Button>
```

## Prisma Schema Compatibility

The Dashboard uses the same Prisma schema as Prisma Studio Core. All models in `sdk/db/prisma/schema.prisma` are available:

- `Tenant`, `User`, `Session`, `ApiKey`
- `Document`, `DocumentChunk`
- `Job`
- `RateLimitLog`, `AuditLog`, `UsageMetric`
- `Conversation`, `Message`

### Type Safety

All queries are fully type-safe thanks to tRPC:

```typescript
// TypeScript knows the exact shape of the response
const stats = trpc.dashboard.stats.useQuery();

// stats.data.documents.total is typed as number
// stats.data.recentDocuments is typed as Document[]

// Autocomplete works for all input fields
trpc.dashboard.recentItems.useQuery({ model: 'document' }) // ✓
trpc.dashboard.recentItems.useQuery({ model: 'invalid' })   // ✗ Type error!
```

## Migrations & Schema Updates

When updating the Prisma schema:

1. **Update Schema**: Modify `sdk/db/prisma/schema.prisma`
2. **Run Migration**: `npm run db:push` or `npx prisma migrate dev`
3. **Regenerate Client**: `npm run db:generate`
4. **Types Update**: tRPC types automatically update on next build

## Production Considerations

### Performance

- Dashboard queries use parallel execution for efficiency
- Tables support pagination (default: 10 items per page)
- Search is client-side for small datasets; server-side for large

### Caching

- tRPC caches queries by default (5 minute stale time)
- Use `refetchOnWindowFocus: false` to reduce unnecessary requests

### Security

- All dashboard endpoints require authentication (`protectedProcedure`)
- Tenant isolation is enforced at the database level
- Admin-only access to Prisma Studio

## Troubleshooting

### Dashboard Not Loading

1. Check database connection: `npm run db:push`
2. Verify tRPC is working: Visit `/api/trpc/health.check`
3. Check browser console for errors

### Prisma Studio Not Loading

1. Ensure `@prisma/studio-core` is installed
2. Check if Studio URL is correct
3. Verify user has admin role

### Type Errors

1. Run `npm run db:generate`
2. Restart development server
3. Clear `.next` cache: `rm -rf .next`

## File Structure

```
app/
└── dashboard/
    ├── page.tsx                    # Main dashboard page
    └── components/
        ├── StatCard.tsx            # KPI cards
        ├── DataTable.tsx           # Reusable data table
        ├── DashboardCharts.tsx      # Charts & visualizations
        └── PrismaStudioEmbed.tsx   # Studio Core integration

server/
└── trpc/
    └── routers/
        └── dashboard.ts            # Dashboard API endpoints

sdk/
└── db/
    └── prisma/
        └── schema.prisma           # Prisma schema (shared with Studio)
```

## Next Steps

1. **Connect Real Data**: Replace sample data in `page.tsx` with tRPC queries
2. **Add More Models**: Extend dashboard router for additional models
3. **Custom Charts**: Add more visualizations using chart libraries
4. **Styling**: Customize components to match your brand

## References

- [Prisma Studio Core Documentation](https://www.prisma.io/docs/studio)
- [tRPC Documentation](https://trpc.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Radix UI Components](https://www.radix-ui.com/)

