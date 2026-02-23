# Matjenin AI Platform - Unified Architecture Consolidation

**Document Type:** Principal Architecture Review & Audit  
**Date:** 24 February 2026  
**Scope:** Full-system cross-layer consolidation  
**Platform Version:** 1.0.15

---

## 1. Unified System Model

### 1.1 Narrative: How Every Layer Connects

The Matjenin platform is a **multi-tenant RAG-as-a-Service** system. A single inbound request from any surface -- web UI, API client, gRPC consumer -- passes through a deterministic sequence of responsibility boundaries before a response is emitted. The canonical path is:

```
Client (Next.js React / gRPC client)
  -> Transport (HTTP via App Router / gRPC via @grpc/grpc-js)
    -> API Adapter (Next.js Route Handler / gRPC Server)
      -> Router (tRPC appRouter / AIServiceImpl)
        -> Middleware Stack (logging -> tenant isolation -> auth -> rate limit)
          -> Procedure / RPC Method
            -> SDK Layer (db, vector, llm, cache, queue, ml, webhook)
              -> Data Stores (SQL Server via Prisma, Weaviate/Pinecone, Redis)
              -> External Services (OpenAI, Anthropic, Google, Groq, DeepSeek, Cohere)
            -> Response Construction
          -> Middleware Unwinding (error formatting, serialization via superjson)
        -> Transport Serialization
      -> Client Hydration (tRPC React Query / gRPC response)
    -> UI Rendering (React Server Components / Client Components)
```

**Why each layer exists:**

| Layer | Justification |
|-------|---------------|
| **Client (Next.js App Router)** | SSR/SSG for SEO, React Server Components for reduced JS payload, App Router for file-based routing with layouts. |
| **Transport Adapters** | `app/api/trpc/[trpc]/route.ts` adapts tRPC to the Fetch API surface Next.js provides; `server/grpc/server.ts` exposes the same business logic over gRPC for service-to-service calls. |
| **tRPC Router** | Type-safe API contract shared between client and server; eliminates manual API schema maintenance. Sub-routers (`document`, `query`, `dashboard`, `webhook`) enforce domain boundaries. |
| **Middleware Stack** | Cross-cutting concerns -- tenant isolation, auth gating, logging, rate limiting -- applied compositionally via `t.middleware()`. The ordering is deterministic: logging first (captures all), then tenant, then auth, then rate limit. |
| **SDK Layer** | Pure-function or singleton-based modules that encapsulate all infrastructure interactions. Routers call SDK functions; they never touch `fetch()`, SQL, or Redis directly. This is the **seam** that enables testing and swappability. |
| **Data Stores** | SQL Server (Prisma ORM) for structured relational data with tenant-scoped indices. Weaviate/Pinecone for HNSW-indexed vector search. Redis for caching, rate limiting (sliding-window sorted sets), distributed locks, and BullMQ job queuing. |
| **Background Workers** | `app/worker/index.ts` runs as a separate Node.js process consuming BullMQ jobs for document chunking, embedding generation, and vector indexing. This decouples heavy compute from the request path. |
| **Webhook System** | `sdk/webhook/` manages outbound event delivery with HMAC signing, exponential-backoff retries, and delivery audit logs. Triggered post-mutation (document created/processed/failed). |

### 1.2 Dual-API Surface

The platform exposes **two API surfaces** serving different consumers:

1. **tRPC over HTTP** (`/api/trpc/*`) -- Primary surface for the web frontend. Uses `@trpc/react-query` on the client with `superjson` serialization. Middleware-enforced auth and tenancy.
2. **gRPC** (`:50051`) -- Service-to-service interface defined in `sdk/proto/ai-service.proto`. The `AIServiceImpl` class in `server/grpc/aiservice.ts` reimplements the same business logic (search, generate, CRUD) that the tRPC routers expose, but with Protobuf message types.

**Architectural implication:** Business logic is currently **duplicated** between tRPC routers and `AIServiceImpl`. Both independently instantiate Prisma clients, create vector clients, and build RAG pipelines. This is a structural risk (see Section 5).

---

## 2. End-to-End Flow Consolidation

### 2.A Document Upload Lifecycle

```
[UI: /documents page]
  User submits title + content
    |
    v
[tRPC: document.create] (protectedProcedure)
  1. Middleware validates tenantId + userId
  2. Prisma: INSERT INTO Document (status='pending')
  3. Fire-and-forget: addDocumentJob(documentId, tenantId) -> BullMQ
  4. Return { id, title, status } to client immediately
    |
    v
[BullMQ Queue: "document-processing"]
  Job sits in Redis sorted set until worker picks it up
    |
    v
[Worker Process: app/worker/index.ts]
  1. worker.on('active') -> processDocumentJob()
  2. UPDATE Job SET status='processing', startedAt=NOW()
  3. SELECT Document WHERE id=documentId
  4. chunkText(document.content, { chunkSize: 1000, overlap: 200 })
     -> Returns string[] of overlapping chunks
  5. For each chunk: generateEmbedding(chunk) via Transformers.js
     -> Xenova/all-MiniLM-L6-v2, 384-dim, mean pooling, L2-normalized
  6. For each chunk: INSERT INTO DocumentChunk (embedding as JSON string)
  7. Try: PineconeClient.addVectors() with tenant namespace `tenant_{tenantId}`
     Catch: Log "Pinecone not available, vectors stored in DB only"
  8. UPDATE Document SET status='completed', chunkCount=N
  9. UPDATE Job SET status='completed', progress=100
    |
    v
[Webhook Trigger] (if configured)
  webhookService.triggerWebhook(tenantId, 'document.processed', { documentId })
    -> For each active webhook matching event:
       INSERT INTO WebhookDelivery (status='pending')
    -> Webhook worker polls pending deliveries with exponential backoff
```

