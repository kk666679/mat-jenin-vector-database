# Matjenin

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-6.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/tRPC-11-purple?style=for-the-badge&logo=trpc" alt="tRPC">
  <img src="https://img.shields.io/badge/Prisma-7.8-gray?style=for-the-badge" alt="Prisma">
  <img src="https://img.shields.io/badge/License-MatJenin-green?style=for-the-badge" alt="License">
</p>

<p align="center">
  <strong>Multi-tenant Vector Search + Agentic RAG Platform</strong>
</p>

> Matjenin is a multi-tenant RAG platform that combines document ingestion, vector search (Weaviate/Pinecone), background processing (BullMQ/Redis), and multi-provider LLM orchestration.

---

## Quick Links

- [Architecture](#architecture)
- [Data Flow](#data-flow)
- [API Surfaces](#api-surfaces)
- [Getting Started (Local)](#getting-started-local)
- [Docker Compose (Local)](#docker-compose-local)
- [Configuration](#configuration)
- [Deployment Notes](#deployment-notes)

---

## Architecture

### OpenClaw multi-agent architecture (diagram)

<img src="./README-architecture-figure.svg" alt="OpenClaw Multi-Agent Architecture" width="100%" />


### OpenClaw multi-agent architecture (repo-specific)

Matjenin implements OpenClaw-style multi-agent orchestration using:

- **OrchestratorAgent** (`sdk/agents/orchestrator/orchestrator-agent.ts`): runs multi-step workflows by *enqueuing* agent tasks.
- **AgentExecutor** (`sdk/agents/orchestrator/executor.ts`): routes each queued `agentTask` to the correct specialized agent.
- **Specialized agents**:
  - **DocumentProcessingAgent** (`sdk/agents/adapters/document-processing-agent.ts`): chunk → embed → persist (SQL) and optionally upsert to Pinecone.
  - **RagQueryAgent** (`sdk/agents/adapters/rag-query-agent.ts`): delegates retrieval + answer generation to `ragService.search()`.
- **Worker entry points**:
  - `app/worker/index.ts`: document-processing pipeline worker.
  - `app/worker/agent-executor.ts`: consumes the `agent-execution` queue and executes `agentTask`s.

```mermaid
sequenceDiagram
  participant APIorUI as API/UI Trigger
  participant Orch as OrchestratorAgent
  participant Q as BullMQ (agent-execution)
  participant Worker as Agent Worker
  participant Exec as AgentExecutor
  participant Doc as DocumentProcessingAgent
  participant Rag as RagQueryAgent

  APIorUI->>Orch: enqueue {type:'orchestrate', workflow, context}
  Orch->>Q: enqueue per-step agentTask
  Q->>Worker: job(agentTask)
  Worker->>Exec: execute(agentTask)
  Exec->>Doc: if type='process-document'
  Exec->>Rag: if type='rag-query'
  Worker-->>Q: complete/fail
```

---

### High-level system model


```mermaid
graph TB

subgraph Client
    Web["Next.js UI / Consumers"]
end

subgraph Transport
    TRPC["HTTP tRPC API"]
    GRPC["gRPC Server :50051"]
end

subgraph Router
    Middleware["Middleware"]
    Routers["Domain Routers"]
end

subgraph Services
    DB["Prisma ORM"]
    Vector["Vector Service"]
    LLM["LLM Providers"]
    Cache["Redis Cache"]
    Queue["BullMQ"]
    Webhook["Webhook Service"]
end

subgraph Stores
    SQL[("SQL Server")]
    Weaviate[("Weaviate")]
    Pinecone[("Pinecone")]
    Redis[("Redis")]
end

subgraph Workers
    Worker["BullMQ Worker"]
end

Web --> TRPC
Web --> GRPC

TRPC --> Middleware
GRPC --> Middleware

Middleware --> Routers

Routers --> DB
Routers --> Vector
Routers --> LLM
Routers --> Queue
Routers --> Webhook

DB --> SQL
Vector --> Weaviate
Vector --> Pinecone
Cache --> Redis
Queue --> Redis

Worker --> Redis
Worker --> SQL
Worker --> Weaviate
Worker --> Pinecone
```


### Component responsibilities

```mermaid
graph LR

subgraph UI
    Chat["Chat Page"]
    Dashboard["Dashboard"]
    Docs["Documents"]
end

subgraph API
    DocRoutes["Document Router"]
    QueryRoutes["Query Router"]
    DashboardRoutes["Dashboard Router"]
    WebhookRoutes["Webhook Router"]
end

subgraph Worker
    DocumentJobs["Document Processing"]
end

subgraph DataAI
    SQL[("SQL Server")]
    Vector[("Weaviate")]
    Redis[("Redis")]
    LLM["LLM Providers"]
end

Chat --> QueryRoutes
Dashboard --> DashboardRoutes
Docs --> DocRoutes

DocRoutes --> DocumentJobs
QueryRoutes --> SQL
QueryRoutes --> Vector
QueryRoutes --> LLM

DashboardRoutes --> SQL
WebhookRoutes --> DocumentJobs

DocumentJobs --> SQL
DocumentJobs --> Vector
DocumentJobs --> Redis
```

---

## Data Flow

### Document ingestion lifecycle

```mermaid
sequenceDiagram
  participant User
  participant UI as Next.js UI
  participant API as tRPC (documents)
  participant Queue as BullMQ (Redis)
  participant Worker as app/worker
  participant SQL as SQL Server (Prisma)
  participant Vector as Weaviate/Pinecone

  User->>UI: Upload document
  UI->>API: document.create
  API->>SQL: Create Document row (status=PENDING)
  API->>Queue: Enqueue document-processing job
  API-->>UI: Return documentId + status

  Queue->>Worker: Pick job
  Worker->>SQL: Load document
  Worker->>Worker: Chunk text + generate embeddings
  Worker->>SQL: Persist chunks/metadata
  Worker->>Vector: Upsert embeddings by vector IDs
  Worker->>SQL: Mark Document COMPLETED
```

### RAG query lifecycle (search + generation)

```mermaid
sequenceDiagram
  participant User
  participant UI as Next.js UI
  participant API as tRPC query.search
  participant Embed as Embedding generation
  participant Vector as Vector DB
  participant SQL as SQL Server
  participant LLM as LLM provider

  User->>UI: Ask question
  UI->>API: query.search (optionally stream)
  API->>Embed: Embed the query
  API->>Vector: Vector search (topK) + metadata
  API->>SQL: Fetch document details/metadata (if required)
  API->>LLM: Build prompt with retrieved context
  LLM-->>API: Stream answer tokens
  API-->>UI: Stream response + sources/citations
```

---

## API Surfaces

### 1) tRPC over HTTP (primary)
- Routes are mounted under `app/api/trpc/**`.
- Used by the Next.js frontend via `@trpc/next` and React Query.

### 2) gRPC (service-to-service)
- gRPC server runs via `server/grpc/server.ts`.
- Exposed on port `50051` (see `Dockerfile.grpc`).

---

## Getting Started (Local)

### Prerequisites
- Node.js 18+
- Docker + Docker Compose

### 1) Start infrastructure

```bash
docker-compose up -d
```

This starts:
- SQL Server on **1433**
- Redis on **6379**
- Weaviate on **8080**

### 2) Configure environment variables

Create a `.env` file:

```env
# SQL Server
DATABASE_URL="sqlserver://localhost:1433;database=matjenin_ai;user=sa;password=YourStrong!Password123;trustServerCertificate=true"

# Redis
REDIS_URL="redis://localhost:6379"

# Weaviate
WEAVIATE_URL="http://localhost:8080"

# App secret
NEXTAUTH_SECRET="your-secret-key"

# LLM provider keys (set whichever providers you use)
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
GOOGLE_API_KEY="your-google-api-key"
```

### 3) Initialize database

```bash
npm run db:generate
npm run db:push
```

### 4) Run the app

```bash
npm run dev
```

Visit:
- http://localhost:3000

---

## Docker Compose (Local)

`docker-compose.yml` defines:
- **SQL Server** (`mcr.microsoft.com/mssql/server:2022-latest`)
- **Redis** (`redis:7-alpine`)
- **Weaviate** (`semeitechnologies/weaviate:latest`)

---

## Configuration

### Tenant limits (database)
Tenant plan/limits are represented in `prisma/schema.prisma` under `Tenant`.

Typical fields:
- `maxUsers` (default: 5)
- `maxDocuments` (default: 100)
- `maxStorageMb` (default: 1000)
- `rateLimitRpm` (default: 60)
- `rateLimitRph` (default: 1000)

### Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `DATABASE_URL` | Yes | SQL Server connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `WEAVIATE_URL` | Yes | Weaviate endpoint |
| `NEXTAUTH_SECRET` | Yes | Session/auth secret |
| Provider keys | No (per provider) | `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, etc. |

---

## Deployment Notes

Matjenin uses a **hybrid deployment strategy** because the worker and gRPC server require long-running processes.

- **Vercel**: Next.js app + tRPC HTTP endpoints
- **Worker host** (Railway/Fly.io/AWS ECS): BullMQ worker process (`npm run worker`)
- **gRPC host** (Railway/Fly.io/AWS ECS/EC2): persistent TCP server (`npm run grpc`)

See `docs/DEPLOYMENT.md` for the full deployment checklist.

---

## Scripts

Common commands from `package.json`:
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm run db:generate`
- `npm run db:push`
- `npm run worker`
- `npm run grpc`

---

## Contributing

Contributions are welcome. See `CONTRIBUTING.md`.

---

## License

Licensed under the repository `LICENSE` file.

