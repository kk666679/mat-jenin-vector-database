# Matjenin AI Platform - Execution-Ready Implementation Roadmap

**Document Type:** Principal Engineering Implementation Plan  
**Date:** 24 February 2026  
**Based On:** ARCHITECTURE_CONSOLIDATION.md (24 Feb 2026)  
**Platform Version:** 1.0.15  
**Target Version:** 2.0.0 (Production-Ready Enterprise)

---

## Executive Summary

This document translates the architectural audit findings into a phased, dependency-ordered implementation roadmap with 6 phases spanning 12 months. Current enterprise-readiness score is **5.3/10**. The plan targets **8.5/10** by completion, resolving all P0 security vulnerabilities within Phase 1 (first 4 weeks) and achieving full production readiness by Phase 3 (month 4).

---

## Phase Overview

| Phase | Name | Duration | Focus | Entry Criteria | Exit Criteria |
|:-----:|------|:--------:|-------|----------------|---------------|
| **1** | Security Hardening | Weeks 1-4 | P0 vulnerabilities, auth, tenant enforcement | Architecture audit complete | All P0 risks mitigated, JWT auth live, gRPC secured |
| **2** | Service Layer Extraction | Weeks 5-10 | Business logic consolidation, LLM migration | Phase 1 complete | tRPC + gRPC share services, AI SDK is sole LLM path |
| **3** | Observability & Reliability | Weeks 11-16 | OpenTelemetry, structured logging, rate limiting, idempotency | Phase 2 complete | Distributed tracing live, rate limiting enforced, worker idempotent |
| **4** | Performance & Scale | Weeks 17-24 | Embedding microservice, caching, multi-worker, streaming | Phase 3 complete | Real SSE streaming, GPU embeddings, cache hit rate >60% |
| **5** | Enterprise Features | Weeks 25-36 | Cost routing, A/B testing, multi-region prep, event bus | Phase 4 complete | Cost-aware routing, audit-complete, deployment automated |
| **6** | Multi-Region & Advanced AI | Weeks 37-48 | Geo-distribution, edge inference, advanced RAG | Phase 5 complete | Multi-region active, edge inference POC, platform score 8.5+ |

---

## Phase 1: Security Hardening (Weeks 1-4)

### Milestone 1.1: JWT Authentication Implementation

**Priority:** P0 | **Risk if skipped:** Cross-tenant data breach  
**Estimated Complexity:** Medium | **Files Affected:** 4-6

#### Background

`server/trpc/context.ts` currently reads `x-tenant-id`, `x-user-id`, and `x-user-role` directly from request headers without cryptographic verification. The `JWT_SECRET` config exists in `sdk/shared/config.ts` but no `jsonwebtoken.verify()` call is present anywhere. Any HTTP client can impersonate any tenant/user by setting headers.

#### Task Breakdown

| # | Task | Description | File(s) | Depends On |
|:-:|------|-------------|---------|:----------:|
| 1.1.1 | Add `jsonwebtoken` dependency | Install `jsonwebtoken` + `@types/jsonwebtoken` to package.json | `package.json` | -- |
| 1.1.2 | Create auth utility module | Build `sdk/auth/index.ts` with `verifyJWT(token: string): AuthPayload`, `signJWT(payload: AuthPayload): string`, and `hashPassword()`/`verifyPassword()` using bcrypt. Use `JWT_SECRET` and `JWT_EXPIRES_IN` from existing config. | `sdk/auth/index.ts` (new) | 1.1.1 |
| 1.1.3 | Rewrite `createContext()` | Replace header-trust with JWT verification. Extract `authorization: Bearer <token>` header, call `verifyJWT()`, derive `tenantId`, `userId`, `userRole` from verified payload. Fall back to API key validation via `ApiKey.keyHash` lookup. Remove `x-user-id`/`x-user-role` header extraction. Keep `x-tenant-id` only as a hint validated against JWT claims. | `server/trpc/context.ts` | 1.1.2 |
| 1.1.4 | Create login/register API routes | Add `app/api/auth/login/route.ts` and `app/api/auth/register/route.ts`. Login: validate credentials against `User.passwordHash`, create `Session`, return signed JWT. Register: hash password, create `User` + `Tenant` (if new). | `app/api/auth/login/route.ts` (new), `app/api/auth/register/route.ts` (new) | 1.1.2, 1.1.3 |
| 1.1.5 | Add refresh token rotation | Implement `app/api/auth/refresh/route.ts`. Validate refresh token from `Session.refreshToken`, issue new access + refresh tokens, invalidate old refresh token (rotate). | `app/api/auth/refresh/route.ts` (new) | 1.1.4 |
| 1.1.6 | Update tRPC client headers | Modify `lib/trpc/client.ts` to attach `Authorization: Bearer <token>` from stored session instead of raw `x-user-id` headers. | `lib/trpc/client.ts` | 1.1.4 |

#### Technical Dependencies
- `jsonwebtoken` ^9.x, `bcryptjs` ^2.x (or `bcrypt` ^5.x)
- Existing: `sdk/shared/config.ts` (`JWT_SECRET`, `JWT_EXPIRES_IN`)
- Existing: Prisma schema (`User`, `Session`, `ApiKey` models already defined)

#### Risk Analysis
| Risk | Probability | Mitigation |
|------|:-----------:|------------|
| Breaking existing frontend auth flow | HIGH | Implement backward-compatible header mode behind `LEGACY_AUTH_HEADERS=true` env flag during migration window (2 weeks) |
| JWT secret rotation during deployment | MEDIUM | Support `JWT_SECRET_PREVIOUS` for verifying tokens signed with old key |