**Key observations:**
- The worker runs as a **separate process** (`npx tsx app/worker/index.ts`), with its own PrismaClient instance. It does not share the Next.js server's connection pool.
- Embedding generation is **sequential per document** (`Promise.all` per chunk, but within a single job). For large documents (hundreds of chunks), this can be a bottleneck.
- Vector storage has a **dual-write** pattern: embeddings go to both SQL (as JSON string) and Pinecone (as native vectors). If Pinecone fails, the system degrades to SQL-only search.

### 2.B RAG Query Lifecycle

```
[UI: /chat page]
  User submits query string
    |
    v
[tRPC: query.search] (publicProcedure)
  1. tenantMiddleware ensures ctx.tenantId exists
  2. Try: createWeaviateClient().search({ tenantId, query, topK })
     -> Generates query embedding via Transformers.js
     -> Sends nearVector query to Weaviate with tenant multi-tenancy
     Catch: SQL fallback
       -> prisma.documentChunk.findMany({ tenantId })
       -> Manual keyword scoring: split query into terms, count matches
       -> Sort by score descending, take topK
  3. If no results: return "I couldn't find relevant information"
  4. createRAGPipeline() -> new RAGPipeline(LLMConfig)
     -> pipeline.query({ query, context: searchResults, maxContextChunks })
     -> Builds prompt: "[Document 1: title]\ncontent\n---\n[Document 2: ...]"
     -> Appends: "Question: {query}\nBased on the context above..."
     -> LLMClient.generate({ prompt, systemPrompt: DEFAULT_RAG_SYSTEM_PROMPT })
       -> Calls OpenAI/Anthropic/Ollama chat completions API
  5. Return { answer, sources: [{ title, content, score }], tokensUsed }
    |
    v
[UI: Render answer with source citations]
```

**Dual LLM path:** The codebase contains **two LLM integration layers**:
1. **Legacy:** `sdk/llm/index.ts` -- Custom `LLMClient` class with raw `fetch()` calls to provider APIs.
2. **Modern:** `sdk/llm/ai-sdk.ts` -- Vercel AI SDK v6 integration with lazy-loaded providers, streaming support, structured output, and tool calling.

Currently, the tRPC `query.search` procedure uses the **legacy** `createRAGPipeline()` from `sdk/llm/index.ts`. The AI SDK integration (`RAGPipelineAI`) exists but is not wired into the tRPC router. This is a migration gap.

### 2.C Multi-Tenant Isolation Flow

```
[Request arrives]
  |
  v
[createContext()] in server/trpc/context.ts
  1. Extract x-tenant-id header -> ctx.tenantId (default: 'default-tenant')
  2. Extract x-user-id header -> ctx.userId
  3. Extract x-user-role header -> ctx.userRole
  4. Extract x-forwarded-for -> ctx.ip
  5. No JWT verification performed (see Security Analysis)
    |
    v
[tenantMiddleware] in server/trpc/trpc.ts
  1. Assert ctx.tenantId is not empty
  2. Pass through to next middleware
    |
    v
[Prisma Queries]
  Every query includes WHERE tenantId = ctx.tenantId
  Schema has @@index([tenantId]) on all major tables
    |
    v
[Vector Search]
  Weaviate: Uses tenant parameter in search request
  Pinecone: Uses namespace `tenant_{tenantId}` for complete isolation
    |
    v
[Redis/Cache]
  CACHE_KEYS.searchResults(tenantId, query) -> `search:{tenantId}:{query}`
  setTenantCache/getTenantCache prefix all keys with tenantId
    |
    v
[Response]
  Only tenant-scoped data returned
```

**Critical finding:** Authentication is **header-based without cryptographic verification**. The `createContext()` function reads `x-tenant-id`, `x-user-id`, and `x-user-role` directly from request headers. There is a JWT `authorization` header extracted but **never verified** -- the JWT_SECRET config exists but no `jsonwebtoken.verify()` call is present. In production, any client can impersonate any tenant by setting headers. The `isAuthedMiddleware` only checks `if (!ctx.userId)`, which succeeds if the header is present regardless of validity.

---

## 3. Layer Responsibility Matrix

