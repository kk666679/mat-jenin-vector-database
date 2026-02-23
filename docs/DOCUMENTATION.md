# Matjenin AI - Technical Documentation

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [API Reference](#api-reference)
5. [Components](#components)
6. [Configuration](#configuration)
7. [Deployment](#deployment)
8. [Security](#security)
9. [Troubleshooting](#troubleshooting)

---

## Overview

Matjenin AI is a multi-tenant vector database and Retrieval-Augmented Generation (RAG) platform designed for building AI-powered applications. It provides:

- **Vector Storage**: Store and search high-dimensional embeddings
- **Document Processing**: Automatic chunking and embedding generation
- **RAG Chat**: Conversational interface with source citations
- **Real-time Streaming**: Token-by-token response streaming
- **Multi-Provider AI**: Support for multiple LLM providers

### Core Concepts

#### Vector Embeddings
Vector embeddings are numerical representations of text that capture semantic meaning. They enable semantic search - finding documents that are conceptually similar, not just keyword matches.

#### RAG (Retrieval-Augmented Generation)
RAG combines:
1. **Retrieval**: Find relevant documents using vector similarity search
2. **Augmentation**: Use retrieved context in the LLM prompt
3. **Generation**: Generate responses based on both the query and retrieved context

#### Multi-Tenancy
Each tenant operates in complete isolation:
- Separate user accounts and roles
- Data isolation at database level
- Independent rate limits and quotas

---

## System Architecture

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                           Client Applications                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   Web App    │  │   Mobile     │  │   API        │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
└─────────┼─────────────────┼──────────────────┼───────────────────────┘
          │                 │                  │
          └─────────────────┴──────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Next.js Server   │
                    │   (tRPC + API)     │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼───────┐    ┌─────────▼─────────┐   ┌──────▼──────┐
│  SQL Server   │    │    Weaviate       │   │   Redis     │
│  (Prisma)     │    │   (Vectors)       │   │  (Queue)    │
└───────────────┘    └───────────────────┘   └─────────────┘
```

### Component Interactions

#### Document Upload Flow
1. User uploads document via `/api/documents`
2. Document metadata stored in SQL Server
3. Job queued in Redis for processing
4. Worker processes document:
   - Extracts text content
   - Chunks text into segments
   - Generates embeddings via LLM
   - Stores embeddings in Weaviate

#### Query Flow
1. User sends query via `/api/query/stream`
2. Query embedding generated via LLM
3. Similar document chunks retrieved from Weaviate
4. Retrieved context sent to LLM for generation
5. Response streamed to client with sources

---

## Database Schema

### Core Models

#### Tenant
Multi-tenant root entity containing configuration and limits.

```prisma
model Tenant {
  id          String   @id @default(uuid())
  name        String   @unique
  slug        String   @unique
  plan        String   @default("free") // "free", "pro", "enterprise"
  isActive    Boolean  @default(true)
  
  // Limits
  maxUsers        Int    @default(5)
  maxDocuments    Int    @default(100)
  maxStorageMb    Int    @default(1000)
  rateLimitRpm    Int    @default(60)
  rateLimitRph    Int    @default(1000)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users       User[]
  documents   Document[]
  sessions    Session[]
  apiKeys     ApiKey[]
  auditLogs   AuditLog[]
}
```

#### User
Tenant-scoped user account.

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  role         String   @default("member") // "admin", "member"
  avatarUrl    String?
  isActive     Boolean  @default(true)
  lastLoginAt  DateTime?
  
  tenantId     String
  tenant       Tenant   @relation(...)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

#### Document
Represents uploaded documents.

```prisma
model Document {
  id          String    @id @default(uuid())
  tenantId    String
  tenant      Tenant    @relation(...)
  
  title       String
  filename    String?
  contentType String?
  fileSize    Int?      // bytes
  content     String?
  fileUrl     String?   // S3/Azure Blob URL
  
  status      String    @default("pending") // "pending", "processing", "completed", "failed"
  chunkCount  Int       @default(0)
  
  processedAt    DateTime?
  errorMessage   String?
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  chunks      DocumentChunk[]
}
```

#### DocumentChunk
Vector-embedded document segments.

```prisma
model DocumentChunk {
  id          String    @id @default(uuid())
  tenantId    String
  documentId  String
  document    Document  @relation(...)
  
  content     String    // chunk text
  chunkIndex  Int       // position in document
  embedding   String?   // JSON string for DB fallback
  embeddingId String?   // Weaviate ID
  
  metadata    String?   // JSON metadata
  
  createdAt   DateTime  @default(now())
}
```

### Authentication Models

#### Session
User session with expiration.

```prisma
model Session {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(...)
  tenantId     String
  tenant       Tenant   @relation(...)
  token        String   @unique
  refreshToken String?  @unique
  ipAddress    String?
  userAgent    String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())
}
```

#### ApiKey
Programmatic API access.

```prisma
model ApiKey {
  id          String   @id @default(uuid())
  tenantId    String
  tenant      Tenant   @relation(...)
  name        String
  keyHash     String   @unique
  prefix      String   // Display prefix
  permissions String   // JSON array
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

### Analytics Models

#### AuditLog
Complete audit trail.

```prisma
model AuditLog {
  id          String    @id @default(uuid())
  tenantId    String
  tenant      Tenant    @relation(...)
  
  userId      String?
  documentId  String?
  
  action      String    // "create", "update", "delete", "login"
  entityType  String    // "document", "user", "api_key"
  entityId    String?
  details     String?   // JSON
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime  @default(now())
}
```

#### UsageMetric
Usage tracking.

```prisma
model UsageMetric {
  id          String   @id @default(uuid())
  tenantId    String
  tenant      Tenant   @relation(...)
  
  metricType  String   // "api_requests", "tokens_used", "storage_mb"
  value       Int
  period      String   // "hourly", "daily", "monthly"
  periodStart DateTime
  
  createdAt   DateTime @default(now())
  
  @@unique([tenantId, metricType, periodStart])
}
```

---

## API Reference

### tRPC Procedures

#### Document Router

```typescript
// List documents
document.list: publicProcedure
  .input(z.object({ 
    page: z.number().default(1),
    limit: z.number().default(20),
    status: z.enum(['pending', 'processing', 'completed', 'failed']).optional()
  }))
  .query(({ input, ctx }) => {...})

// Upload document
document.create: protectedProcedure
  .input(z.object({
    title: z.string(),
    content: z.string().optional(),
    fileUrl: z.string().optional(),
    chunkSize: z.number().default(512),
    overlap: z.number().default(50)
  }))
  .mutation(({ input, ctx }) => {...})

// Get document
document.get: protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input, ctx }) => {...})

// Delete document
document.delete: protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input, ctx }) => {...})
```

#### Query Router

```typescript
// Simple query
query.ask: protectedProcedure
  .input(z.object({
    message: z.string(),
    includeReasoning: z.boolean().default(true),
    includeSources: z.boolean().default(true)
  }))
  .mutation(({ input, ctx }) => {...})

// Streaming query
query.askStream: protectedProcedure
  .input(z.object({
    message: z.string(),
    includeReasoning: z.boolean().default(true),
    includeSources: z.boolean().default(true)
  }))
  .mutation(({ input, ctx }) => {...})

// Vector search
query.search: protectedProcedure
  .input(z.object({
    query: z.string(),
    topK: z.number().default(10),
    rerank: z.boolean().default(false),
    hybridSearch: z.boolean().default(false)
  }))
  .query(({ input, ctx }) => {...})
```

#### Dashboard Router

```typescript
// Get dashboard stats
dashboard.getStats: protectedProcedure
  .input(z.object({
    period: z.enum(['24h', '7d', '30d', '90d']).default('7d')
  }))
  .query(({ input, ctx }) => {...})

// Get usage chart data
dashboard.getUsageChart: protectedProcedure
  .input(z.object({
    metricType: z.string(),
    period: z.enum(['24h', '7d', '30d', '90d'])
  }))
  .query(({ input, ctx }) => {...})

// Get recent documents
dashboard.getRecentDocuments: protectedProcedure
  .query(({ ctx }) => {...})
```

### REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents` | Upload document |
| GET | `/api/documents` | List documents |
| GET | `/api/documents/[id]` | Get document |
| DELETE | `/api/documents/[id]` | Delete document |
| POST | `/api/query` | Query (non-streaming) |
| POST | `/api/query/stream` | Query (streaming) |
| GET | `/api/trpc/[trpc]` | tRPC handler |

---

## Components

### AI Elements

The project includes a rich set of AI-focused React components:

| Component | Description |
|-----------|-------------|
| `Persona` | Animated AI persona with different states |
| `Message` | Chat message with user/assistant roles |
| `Reasoning` | Chain-of-thought visualization |
| `Sources` | Source citation display |
| `CodeBlock` | Syntax-highlighted code |
| `Artifact` | Rich content output containers |
| `Tool` | Tool execution display |
| `Suggestion` | AI-suggested follow-ups |

### UI Components

Built with Radix UI primitives:

- Button, Input, Textarea
- Card, Dialog, Dropdown
- Table, Tabs, Accordion
- Avatar, Badge, Tooltip
- And many more...

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | SQL Server connection string |
| `REDIS_URL` | Yes | `redis://localhost:6379` | Redis connection |
| `WEAVIATE_URL` | Yes | `http://localhost:8080` | Weaviate URL |
| `OPENAI_API_KEY` | No | - | OpenAI API key |
| `ANTHROPIC_API_KEY` | No | - | Anthropic API key |
| `GOOGLE_API_KEY` | No | - | Google AI API key |
| `GROQ_API_KEY` | No | - | Groq API key |
| `DEEPSEEK_API_KEY` | No | - | DeepSeek API key |
| `NEXTAUTH_SECRET` | No | - | Auth secret |

### Docker Services

```yaml
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2025
    ports:
      - "1433:1433"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  weaviate:
    image: semitechnologies/weaviate:latest
    ports:
      - "8080:8080"
  
  transformers:
    image: semitechnologies/transformers-inference:sentence-transformers-paraphrase-multilingual-MiniLM-L12-v2
```

---

## Deployment

### Production Checklist

1. **Database**
   - [ ] Configure SQL Server with proper credentials
   - [ ] Set up database backups
   - [ ] Configure connection pooling

2. **Redis**
   - [ ] Enable Redis persistence
   - [ ] Set up Redis clustering for high availability

3. **Weaviate**
   - [ ] Configure vector indexing (HNSW)
   - [ ] Set up replication for high availability

4. **Security**
   - [ ] Enable HTTPS/TLS
   - [ ] Configure CORS properly
   - [ ] Set up rate limiting
   - [ ] Configure API key rotation

5. **Monitoring**
   - [ ] Set up logging (OpenTelemetry)
   - [ ] Configure health checks
   - [ ] Set up alerts

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Kubernetes Deployment

For Kubernetes deployment, you'll need:
- `deployment.yaml` - Application deployment
- `service.yaml` - ClusterIP service
- `ingress.yaml` - Ingress configuration
- `configmap.yaml` - Environment configuration
- `secret.yaml` - Sensitive data

---

## Security

### Authentication

- Session-based authentication with secure cookies
- Token rotation on each request
- Configurable session expiration

### Authorization

- Role-based access control (RBAC)
- Tenant-level data isolation
- API key permissions system

### Rate Limiting

- Per-tenant rate limits (configurable)
- Per-API-key rate limits
- Request logging for abuse detection

### Data Protection

- Password hashing with bcrypt
- API key hashing for storage
- SQL injection prevention via Prisma
- XSS prevention in React

---

## Troubleshooting

### Common Issues

#### Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:1433
```
**Solution**: Ensure SQL Server is running via Docker:
```bash
docker-compose up -d sqlserver
```

#### Weaviate Connection Error
```
Error: Weaviate is not available
```
**Solution**: Check Weaviate is accessible:
```bash
curl http://localhost:8080/v1/.well-known/ready
```

#### Redis Connection Error
```
Error: Redis connection refused
```
**Solution**: Start Redis:
```bash
docker-compose up -d redis
```

#### Document Processing Fails
1. Check worker logs: `npm run worker`
2. Verify document format is supported
3. Check Weaviate is running and accessible

#### Rate Limit Errors
```
Error: Rate limit exceeded
```
**Solution**: 
- Wait for the rate limit window to reset
- Upgrade to a higher plan for higher limits

### Debug Mode

Enable debug logging:
```typescript
// In your code
import { logger } from '@/lib/utils'

logger.level = 'debug'
```

### Health Checks

```bash
# tRPC health
curl http://localhost:3000/api/trpc/health.check

# Database
curl http://localhost:3000/api/trpc/health.db

# Weaviate
curl http://localhost:8080/v1/.well-known/ready
```

---

## API Versioning

This documentation covers API version **v1**. Check the CHANGELOG for updates.

---

## Support

- **Issues**: https://github.com/yourusername/matjenin-ai/issues
- **Discussions**: https://github.com/yourusername/matjenin-ai/discussions
- **Email**: support@matjenin.ai

---

## Appendix

### Glossary

| Term | Definition |
|------|------------|
| Embedding | Numerical vector representation of text |
| Vector Search | Similarity search using embeddings |
| RAG | Retrieval-Augmented Generation |
| Tenant | Isolated organization/account |
| Chunk | Document segment for embedding |

### Performance Tuning

- Use connection pooling for database
- Enable Redis caching for frequently accessed data
- Configure Weaviate HNSW parameters for speed/accuracy trade-off
- Use pagination for large result sets