#### Team Role Mapping
- **Backend Engineer (Lead):** Tasks 1.1.2, 1.1.3
- **Backend Engineer:** Tasks 1.1.4, 1.1.5
- **Frontend Engineer:** Task 1.1.6
- **Security Reviewer:** Code review all tasks

---

### Milestone 1.2: gRPC Authentication

**Priority:** P0 | **Risk if skipped:** Unauthenticated service-to-service access  
**Estimated Complexity:** Medium | **Files Affected:** 3-4

#### Background

`server/grpc/server.ts` uses `grpc.ServerCredentials.createInsecure()` with zero authentication. Any network client can call all RPC methods. The `AIServiceImpl` accepts `tenantId` as a request field with no verification.

#### Task Breakdown

| # | Task | Description | File(s) | Depends On |
|:-:|------|-------------|---------|:----------:|
| 1.2.1 | Implement gRPC interceptor for JWT | Create `server/grpc/interceptors.ts` with a unary interceptor that extracts JWT from `metadata.get('authorization')`, verifies it using `sdk/auth`, and injects verified `tenantId`/`userId` into the call context. Reject with `grpc.status.UNAUTHENTICATED` on failure. | `server/grpc/interceptors.ts` (new) | 1.1.2 |
| 1.2.2 | Apply interceptor to server | Modify `GrpcServer.registerHandlers()` to use the auth interceptor. Update all handler wrappers to read verified context instead of trusting `call.request.tenantId`. | `server/grpc/server.ts` | 1.2.1 |
| 1.2.3 | Add TLS support | Replace `createInsecure()` with `createSsl()` using cert/key from env (`GRPC_TLS_CERT`, `GRPC_TLS_KEY`). Keep insecure as fallback for local dev. | `server/grpc/server.ts` | -- |
| 1.2.4 | Update `mapError()` | Replace catch-all `grpc.status.INTERNAL` with proper mapping: `NOT_FOUND` -> `grpc.status.NOT_FOUND`, `UNAUTHORIZED` -> `grpc.status.UNAUTHENTICATED`, `FORBIDDEN` -> `grpc.status.PERMISSION_DENIED`, validation errors -> `grpc.status.INVALID_ARGUMENT`. | `server/grpc/server.ts` | -- |

---

### Milestone 1.3: Tenant Isolation Enforcement

**Priority:** P0 | **Risk if skipped:** Cross-tenant data modification  
**Estimated Complexity:** Medium | **Files Affected:** 5-8

#### Background

Tenant isolation relies entirely on manual `WHERE tenantId = ctx.tenantId` in every query. The `webhookRouter.update` mutation updates by `id` alone without verifying `tenantId`. There is no Prisma middleware enforcing tenant scope.

#### Task Breakdown

| # | Task | Description | File(s) | Depends On |
|:-:|------|-------------|---------|:----------:|
| 1.3.1 | Audit all mutations for tenant checks | Grep all `.update(`, `.delete(`, `.create(` calls across routers and gRPC service. Document every mutation missing `tenantId` in its `where` clause. | All router files, `server/grpc/aiservice.ts` | -- |
| 1.3.2 | Fix `webhookRouter.update` | Add `tenantId` to the `where` clause. Add `findFirst({ where: { id, tenantId } })` guard before update. | `server/trpc/routers/webhook.ts` | 1.3.1 |
| 1.3.3 | Fix gRPC `updateDocument` | The current implementation passes `tenantId` to `where: { id, tenantId }` which is correct in Prisma 7.x compound where. Verify this actually filters. Add explicit `findFirst` guard. | `server/grpc/aiservice.ts` | 1.3.1 |
| 1.3.4 | Implement Prisma Client Extension for tenant | Create `sdk/db/tenant-extension.ts` using Prisma Client Extensions (`$extends`) to automatically inject `tenantId` into all `findMany`, `findFirst`, `update`, `delete` queries on tenant-scoped models. This is defense-in-depth alongside manual filters. | `sdk/db/tenant-extension.ts` (new), `sdk/db/prisma.ts` | -- |
| 1.3.5 | Add tenant ownership assertion helper | Create `sdk/shared/guards.ts` with `assertTenantOwnership(entity: { tenantId: string }, ctx: { tenantId: string })` that throws if mismatched. Use in all mutation procedures. | `sdk/shared/guards.ts` (new) | -- |

---

### Milestone 1.4: Input Sanitization & Validation Hardening

**Priority:** P1 | **Estimated Complexity:** Low | **Files Affected:** 3-5

| # | Task | Description | File(s) | Depends On |
|:-:|------|-------------|---------|:----------:|
| 1.4.1 | Add content-length limits | Enforce `MAX_FILE_SIZE_MB` (50MB from config) on document creation. Add `.max()` to `content` field in `CreateDocumentInputSchema`. | `server/trpc/routers/document.ts` | -- |
| 1.4.2 | Sanitize HTML/XSS in user inputs | Add `xss` or `sanitize-html` dependency. Apply to document `title` and `content` before storage. | `server/trpc/routers/document.ts`, `package.json` | -- |
| 1.4.3 | Validate webhook URLs | In `webhookRouter.create`, validate URL scheme (https only in production), reject private IPs (SSRF prevention), validate hostname resolution. | `server/trpc/routers/webhook.ts` | -- |