| Layer | Responsibility | What It Must NOT Do |
|-------|---------------|---------------------|
| **Client (React/Next.js)** | Render UI, manage local interaction state, call tRPC hooks, handle optimistic updates | Access database directly, hold sensitive secrets, perform auth validation, bypass tRPC for data mutations |
| **Next.js Server (App Router)** | SSR/SSG, route handling, static generation, layout composition, tRPC adapter mounting | Contain business logic, directly query databases, manage state across requests |
| **tRPC Router** | Define API surface, compose middleware, validate inputs (Zod), delegate to SDK/service layer | Contain data access logic, instantiate infrastructure clients inline, perform complex computation |
| **Service Layer (Procedures)** | Orchestrate SDK calls for a single use case, handle error mapping, compose transactions | Directly access databases, manage connection pools, contain reusable logic that belongs in SDK |
| **SDK Layer** | Encapsulate all infrastructure interactions (DB, Vector, LLM, Cache, Queue), provide typed interfaces, handle retries/fallbacks | Know about HTTP request/response, depend on tRPC context, contain UI logic, manage auth |
| **Queue Layer (BullMQ)** | Reliable job scheduling, retry with backoff, concurrency control, dead-letter handling | Perform synchronous operations, access request context, couple to specific routers |
| **Database Layer (SQL Server/Prisma)** | Persistent structured storage, ACID transactions, referential integrity, tenant-scoped indices | Store vector embeddings as primary search index, perform text search beyond basic LIKE, manage cache |
| **Vector Layer (Weaviate/Pinecone)** | High-dimensional similarity search, HNSW indexing, namespace-based tenant isolation | Store relational data, enforce business rules, manage auth/sessions |
| **LLM Layer (AI SDK/Custom)** | Text generation, streaming, structured output, tool calling, prompt construction | Persist data, manage user sessions, perform search, handle auth |

---

## 4. Cross-Cutting Concerns Mapping

### 4.1 Authentication

| Propagation Point | Current Implementation | Risk Level |
|-------------------|----------------------|------------|
| HTTP Headers | `x-user-id`, `x-user-role` extracted in `createContext()` | **CRITICAL** -- No cryptographic verification |
| tRPC Middleware | `isAuthedMiddleware` checks `ctx.userId` existence only | **HIGH** -- Trusts header value |
| gRPC | No auth implementation in `server/grpc/server.ts` | **CRITICAL** -- Completely unauthenticated |
| Worker | No auth context -- operates with system privileges | Acceptable for background processing |
| JWT Config | `JWT_SECRET`, `JWT_EXPIRES_IN` defined in `sdk/shared/config.ts` | Unused -- no verify call exists |

### 4.2 Rate Limiting

| Layer | Implementation |
|-------|---------------|
| Config | `RATE_LIMIT_WINDOW_MS` (60s), `RATE_LIMIT_MAX_REQUESTS` (100) in env schema |
| Redis | `checkRateLimit()` in `sdk/cache/index.ts` uses sliding-window sorted set -- **well-implemented** |
| tRPC | `rateLimitMiddleware` exists but is a **TODO placeholder** -- no Redis call made |
| Tenant | `Tenant.rateLimitRpm` and `rateLimitRph` columns exist but are **not enforced** |

### 4.3 Tenant Context

| Layer | Mechanism |
|-------|-----------|
| Transport | `x-tenant-id` header, defaulting to `'default-tenant'` |
| tRPC | `tenantMiddleware` asserts non-empty `tenantId` |
| Prisma | All queries include `WHERE tenantId = ?` via manual filtering (no Prisma middleware/policy) |
| Vector | Weaviate uses `tenant` parameter; Pinecone uses `namespace: tenant_{id}` |
| Cache | Key prefixing: `{tenantId}:{key}` |
| Queue | Job data includes `tenantId`; worker filters by it |

### 4.4 Logging & Observability

| Component | Implementation |
|-----------|---------------|
| tRPC | `loggingMiddleware` logs `[tRPC] {type} {path} - {duration}ms` in dev only |
| OpenTelemetry | `@opentelemetry/core`, `resources`, `sdk-trace-base`, `instrumentation-grpc` are installed as dependencies |
| Worker | Uses `console.log` with `traceId` propagation in job data |
| Queue | `generateTraceId()` creates UUID for distributed tracing |
| Production | `OTEL_EXPORTER_OTLP_ENDPOINT` configurable but no exporter initialization code found |

**Assessment:** OpenTelemetry dependencies are installed but **not wired up**. There is no `TracerProvider` initialization, no instrumentation registration, and no span creation in any module. The `traceId` field in queue jobs is manually generated UUIDs, not connected to any tracing backend.

### 4.5 Error Handling

| Layer | Pattern |
|-------|---------|
| tRPC | `TRPCError` with standard codes (`NOT_FOUND`, `UNAUTHORIZED`, `INTERNAL_SERVER_ERROR`); error formatter strips Zod details in production |
| SDK | `createError()` utility in `sdk/shared/utils.ts`; `asyncHandler()` wrapper |
| LLM | Provider-specific error wrapping (e.g., "OpenAI API error: {text}") |
| Worker | try/catch per job with `Job.status='failed'` + error message persistence |
| gRPC | `mapError()` converts all errors to `grpc.status.INTERNAL` -- loses granularity |

### 4.6 Caching

| Pattern | Implementation |
|---------|---------------|
| Entity Cache | `CACHE_KEYS.tenant()`, `.user()`, `.document()` -- defined but **not actively used** in routers |
| Search Cache | `CACHE_KEYS.searchResults(tenantId, query)` -- defined but **not called** in query router |
| Rate Limit | Active -- sliding window in Redis sorted sets |
| Locks | `tryLock()`/`releaseLock()` for distributed coordination -- defined, usage not observed |

### 4.7 Streaming

| Surface | Implementation |
|---------|---------------|
| HTTP | `app/api/query/stream/route.ts` exists (presumed SSE/ReadableStream) |
| AI SDK | `streamTextAI()` returns `AsyncGenerator<string>` via AI SDK v6 `streamText()` |
| Legacy LLM | `RAGPipeline.queryStream()` is a **fake stream** -- awaits full response then yields once |
| gRPC | `streamText` handler is a **stub** returning empty content |
| WebSocket | Not implemented |

### 4.8 Background Processing

| Component | Details |
|-----------|---------|
| Queue | BullMQ with Redis, 3 named queues: `document-processing`, `embedding`, `indexing` |
| Worker Concurrency | Default 5 concurrent jobs per worker instance |
| Retry | Exponential backoff (1s base), max 3 attempts |
| Cleanup | `removeOnComplete: { count: 100, age: 24h }`, `removeOnFail: { count: 500 }` |
| Webhook Worker | `setInterval` every 60s polling for pending retries -- not using BullMQ |

---

## 5. Architectural Cohesion Analysis

### 5.1 Where Are Tight Couplings?

1. **tRPC routers <-> Prisma:** Routers directly instantiate `getPrismaClient()` and run queries inline. There is no intermediate service/repository layer. The `documentRouter` contains 200+ lines of Prisma queries.

2. **AIServiceImpl <-> Everything:** The gRPC service implementation (`server/grpc/aiservice.ts`) duplicates all business logic from tRPC routers rather than delegating to shared services. It independently creates Prisma clients, vector clients, and RAG pipelines.

3. **Worker <-> Prisma schema:** The worker directly uses `PrismaClient` with inline queries rather than calling shared repository functions. Schema changes require updating three places: tRPC routers, gRPC service, and worker.

### 5.2 Where Are Clean Abstractions?

1. **SDK module boundaries** are well-defined: `sdk/db`, `sdk/vector`, `sdk/llm`, `sdk/cache`, `sdk/queue`, `sdk/ml`, `sdk/webhook` each have clear `index.ts` barrel exports.

2. **Vector abstraction** is strong: `WeaviateClient` and `PineconeClient` share a common `SearchResult` interface. The `HybridQueryOptimizer` cleanly composes both.

3. **tRPC middleware composition** follows idiomatic patterns: `publicProcedure`, `protectedProcedure`, `adminProcedure` are well-layered.

4. **Config validation** via Zod schema in `sdk/shared/config.ts` provides fail-fast startup validation.

5. **Type system** in `sdk/shared/types.ts` provides comprehensive domain types shared across layers.

### 5.3 Is the SDK Properly Isolated?

**Partially.** The SDK modules do not import from tRPC, Next.js, or React -- this is correct. However:
- `sdk/webhook/index.ts` imports from `@/prisma/client` (project-level) rather than `@/sdk/db/prisma`, breaking the internal dependency direction.
- The SDK has no dependency injection -- all modules directly read `process.env` and create singleton clients. This makes testing difficult.

### 5.4 Are Routers Thin Enough?

**No.** The `queryRouter` and `documentRouter` contain significant business logic:
- The `search` procedure in `queryRouter` contains the full RAG orchestration: vector search with fallback, keyword scoring, RAG pipeline construction, and response formatting -- ~80 lines of logic.
- The `documentRouter.create` procedure handles both DB insertion and queue dispatch.
- A proper service layer (e.g., `DocumentService`, `RAGService`) should sit between routers and SDK.

### 5.5 Are Services Too Stateful?

The `WebhookService` is instantiated as a module-level singleton (`export const webhookService = new WebhookService()`), which carries a `PrismaClient` reference. In serverless (Vercel) environments, this could lead to connection pool exhaustion if not properly managed. Similarly, the `LLMClient`, `WeaviateClient`, and `PineconeClient` are instantiated per-request in some paths and as singletons in others -- inconsistent lifecycle management.

### 5.6 Is Multi-Tenancy Enforceable Everywhere?

**No.** Enforcement relies entirely on convention:
- Every Prisma query manually includes `WHERE tenantId = ctx.tenantId`. A single omission leaks cross-tenant data.
- There is no Prisma middleware, Row-Level Security, or policy-based enforcement.
- The `webhookRouter.update` mutation does **not check tenant ownership** -- it updates by `id` alone without verifying `tenantId`.
- The gRPC service receives `tenantId` as a request field with no validation of caller authority.

### 5.7 Are Vector + SQL Operations Transactionally Safe?