#### Phase 1 Deployment Plan

1. **Week 1-2:** Deploy JWT auth with `LEGACY_AUTH_HEADERS=true` (both old and new auth work)
2. **Week 3:** Frontend migration to Bearer tokens; set `LEGACY_AUTH_HEADERS=false` in staging
3. **Week 4:** Disable legacy headers in production; deploy gRPC auth + TLS; deploy tenant extension

#### Phase 1 Testing Strategy

| Test Type | Scope | Tool |
|-----------|-------|------|
| Unit | `sdk/auth/` functions (sign, verify, hash, compare) | Vitest |
| Integration | `createContext()` with valid/invalid/expired JWT | Vitest + mock Request |
| Integration | tRPC procedure calls with/without auth | tRPC test client |
| Security | Attempt cross-tenant access with spoofed headers | Manual penetration test |
| Security | gRPC calls without metadata JWT | gRPC test client |
| Regression | All existing tRPC procedures still functional | Existing test suite |

---

## Phase 2: Service Layer Extraction (Weeks 5-10)

### Milestone 2.1: Core Service Layer

**Priority:** P1 | **Risk if skipped:** Business logic duplication compounds with every new feature  
**Estimated Complexity:** High | **Files Affected:** 15-20

#### Background

Business logic is duplicated between tRPC routers (`server/trpc/routers/*.ts`) and gRPC service (`server/grpc/aiservice.ts`). The `queryRouter.search` contains ~80 lines of RAG orchestration inline. The `documentRouter` mixes CRUD with queue dispatch. The worker (`app/worker/index.ts`) independently implements document processing with its own Prisma client.

#### Task Breakdown

| # | Task | Description | File(s) | Depends On |
|:-:|------|-------------|---------|:----------:|
| 2.1.1 | Create `services/` directory structure | Create `services/document.service.ts`, `services/rag.service.ts`, `services/conversation.service.ts`, `services/webhook.service.ts`, `services/dashboard.service.ts`, `services/index.ts`. | `services/` (new directory) | Phase 1 |
| 2.1.2 | Extract `DocumentService` | Move all document CRUD logic from `documentRouter` into `DocumentService`. Methods: `list(tenantId, filters)`, `getById(tenantId, id)`, `create(tenantId, userId, data)`, `update(tenantId, id, data)`, `delete(tenantId, id)`, `getStats(tenantId)`. Service handles Prisma calls, tenant validation, queue dispatch, and audit logging. | `services/document.service.ts` | 2.1.1 |
| 2.1.3 | Extract `RAGService` | Move search + RAG orchestration from `queryRouter.search` into `RAGService`. Methods: `search(tenantId, query, options)`, `searchOnly(tenantId, query, topK)`. Service handles vector search with fallback chain (Pinecone -> Weaviate -> SQL), LLM generation, response formatting. | `services/rag.service.ts` | 2.1.1 |
| 2.1.4 | Extract `ConversationService` | Move conversation CRUD from `queryRouter` into `ConversationService`. Methods: `list(tenantId, userId, pagination)`, `getMessages(tenantId, userId, conversationId, pagination)`, `create(tenantId, userId, title)`, `delete(tenantId, userId, id)`. | `services/conversation.service.ts` | 2.1.1 |
| 2.1.5 | Extract `WebhookService` refactor | Refactor existing `sdk/webhook/index.ts` (which imports from `@/prisma/client`) to import from `@/sdk/db/prisma` instead. Move business orchestration to `services/webhook.service.ts`, keeping SDK-level delivery mechanics in `sdk/webhook/`. | `services/webhook.service.ts`, `sdk/webhook/index.ts` | 2.1.1 |
| 2.1.6 | Refactor tRPC routers to delegate | Rewrite all tRPC routers to be thin wrappers: validate input (Zod) -> call service method -> return result. Each procedure body should be 5-15 lines maximum. | `server/trpc/routers/*.ts` | 2.1.2-2.1.5 |
| 2.1.7 | Refactor gRPC `AIServiceImpl` to delegate | Rewrite `AIServiceImpl` to delegate all methods to shared services. Remove its own `PrismaClient` instance. Each handler: extract params from request -> call service -> map to proto response. | `server/grpc/aiservice.ts` | 2.1.2-2.1.5 |
| 2.1.8 | Refactor worker to use `DocumentService` | Update `app/worker/index.ts` to use `DocumentService.processDocument()` instead of inline Prisma queries. Remove worker-specific `PrismaClient` instance. | `app/worker/index.ts` | 2.1.2 |

#### Architecture After Extraction

```
tRPC Router  ──┐
                ├──> Service Layer ──> SDK Layer ──> Data Stores
gRPC Handler ──┤         │
                │    (business logic,
Worker ────────┘     orchestration,
                     transactions)
```

---

### Milestone 2.2: LLM Layer Consolidation

**Priority:** P2 | **Risk if skipped:** Two codepaths for LLM; legacy path has fake streaming  
**Estimated Complexity:** Medium | **Files Affected:** 5-8

#### Background

Two LLM integration layers coexist:
1. **Legacy:** `sdk/llm/index.ts` -- `LLMClient` class with raw `fetch()` calls. Used by `queryRouter.search` via `createRAGPipeline()`. Has a fake streaming implementation (`queryStream()` awaits full response then yields once).
2. **Modern:** `sdk/llm/ai-sdk.ts` -- AI SDK v6 with `streamTextAI()`, `generateTextAI()`, `generateObjectAI()`. Supports real streaming, structured output, tool calling. **Not wired into any router.**