**No.** The worker writes to SQL (DocumentChunk) and then to Pinecone in separate, non-transactional steps:
```typescript
// Step 1: SQL write (committed)
const chunkRecords = await Promise.all(
  embeddings.map((emb, index) => prisma.documentChunk.create({...}))
);
// Step 2: Vector write (may fail)
try {
  await pineconeClient.addVectors(chunkRecords.map(...));
} catch { console.log('Pinecone not available'); }
```
If Pinecone fails, SQL has chunks but vector search cannot find them. If the worker crashes between steps, partial state persists. There is no compensation logic or reconciliation job.

### 5.8 Is Background Processing Idempotent?

**Partially.** BullMQ job IDs use `doc-${documentId}` and `emb-${chunkId}`, preventing duplicate scheduling. However, the processing logic is **not idempotent**:
- Reprocessing a document creates **duplicate** `DocumentChunk` records (no upsert or delete-before-insert).
- Pinecone `addVectors` is an upsert by ID, so vector-side is idempotent.
- No deduplication check before embedding generation.

---

## 6. Scalability Evaluation

### 6.1 Component-by-Component Analysis

| Component | Current Capacity | Scaling Strategy | Bottleneck Risk |
|-----------|-----------------|------------------|-----------------|
| **Next.js Cluster** | Single instance in dev; Vercel serverless in prod | Horizontal via Vercel Edge/Serverless | **LOW** -- stateless request handling |
| **SQL Server** | Single instance (Docker) | Primary + read replica; Prisma datasource switching exists (`createPrismaClient(url)`) | **MEDIUM** -- Single writer bottleneck for high-write tenants; no connection pooling config |
| **Weaviate HNSW** | Single node (Docker) | Weaviate supports multi-node clustering with sharding | **MEDIUM** -- Index rebuild time grows with vector count; no sharding configured |
| **Pinecone** | Serverless (managed) | Auto-scales with usage | **LOW** -- Managed service handles scaling |
| **Redis + BullMQ** | Single instance (Docker Alpine) | Redis Cluster or managed Redis | **MEDIUM** -- Single-point-of-failure; no persistence beyond AOF |
| **LLM Streaming** | Direct API calls to providers | Provider-side scaling; no client-side buffering | **LOW** -- Externalized; rate limits are provider-imposed |
| **Embedding Generation** | In-process Transformers.js (CPU) | Cannot GPU-accelerate in Node.js; sequential per job | **HIGH** -- CPU-bound; all-MiniLM-L6-v2 is fast but blocks event loop |
| **Queue Worker** | Single process, concurrency=5 | Multiple worker instances reading from same queue | **MEDIUM** -- Currently single process; needs horizontal scaling |

### 6.2 Bottleneck Risk Assessment

1. **Embedding Generation (HIGH):** Transformers.js runs on CPU within the worker Node.js process. For a burst of 100 documents with 50 chunks each (5,000 embeddings), sequential processing at ~10ms/embedding = 50 seconds of CPU time per document. Multiple concurrent jobs (concurrency=5) will fight for CPU. **Mitigation:** Offload to a dedicated embedding microservice (Python with GPU) or use provider-hosted embedding APIs (OpenAI `text-embedding-3-small`).

2. **SQL Server Write Contention (MEDIUM):** The worker writes chunk records sequentially (`Promise.all` per document, but each chunk is an individual `INSERT`). For large tenants uploading many documents simultaneously, the single SQL Server instance becomes the bottleneck. **Mitigation:** Batch inserts with `createMany()`, connection pooling via PgBouncer-equivalent, read replicas.

3. **Worker Single-Process (MEDIUM):** Only one worker process listens on the `document-processing` queue. If it crashes or is overloaded, all jobs stall. **Mitigation:** Run multiple worker replicas behind the same Redis queue (BullMQ natively supports this).

4. **Weaviate Single-Node (MEDIUM):** The Docker Compose runs a single Weaviate node. As vector count grows, HNSW index performance degrades and rebuild times increase. **Mitigation:** Weaviate multi-node cluster with replication factor 2+.

---

## 7. Refactoring & Hardening Recommendations

### 7.1 Structural Improvements

| Priority | Recommendation | Impact |
|----------|---------------|--------|
| **P0** | **Implement JWT verification in `createContext()`** -- The `JWT_SECRET` config exists; add `jsonwebtoken.verify()` to validate the `authorization` header. Never trust `x-user-id`/`x-tenant-id` headers in production. | Fixes critical security vulnerability |
| **P0** | **Add tenant ownership checks to all mutations** -- The `webhookRouter.update` and gRPC `updateDocument` lack tenant scoping. Audit every mutation. | Prevents cross-tenant data modification |
| **P1** | **Extract a Service Layer** -- Create `services/DocumentService.ts`, `services/RAGService.ts`, `services/WebhookService.ts` that encapsulate business logic. Both tRPC routers and gRPC handlers delegate to these services. | Eliminates business logic duplication |
| **P1** | **Wire OpenTelemetry** -- Initialize `NodeTracerProvider`, register `GrpcInstrumentation`, create spans in SDK methods. Connect to `OTEL_EXPORTER_OTLP_ENDPOINT`. | Enables production observability |
| **P1** | **Activate rate limiting** -- Replace the TODO in `rateLimitMiddleware` with a call to `checkRateLimit()` from `sdk/cache`. Use `Tenant.rateLimitRpm` for per-tenant limits. | Prevents abuse and ensures fair usage |
| **P2** | **Migrate tRPC routers to AI SDK** -- Replace `createRAGPipeline()` (legacy) with `RAGPipelineAI` (AI SDK) in `queryRouter.search`. The AI SDK path supports streaming, structured output, and multi-provider routing. | Unified LLM interface, better streaming |
| **P2** | **Add Prisma middleware for tenant isolation** -- Use `prisma.$use()` or Prisma Client Extensions to automatically inject `tenantId` into all queries, eliminating the risk of omission. | Defense-in-depth for multi-tenancy |
| **P2** | **Make document processing idempotent** -- Before creating chunks, delete existing chunks for the document: `DELETE FROM DocumentChunk WHERE documentId = ?`. | Prevents duplicate data on retries |

### 7.2 Separation Improvements

| Current | Proposed |
|---------|----------|
| Business logic in tRPC routers | Extract to `services/` directory |
| Duplicated logic in gRPC `AIServiceImpl` | Delegate to shared `services/` |
| `sdk/webhook/index.ts` imports `@/prisma/client` | Import from `@/sdk/db/prisma` |
| Worker inline Prisma queries | Use shared repository functions from `services/` |
| `LLMClient` and `RAGPipelineAI` coexist | Deprecate `LLMClient`; standardize on AI SDK |

### 7.3 Anti-Pattern Warnings

1. **Trusting client-provided identity headers** -- This is the #1 security anti-pattern in the codebase. Headers like `x-user-id` must be derived from a verified JWT, not accepted at face value.

2. **Fire-and-forget queue dispatch without error handling** -- `addDocumentJob().catch(console.error)` in `documentRouter.create` silently swallows queue failures. The document is created with `status='pending'` but may never be processed.

3. **Module-level singleton services** -- `const webhookService = new WebhookService()` at module scope creates a Prisma connection that persists across serverless invocations but may become stale.

4. **Fake streaming** -- `RAGPipeline.queryStream()` awaits the full LLM response and then yields it as a single chunk. This defeats the purpose of streaming.

5. **JSON-serialized embeddings in SQL** -- `embedding: JSON.stringify(emb.embedding)` stores 384-float vectors as JSON strings in SQL Server. This is unusable for any SQL-side similarity computation and wastes storage.

### 7.4 Suggested Folder Restructuring

```
/
├── app/                          # Next.js App Router (UI + API adapters)
│   ├── (marketing)/              # Landing, docs, footer pages
│   ├── (app)/                    # Authenticated app pages
│   │   ├── chat/
│   │   ├── dashboard/
│   │   ├── documents/
│   │   └── webhooks/
│   └── api/                      # API route adapters only
├── services/                     # NEW: Business logic layer
│   ├── document.service.ts
│   ├── rag.service.ts
│   ├── webhook.service.ts
│   └── dashboard.service.ts
├── server/
│   ├── trpc/                     # Thin tRPC routers delegating to services
│   └── grpc/                     # Thin gRPC handlers delegating to services
├── sdk/                          # Infrastructure abstraction (unchanged)
│   ├── db/
│   ├── vector/
│   ├── llm/
│   ├── cache/
│   ├── queue/
│   ├── ml/
│   ├── models/
│   ├── webhook/
│   └── shared/
├── workers/                      # Renamed from app/worker
│   ├── document.worker.ts
│   └── webhook.worker.ts
├── prisma/                       # Schema + migrations
└── docs/
```

### 7.5 Domain-Driven Design Alignment

| Bounded Context | Aggregates | Services |
|----------------|------------|----------|
| **Document Management** | Document, DocumentChunk, Job | DocumentService (CRUD, chunking, queue dispatch) |
| **Search & RAG** | Conversation, Message, SearchResult | RAGService (vector search, prompt construction, LLM generation) |
| **Tenant Administration** | Tenant, User, Session, ApiKey | TenantService (provisioning, limits, auth) |
| **Observability** | AuditLog, UsageMetric, RateLimitLog | MetricsService (tracking, aggregation) |
| **Integrations** | Webhook, WebhookDelivery | WebhookService (registration, delivery, retry) |

---

## 8. Enterprise-Readiness Score