#### Task Breakdown

| # | Task | Description | File(s) | Depends On |
|:-:|------|-------------|---------|:----------:|
| 2.2.1 | Wire `RAGPipelineAI` into `RAGService` | Replace `createRAGPipeline()` (legacy) with `RAGPipelineAI` (AI SDK) in `services/rag.service.ts`. Use `generateTextAI()` for non-streaming, `streamTextAI()` for streaming. | `services/rag.service.ts` | 2.1.3 |
| 2.2.2 | Implement real SSE streaming endpoint | Rewrite `app/api/query/stream/route.ts` to use `streamTextAI()` returning a proper `ReadableStream` with SSE format. Connect to `RAGService.streamSearch()`. | `app/api/query/stream/route.ts` | 2.2.1 |
| 2.2.3 | Wire gRPC `streamText` handler | Replace stub in `server/grpc/server.ts` with real server-side streaming using `RAGService.streamSearch()` piped to `call.write()` chunks. | `server/grpc/server.ts` | 2.2.1 |
| 2.2.4 | Deprecate legacy `LLMClient` | Add `@deprecated` JSDoc annotations to all exports in `sdk/llm/index.ts`. Remove all import references. Keep file for backward compatibility for 1 release cycle. | `sdk/llm/index.ts` | 2.2.1-2.2.3 |
| 2.2.5 | Standardize provider configuration | Consolidate provider instantiation. Currently `sdk/llm/ai-sdk.ts` has lazy-loaded providers (`getOpenAIProvider()`, etc.) while `sdk/models/providers/*.ts` has separate model registries. Unify: services request models by capability string, `sdk/models/` resolves to concrete provider + model ID, `sdk/llm/ai-sdk.ts` instantiates. | `sdk/models/index.ts`, `sdk/llm/ai-sdk.ts` | 2.2.1 |

---

### Milestone 2.3: Dependency Injection Foundation

**Priority:** P2 | **Estimated Complexity:** Medium | **Files Affected:** 8-12

| # | Task | Description | File(s) | Depends On |
|:-:|------|-------------|---------|:----------:|
| 2.3.1 | Define service interfaces | Create `services/interfaces.ts` with `IDocumentService`, `IRAGService`, `IConversationService`, `IWebhookService` interfaces. Services implement these interfaces. | `services/interfaces.ts` (new) | 2.1.2-2.1.5 |
| 2.3.2 | Create service container | Build `services/container.ts` -- a simple factory that returns service instances with SDK dependencies injected. Pattern: `createServices({ prisma, vectorClient, llmClient, cache, queue })`. Enables test mocking. | `services/container.ts` (new) | 2.3.1 |
| 2.3.3 | Wire container into tRPC context | In `createContext()`, instantiate the service container once per request (or use singleton). Attach to `ctx.services` so procedures access `ctx.services.documents.create(...)`. | `server/trpc/context.ts` | 2.3.2 |
| 2.3.4 | Wire container into gRPC | In `GrpcServer` constructor, instantiate service container. Pass to `AIServiceImpl` constructor. | `server/grpc/server.ts`, `server/grpc/aiservice.ts` | 2.3.2 |

#### Phase 2 Testing Strategy

| Test Type | Scope | Tool |
|-----------|-------|------|
| Unit | Each service method in isolation with mocked SDK | Vitest |
| Integration | Service -> Prisma -> Test DB round-trip | Vitest + Docker test DB |
| Contract | tRPC router produces same outputs after refactor | Snapshot tests |
| Contract | gRPC responses match proto schema | gRPC test client + proto validation |
| E2E | Document upload -> queue -> worker -> completion | Docker Compose test environment |

---

## Phase 3: Observability & Reliability (Weeks 11-16)

### Milestone 3.1: OpenTelemetry Wiring

**Priority:** P1 | **Risk if skipped:** Zero production visibility  
**Estimated Complexity:** Medium | **Files Affected:** 6-10

#### Background

`@opentelemetry/core`, `@opentelemetry/resources`, `@opentelemetry/sdk-trace-base`, and `@opentelemetry/instrumentation-grpc` are already in `package.json` but no initialization code exists. The `traceId` in queue jobs is a manually generated UUID unconnected to any tracing backend.

#### Task Breakdown

| # | Task | Description | File(s) | Depends On |
|:-:|------|-------------|---------|:----------:|
| 3.1.1 | Create OTel initialization module | Build `sdk/observability/index.ts` with `initTracing()`: create `NodeTracerProvider`, register `GrpcInstrumentation` and HTTP instrumentation, configure OTLP exporter to `OTEL_EXPORTER_OTLP_ENDPOINT`. Export `getTracer()` helper. | `sdk/observability/index.ts` (new) | -- |
| 3.1.2 | Initialize tracing at startup | Call `initTracing()` in Next.js `instrumentation.ts` hook (App Router), worker entrypoint, and gRPC server entrypoint. Must execute before any other imports. | `instrumentation.ts` (new), `app/worker/index.ts`, `server/grpc/server.ts` | 3.1.1 |
| 3.1.3 | Add spans to service layer | Wrap key service methods with `tracer.startActiveSpan()`: `RAGService.search` (with child spans for vector search, LLM call), `DocumentService.create`, worker `processDocumentJob`. Attach `tenantId` as span attribute. | `services/*.service.ts` | 3.1.1, Phase 2 |
| 3.1.4 | Connect queue traceId to OTel | Replace `generateTraceId()` UUID in `sdk/queue/index.ts` with OTel `trace.getActiveSpan()?.spanContext().traceId`. In worker, create child span from propagated traceId using W3C Trace Context. | `sdk/queue/index.ts`, `app/worker/index.ts` | 3.1.1 |
| 3.1.5 | Add Docker Compose Jaeger | Add Jaeger all-in-one container to `docker-compose.yml` for local trace visualization. Set `OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318`. | `docker-compose.yml` | -- |