| Dimension | Score (1-10) | Justification |
|-----------|:---:|---------------|
| **Scalability** | **6** | Horizontal scaling is architecturally possible (stateless API, BullMQ workers, managed Pinecone). However, single-process worker, single-node Weaviate/Redis, CPU-bound embeddings, and no connection pooling config limit current capacity. |
| **Modularity** | **7** | SDK layer is well-factored with clear module boundaries. Type system is comprehensive. However, business logic duplication between tRPC and gRPC, and fat routers reduce the score. |
| **Security** | **3** | **Critical gap:** No JWT verification, header-based auth trust, missing tenant checks on some mutations, no input sanitization beyond Zod validation, gRPC is completely unauthenticated. The Prisma schema and hashing utilities exist for a proper auth system, but it is not wired up. |
| **Observability** | **3** | OpenTelemetry dependencies installed but not initialized. Logging is `console.log` only, dev-mode only in tRPC. No structured logging, no metrics collection, no alerting. TraceId propagation exists in queue jobs but goes nowhere. |
| **Multi-Tenancy Enforcement** | **5** | Tenant isolation by convention (manual `WHERE tenantId`) on all major paths. Weaviate tenant param and Pinecone namespaces add vector-side isolation. But no defense-in-depth (no Prisma middleware, no RLS), and at least one mutation (`webhookRouter.update`) lacks tenant check. |
| **Maintainability** | **7** | TypeScript throughout, Zod validation on all inputs, tRPC provides end-to-end type safety, Prisma schema is well-structured with proper indices. The dual LLM layer (legacy + AI SDK) and business logic duplication are the main maintenance risks. |
| **AI Pipeline Robustness** | **6** | Multi-provider support (8 LLM providers), hybrid search (SQL + vector), graceful degradation (Weaviate -> Pinecone -> SQL fallback), context window management. But: legacy LLM client used in production paths, fake streaming, no embedding cache, no prompt versioning, no A/B testing infrastructure. |

**Overall Enterprise Readiness: 5.3 / 10**

The platform has strong foundational architecture (type safety, SDK modularity, multi-provider AI, queue-based processing) but critical gaps in security and observability prevent production deployment at enterprise scale.

---

## 9. Future Evolution Roadmap

### 9.1 Microservices (If Appropriate)

The current monorepo-with-modules architecture is appropriate for the current scale. Premature microservice extraction would add operational complexity without benefit. **Recommended:** Extract only when a bounded context has independently scaling requirements:

1. **First extraction candidate:** Embedding generation worker -> Dedicated Python/GPU microservice behind a gRPC interface. The existing `sdk/proto/ai-service.proto` already defines `Inference` and `BatchInference` RPCs.
2. **Second candidate:** Webhook delivery -> Separate service with its own retry queue, decoupled from the main application's Redis instance.

### 9.2 Edge Streaming

- Migrate from legacy `RAGPipeline.queryStream()` to AI SDK `streamTextAI()` in all paths.
- Implement Server-Sent Events (SSE) via Next.js Route Handlers (`ReadableStream` response).
- For Vercel deployment, use Edge Runtime for streaming routes to minimize TTFB.
- The `sdk/ml/types.ts` already defines `EdgeDeploymentConfig` with targets (iOS, Android, web) -- implement with ONNX Runtime for on-device inference.

### 9.3 Distributed Vector Search

- **Short-term:** Complete the Pinecone integration as primary vector store (it handles distributed indexing automatically).
- **Medium-term:** Deploy Weaviate in multi-node cluster mode with replication for on-premise enterprise customers who cannot use cloud-managed vector DBs.
- **Long-term:** Evaluate pgvector with SQL Server migration to PostgreSQL, eliminating the need for a separate vector database for simpler deployments.

### 9.4 Multi-Region Deployment

1. Deploy Next.js to Vercel with regional Edge Functions.
2. SQL Server -> Azure SQL with geo-replication (read replicas in EU/APAC).
3. Redis -> Upstash Global Redis for sub-10ms cache reads worldwide.
4. Pinecone -> Already globally distributed (serverless plan).
5. Weaviate -> Deploy regional clusters with cross-region replication.
6. Worker -> Run regional worker pools reading from region-specific Redis queues.

### 9.5 Event-Driven Architecture

The webhook system already provides outbound events. To evolve toward full event-driven:

1. **Introduce an event bus** (Redis Streams or Kafka) for intra-system events.
2. Replace fire-and-forget queue dispatch with event publication: `documentCreated` -> listeners handle queue dispatch, webhook triggering, metrics recording.
3. Use event sourcing for audit trail (the `AuditLog` model is already positioned for this).
4. The `sdk/queue/index.ts` naming (`QUEUE_NAMES.DOCUMENT_PROCESSING`, `.EMBEDDING`, `.INDEXING`) maps cleanly to event topics.

### 9.6 Model-Agnostic LLM Orchestration

The `sdk/models/` layer already provides:
- `ModelDefinition` types with provider-agnostic capabilities
- `getRecommendedModels()` and `searchModelsByCapability()`
- Per-provider modules (OpenAI, Anthropic, Google, Groq, DeepSeek, Mistral, Cerebras, Ollama, xAI)

**Next steps:**
1. Wire `ModelRouter` from `sdk/ml/registry.ts` to automatically select models based on query complexity, cost targets, and latency SLAs.
2. Implement A/B testing between providers using the `DeploymentStrategy` (canary/shadow) types already defined in `sdk/ml/types.ts`.
3. Add cost tracking per provider per tenant, leveraging `UsageMetric` with `metricType='tokens_used'`.

### 9.7 Cost-Aware AI Routing