---

### Milestone 3.2: Structured Logging

**Priority:** P1 | **Estimated Complexity:** Low-Medium | **Files Affected:** 10-15

| # | Task | Description | File(s) | Depends On |
|:-:|------|-------------|---------|:----------:|
| 3.2.1 | Add `pino` logger | Install `pino` + `pino-pretty` (dev). Create `sdk/observability/logger.ts` with `createLogger(context)` that includes `tenantId`, `requestId`, `traceId` in every log line. JSON format in production, pretty in dev. | `sdk/observability/logger.ts` (new), `package.json` | -- |
| 3.2.2 | Replace all `console.log` | Systematically replace every `console.log`, `console.error` across SDK, services, routers, and worker with structured logger calls. Grep pattern: `console\.(log|error|warn)`. | All files with console usage | 3.2.1 |
| 3.2.3 | Add request logging middleware | Replace `loggingMiddleware` in `server/trpc/trpc.ts` (currently dev-only `console.log`) with structured logger that always logs: path, type, duration, tenantId, userId, statusCode. | `server/trpc/trpc.ts` | 3.2.1 |

---

### Milestone 3.3: Rate Limiting Activation

**Priority:** P1 | **Estimated Complexity:** Low | **Files Affected:** 2-3

#### Background

`rateLimitMiddleware` in `server/trpc/trpc.ts` is a TODO placeholder. `checkRateLimit()` in `sdk/cache/index.ts` is a **fully implemented** sliding-window algorithm using Redis sorted sets. `Tenant.rateLimitRpm` and `rateLimitRph` columns exist in the schema but are not enforced.

| # | Task | Description | File(s) | Depends On |
|:-:|------|-------------|---------|:----------:|
| 3.3.1 | Wire rate limit middleware | Replace TODO in `rateLimitMiddleware` with: look up `Tenant.rateLimitRpm` from cache/DB, call `checkRateLimit(ctx.tenantId, tenant.rateLimitRpm, 60)`. On `!allowed`, throw `TRPCError({ code: 'TOO_MANY_REQUESTS' })` with `Retry-After` header. | `server/trpc/trpc.ts` | Phase 1 (auth) |
| 3.3.2 | Add rate limit headers to responses | In `loggingMiddleware` or a new response middleware, add `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers to every response. | `server/trpc/trpc.ts` | 3.3.1 |
| 3.3.3 | Add rate limiting to gRPC | Create gRPC interceptor that calls the same `checkRateLimit()` for gRPC requests. | `server/grpc/interceptors.ts` | 3.3.1 |

---

### Milestone 3.4: Worker Idempotency & Reliability

**Priority:** P2 | **Estimated Complexity:** Low-Medium | **Files Affected:** 2-4

| # | Task | Description | File(s) | Depends On |
|:-:|------|-------------|---------|:----------:|
| 3.4.1 | Make document processing idempotent | Before creating chunks, delete existing chunks: `DELETE FROM DocumentChunk WHERE documentId = ?`. This prevents duplicates on retry. Wrap in transaction with document status update. | `services/document.service.ts` (or worker) | Phase 2 |
| 3.4.2 | Add dead-letter queue handling | Configure BullMQ `failedJobHandler` to move jobs exceeding `maxAttempts` to a dead-letter queue. Add dashboard visibility for failed jobs. | `sdk/queue/index.ts` | -- |
| 3.4.3 | Add health check endpoint for worker | Create an HTTP health endpoint in the worker process (simple Express/Fastify on port 3001) returning queue depth, active jobs, and worker status. Used by Docker/K8s health checks. | `app/worker/index.ts` | -- |
| 3.4.4 | Handle fire-and-forget queue failures | In `DocumentService.create()`, if `addDocumentJob()` fails, update document status to `'failed'` with error message instead of silently swallowing. Currently: `.catch(console.error)`. | `services/document.service.ts` | Phase 2 |

---

### Milestone 3.5: Cache Utilization

**Priority:** P2 | **Estimated Complexity:** Low | **Files Affected:** 3-5

| # | Task | Description | File(s) | Depends On |
|:-:|------|-------------|---------|:----------:|
| 3.5.1 | Cache tenant config | On first request per tenant, load `Tenant` record and cache with `setTenantCache(tenantId, 'config', tenant, { ttl: 300 })`. Use for rate limit lookups, plan checks. Invalidate on tenant update. | `services/tenant.service.ts` (new or part of existing) | -- |
| 3.5.2 | Cache search results | In `RAGService.search()`, check `getCache(CACHE_KEYS.searchResults(tenantId, queryHash))` before executing vector search. Cache results with TTL=300s. Invalidate on document create/delete for that tenant. | `services/rag.service.ts` | Phase 2 |
| 3.5.3 | Cache document metadata | Cache `Document` records on read with TTL=60s. Invalidate on mutation. | `services/document.service.ts` | Phase 2 |

#### Phase 3 Deployment Plan

1. **Week 11-12:** Deploy OTel + Jaeger in staging. Validate traces flow end-to-end.
2. **Week 13:** Deploy structured logging. Monitor log volume and adjust levels.
3. **Week 14:** Enable rate limiting in staging with generous limits. Monitor false positives.
4. **Week 15:** Production rollout of OTel + logging + rate limiting.
5. **Week 16:** Worker idempotency + cache utilization.

---

## Phase 4: Performance & Scale (Weeks 17-24)

### Milestone 4.1: Embedding Microservice

**Priority:** P1 | **Risk if skipped:** CPU bottleneck under load (Transformers.js is CPU-bound in Node.js)  
**Estimated Complexity:** High | **Files Affected:** 5-8 + new service

| # | Task | Description | File(s) | Depends On |
|:-:|------|-------------|---------|:----------:|
| 4.1.1 | Create Python embedding service | Build `services/embedding-service/` with FastAPI. Endpoints: `POST /embed` (single text -> vector), `POST /embed/batch` (batch texts -> vectors). Use `sentence-transformers/all-MiniLM-L6-v2` with GPU support. Or: use OpenAI `text-embedding-3-small` API for managed hosting. | `services/embedding-service/` (new) | -- |
| 4.1.2 | Define embedding gRPC interface | The existing `sdk/proto/ai-service.proto` already defines `Inference` and `BatchInference` RPCs. Extend or use for embedding requests. | `sdk/proto/ai-service.proto` | -- |
| 4.1.3 | Create embedding SDK client | Build `sdk/vector/embedding-client.ts` that calls the embedding microservice (HTTP or gRPC). Fallback to local Transformers.js if microservice unavailable. | `sdk/vector/embedding-client.ts` (new) | 4.1.1 |
| 4.1.4 | Add Docker Compose service | Add embedding service container to `docker-compose.yml` with GPU passthrough support. | `docker-compose.yml` | 4.1.1 |
| 4.1.5 | Add embedding cache | Cache embeddings by content hash in Redis. Identical content chunks across documents skip re-computation. Key: `emb:{sha256(content)}`, TTL: 24h. | `sdk/vector/embedding-client.ts` | 4.1.3 |

---

### Milestone 4.2: Real Streaming Pipeline

**Priority:** P2 | **Estimated Complexity:** Medium | **Files Affected:** 4-6

| # | Task | Description | File(s) | Depends On |
|:-:|------|-------------|---------|:----------:|
| 4.2.1 | Implement SSE endpoint with AI SDK | `app/api/query/stream/route.ts`: Accept query, run vector search, pipe context + query to `streamTextAI()`. Return `ReadableStream` with proper SSE headers (`text/event-stream`). Include source citations as a final SSE event. | `app/api/query/stream/route.ts` | 2.2.1 |
| 4.2.2 | Update chat UI for streaming | Modify `app/chat/page.tsx` and related components to use `EventSource` or `fetch` streaming. Display tokens incrementally. Show sources after stream completes. | `app/chat/page.tsx`, chat components | 4.2.1 |
| 4.2.3 | Edge Runtime for streaming routes | Annotate streaming route with `export const runtime = 'edge'` for minimal TTFB on Vercel. | `app/api/query/stream/route.ts` | 4.2.1 |

---

### Milestone 4.3: Multi-Worker & Database Optimization

**Priority:** P2 | **Estimated Complexity:** Medium | **Files Affected:** 4-6

| # | Task | Description | File(s) | Depends On |
|:-:|------|-------------|---------|:----------:|
| 4.3.1 | Docker multi-worker support | Update `docker-compose.yml` to run N worker replicas. BullMQ natively distributes jobs across workers sharing the same Redis queue. | `docker-compose.yml`, `Dockerfile.worker` | -- |
| 4.3.2 | Batch SQL inserts | Replace sequential `prisma.documentChunk.create()` per chunk with `prisma.documentChunk.createMany()` in the worker. Reduces round-trips from N to 1 per document. | `services/document.service.ts` | Phase 2 |
| 4.3.3 | Connection pooling | Configure Prisma connection pool limits: `datasource db { ... }` with `connection_limit` based on `max_connections / worker_count`. Add `PRISMA_CONNECTION_LIMIT` to env config. | `sdk/db/prisma/schema.prisma`, `sdk/shared/config.ts` | -- |
| 4.3.4 | SQL read replica support | Add `REPLICA_DATABASE_URL` config. Use `$extends` with read replica for all read queries (list, search, stats). Write queries go to primary. | `sdk/db/prisma.ts` | -- |

---

## Phase 5: Enterprise Features (Weeks 25-36)

### Milestone 5.1: Cost-Aware AI Routing

| # | Task | Description | Depends On |
|:-:|------|-------------|:----------:|
| 5.1.1 | Define cost tiers per model | Add `inputCostPer1kTokens`, `outputCostPer1kTokens` to `sdk/models/capabilities.ts` model definitions. | -- |
| 5.1.2 | Map tenant plans to budgets | Add `monthlyCostBudget` column to `Tenant` model. Free=$5, Pro=$50, Enterprise=unlimited. | -- |
| 5.1.3 | Implement budget-checking middleware | Before LLM calls, check `UsageMetric.tokens_used` for current month against budget. Auto-downgrade to cheaper model if >80% spent. Block at 100%. | 5.1.1, 5.1.2 |
| 5.1.4 | Cost dashboard | Surface per-tenant cost data in `dashboardRouter` using existing `UsageMetric` infrastructure. | 5.1.3 |

### Milestone 5.2: Event-Driven Architecture Foundation

| # | Task | Description | Depends On |
|:-:|------|-------------|:----------:|
| 5.2.1 | Implement event bus | Create `sdk/events/index.ts` using Redis Streams (via existing Redis). Events: `document.created`, `document.processed`, `document.failed`, `query.completed`. | -- |
| 5.2.2 | Replace fire-and-forget dispatching | `DocumentService.create()` publishes `document.created` event. Queue listener subscribes and dispatches BullMQ job. Webhook listener subscribes and triggers webhooks. Metrics listener records usage. | 5.2.1 |
| 5.2.3 | Add event sourcing for audit | `AuditLog` inserts driven by event subscriptions instead of inline calls. Every domain event automatically generates an audit record. | 5.2.1 |

### Milestone 5.3: Automated Deployment Pipeline

| # | Task | Description | Depends On |
|:-:|------|-------------|:----------:|
| 5.3.1 | GitHub Actions CI/CD | Pipeline: lint -> typecheck -> test -> build -> Prisma migrate -> deploy. Separate jobs for Next.js (Vercel), worker (Docker), gRPC (Docker). | Phase 3 (tests) |
| 5.3.2 | Database migration automation | `prisma migrate deploy` in CI. Add migration diffing to PRs via `prisma migrate diff`. | -- |
| 5.3.3 | Canary deployment for workers | Deploy new worker version alongside old. Route 10% of new jobs. Monitor error rate. Promote or rollback. | 5.3.1 |

---

## Phase 6: Multi-Region & Advanced AI (Weeks 37-48)

### Milestone 6.1: Multi-Region Preparation

| # | Task | Description | Depends On |
|:-:|------|-------------|:----------:|
| 6.1.1 | Vercel Edge deployment | Deploy Next.js to Vercel with regional Edge Functions. Streaming routes on Edge Runtime. | Phase 4 |
| 6.1.2 | Global Redis | Migrate from self-hosted Redis to Upstash Global Redis for sub-10ms worldwide cache reads. | -- |
| 6.1.3 | SQL geo-replication | Azure SQL with geo-replication (read replicas in EU/APAC). Configure Prisma read replica routing by request origin. | 4.3.4 |
| 6.1.4 | Regional worker pools | Deploy worker clusters per region reading from region-specific Redis queues. Route jobs by tenant region. | Phase 4 |

### Milestone 6.2: Advanced RAG

| # | Task | Description | Depends On |
|:-:|------|-------------|:----------:|
| 6.2.1 | Hybrid search scoring | Combine vector similarity (Weaviate/Pinecone) with BM25 keyword scoring in `HybridQueryOptimizer`. Configurable weight parameter. | Phase 2 |
| 6.2.2 | Re-ranking pipeline | Add cross-encoder re-ranking step after initial retrieval. Use Cohere Rerank or local cross-encoder model. | 6.2.1 |
| 6.2.3 | Prompt versioning | Store prompt templates in DB with version numbers. A/B test different prompt structures per tenant. | Phase 2 |
| 6.2.4 | Context window optimization | Implement token-aware context building. Use `tiktoken` to measure chunk tokens. Fill context window optimally instead of fixed `topK` chunks. | Phase 2 |

### Milestone 6.3: Model A/B Testing

| # | Task | Description | Depends On |
|:-:|------|-------------|:----------:|
| 6.3.1 | Shadow traffic infrastructure | Use `DeploymentStrategy` types (already defined in `sdk/ml/types.ts`) to implement shadow mode: send requests to both production and candidate models, compare responses, log differences. | Phase 5 |
| 6.3.2 | Canary model routing | Route configurable % of requests per tenant to candidate model. Monitor latency, quality scores, cost. | 6.3.1 |
| 6.3.3 | Quality evaluation pipeline | Automated evaluation: relevance scoring, factual accuracy vs source documents, response latency, cost per query. | 6.3.2 |

---

## Infrastructure Sequencing

```
Week 1   [JWT Auth]────────────────────────────────────────────────────>
Week 2   [gRPC Auth]──>[Tenant Guards]                                 
Week 3   [Input Validation]──>[Frontend Auth Migration]                
Week 4   [Legacy Auth Removal]                                         
Week 5   [Service Interfaces]──>[DocumentService]──>[RAGService]       
Week 7   [ConversationService]──>[WebhookService]                      
Week 8   [Router Refactor]──>[gRPC Refactor]──>[Worker Refactor]       
Week 9   [AI SDK Migration]──>[SSE Streaming]──>[Legacy Deprecation]   
Week 10  [DI Container]                                                
Week 11  [OTel Init]──>[Jaeger Docker]──>[Span Instrumentation]        
Week 13  [Pino Logger]──>[Replace console.log]                         
Week 14  [Rate Limit Activation]──>[gRPC Rate Limit]                   
Week 15  [Worker Idempotency]──>[DLQ]──>[Cache Utilization]            
Week 17  [Embedding Microservice]──>[Embedding Cache]                  
Week 19  [Multi-Worker]──>[Batch Inserts]──>[Connection Pooling]       
Week 21  [Real Streaming]──>[Edge Runtime]                             
Week 25  [Cost Routing]──>[Event Bus]──>[CI/CD Pipeline]               
Week 37  [Multi-Region]──>[Advanced RAG]──>[A/B Testing]               
```

---

## Team Role Matrix

| Role | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 |
|------|:-------:|:-------:|:-------:|:-------:|:-------:|:-------:|
| **Backend Lead** | Auth system, tenant guards | Service extraction, DI | OTel, rate limiting | Embedding service, DB optimization | Event bus, cost routing | Multi-region |
| **Backend Engineer** | gRPC auth, API routes | Router/gRPC refactor | Structured logging, worker reliability | Multi-worker, streaming | CI/CD, canary deploy | Advanced RAG |
| **Frontend Engineer** | Auth migration, token management | -- | -- | Streaming UI, chat improvements | Cost dashboard | -- |
| **DevOps/SRE** | -- | -- | Jaeger setup, Docker config | Embedding Docker, replicas | Pipeline automation | Regional deployment |
| **Security Engineer** | Code review all Phase 1, penetration test | -- | Rate limit tuning | -- | Audit compliance | -- |
| **QA Engineer** | Auth regression testing | Contract tests, E2E | Load testing rate limits | Performance benchmarks | Integration testing | Multi-region validation |

---

## Complexity Estimation Summary

| Phase | Total Tasks | Low | Medium | High | Critical Path |
|:-----:|:----------:|:---:|:------:|:----:|---------------|
| 1 | 15 | 3 | 10 | 2 | JWT -> Context rewrite -> Frontend migration |
| 2 | 13 | 2 | 7 | 4 | Service interfaces -> Extraction -> Router refactor -> LLM migration |
| 3 | 14 | 6 | 6 | 2 | OTel init -> Span instrumentation -> Rate limit activation |
| 4 | 10 | 2 | 5 | 3 | Embedding service -> Cache -> Multi-worker |
| 5 | 10 | 3 | 5 | 2 | Event bus -> Cost routing -> CI/CD |
| 6 | 10 | 2 | 5 | 3 | Multi-region -> Advanced RAG -> A/B testing |

---

## Production Hardening Checklist

### Before Phase 1 Completion (Week 4)
- [ ] JWT verification active on all tRPC procedures
- [ ] gRPC server uses TLS + JWT interceptor
- [ ] All mutations verified for tenant ownership
- [ ] Legacy auth headers disabled
- [ ] Input validation hardened (XSS, content limits)
- [ ] Penetration test passed

### Before Phase 3 Completion (Week 16)
- [ ] Distributed traces flowing to collector
- [ ] Structured JSON logging in production
- [ ] Rate limiting enforced per tenant plan
- [ ] Worker processing is idempotent
- [ ] Dead-letter queue configured
- [ ] Cache utilization >50% for hot paths

### Before Phase 4 Completion (Week 24)
- [ ] Embedding generation offloaded from Node.js
- [ ] Real SSE streaming verified end-to-end
- [ ] Multiple worker instances running
- [ ] Batch DB inserts for chunk creation
- [ ] Connection pooling configured

### Before Production GA (Phase 5)
- [ ] Cost tracking per tenant per month
- [ ] Automated CI/CD pipeline
- [ ] Database migrations automated
- [ ] Event bus for decoupled domain events
- [ ] Audit log coverage >95% of mutations
- [ ] Load test: 100 concurrent tenants, 10 req/s each
- [ ] Disaster recovery plan documented and tested

---

## Risk Register

| ID | Risk | Phase | Probability | Impact | Mitigation | Owner |
|:--:|------|:-----:|:-----------:|:------:|------------|:-----:|
| R1 | JWT migration breaks existing users | 1 | HIGH | HIGH | Dual-mode auth with flag; 2-week migration window | Backend Lead |
| R2 | Service extraction introduces regressions | 2 | MEDIUM | HIGH | Contract tests before/after; snapshot responses | QA |
| R3 | OTel overhead impacts latency | 3 | LOW | MEDIUM | Sampling rate configuration (1% in prod start) | SRE |
| R4 | Embedding microservice adds deployment complexity | 4 | MEDIUM | MEDIUM | Use managed API (OpenAI embeddings) as fallback | DevOps |
| R5 | Rate limiting causes false positives | 3 | MEDIUM | HIGH | Start with 2x generous limits; monitor 429 rates | Backend Lead |
| R6 | Multi-region data sovereignty issues | 6 | LOW | HIGH | Region-locked tenant configuration; legal review | Legal + SRE |
| R7 | AI SDK breaking changes during migration | 2 | LOW | MEDIUM | Pin exact versions; integration test suite | Backend |
| R8 | Redis single-point-of-failure | 3-4 | MEDIUM | HIGH | Migrate to Redis Cluster / Upstash in Phase 5 | SRE |

---

## Success Metrics

| Metric | Current | Phase 1 Target | Phase 3 Target | Phase 5 Target |
|--------|:-------:|:--------------:|:--------------:|:--------------:|
| Enterprise Readiness Score | 5.3/10 | 6.5/10 | 7.5/10 | 8.5/10 |
| Security Score | 3/10 | 8/10 | 9/10 | 9/10 |
| Observability Score | 3/10 | 3/10 | 8/10 | 9/10 |
| P95 Query Latency | Unknown | Baselined | <2s | <1s |
| Cache Hit Rate | 0% | 0% | >50% | >70% |
| Worker Throughput | 5 concurrent | 5 concurrent | 20 concurrent | 50 concurrent |
| Uptime SLA | None | 99% | 99.5% | 99.9% |

---

*Document generated from ARCHITECTURE_CONSOLIDATION.md audit findings.*  
*Last Updated: 24 February 2026*