1. Define cost tiers per model in `sdk/models/capabilities.ts` (input token cost, output token cost).
2. Map tenant plans to cost budgets: `free` -> $5/month, `pro` -> $50/month, `enterprise` -> unlimited.
3. Implement a routing middleware that checks `UsageMetric.tokens_used` against budget before LLM calls.
4. Auto-downgrade to cheaper models (gpt-4o-mini, llama-3) when budget threshold is reached.
5. Surface cost dashboards using the existing `dashboardRouter.usageMetrics` endpoint.

---

## Appendix A: Risk Heatmap

| Risk | Probability | Impact | Severity | Mitigation Status |
|------|:-----------:|:------:|:--------:|:-----------------:|
| Cross-tenant data leak via header spoofing | **HIGH** | **CRITICAL** | **P0** | Unmitigated |
| Unauthenticated gRPC access | **HIGH** | **CRITICAL** | **P0** | Unmitigated |
| Webhook update without tenant check | **MEDIUM** | **HIGH** | **P0** | Unmitigated |
| Rate limiting not enforced | **HIGH** | **MEDIUM** | **P1** | Code exists, not wired |
| Embedding CPU bottleneck under load | **MEDIUM** | **HIGH** | **P1** | No mitigation |
| SQL + Vector inconsistency on partial failure | **MEDIUM** | **MEDIUM** | **P2** | Graceful degradation to SQL-only |
| OpenTelemetry not initialized | **HIGH** | **MEDIUM** | **P1** | Dependencies installed, no init |
| Legacy LLM client in production path | **LOW** | **LOW** | **P3** | AI SDK alternative exists |
| Non-idempotent job processing | **LOW** | **MEDIUM** | **P2** | Job IDs prevent duplication at queue level |
| Single-process worker SPOF | **MEDIUM** | **HIGH** | **P1** | BullMQ supports multi-worker |

## Appendix B: Technical Debt Index

| Debt Item | Estimated Effort | Debt Type | Accrue Rate |
|-----------|:----------------:|-----------|:-----------:|
| JWT verification implementation | 1-2 days | Security | Growing (every new endpoint) |
| Service layer extraction | 3-5 days | Architecture | Stable (managed via convention) |
| OpenTelemetry wiring | 2-3 days | Observability | Growing (harder to retrofit) |
| Rate limit middleware activation | 0.5 days | Security | Stable (code exists) |
| Legacy LLM deprecation | 2-3 days | Maintenance | Growing (two codepaths) |
| Prisma tenant middleware | 1 day | Security | Growing (every new query) |
| Idempotent worker processing | 1 day | Reliability | Stable |
| gRPC authentication | 2-3 days | Security | Growing (new RPCs) |
| Cache utilization in routers | 1-2 days | Performance | Stable |
| Structured logging | 2-3 days | Observability | Growing |

## Appendix C: System Dependency Graph Summary

```
                    ┌─────────────┐
                    │   Client    │
                    │  (React)    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐ ┌───▼───┐ ┌─────▼─────┐
        │  tRPC API  │ │ gRPC  │ │  REST API  │
        │  Adapter   │ │Server │ │  Routes    │
        └─────┬──────┘ └───┬───┘ └─────┬──────┘
              │            │            │
              └────────────┼────────────┘
                           │
                    ┌──────▼──────┐
                    │  Middleware  │
                    │  Stack      │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │  Document  │  │    RAG      │  │  Dashboard  │
    │  Router    │  │   Router    │  │   Router    │
    └─────┬──────┘  └──────┬──────┘  └──────┬──────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐ ┌───▼───┐ ┌─────▼─────┐
        │   SDK/DB   │ │SDK/   │ │  SDK/LLM  │
        │  (Prisma)  │ │Vector │ │ (AI SDK)  │
        └─────┬──────┘ └───┬───┘ └─────┬──────┘
              │            │            │
        ┌─────▼─────┐ ┌───▼────┐ ┌─────▼──────┐
        │ SQL Server │ │Weaviate│ │ OpenAI /   │
        │            │ │Pinecone│ │ Anthropic  │
        └────────────┘ └────────┘ └────────────┘
              │
        ┌─────▼─────┐     ┌────────────┐
        │   Redis    │────▶│  BullMQ    │
        │  (Cache)   │     │  Worker    │
        └────────────┘     └────────────┘
```

## Appendix D: Recommended 12-Month Architecture Evolution Plan

| Quarter | Focus | Key Deliverables |
|---------|-------|-----------------|
| **Q1 (Months 1-3)** | Security & Observability | JWT auth implementation, gRPC auth, tenant middleware for Prisma, activate rate limiting, wire OpenTelemetry with Jaeger/OTLP exporter, structured logging with pino |
| **Q2 (Months 4-6)** | Service Layer & Streaming | Extract service layer, consolidate gRPC/tRPC on shared services, migrate to AI SDK for all LLM paths, implement real SSE streaming, deploy multi-worker instances |
| **Q3 (Months 7-9)** | Scale & Performance | GPU embedding microservice, Redis Cluster or Upstash, Weaviate multi-node, SQL read replicas, implement caching in hot paths, load testing |
| **Q4 (Months 10-12)** | Enterprise Features | Event bus (Redis Streams), cost-aware model routing, multi-region deployment prep, SOC2 compliance audit, disaster recovery testing, monitoring dashboards |
