---
Description: Comprehensive technical architecture documentation for the Matjenin AI platform
---

# Matjenin Architecture

**Last Updated:** 17th February 2026  
**Version:** 1.0.15

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [High-Level Architecture](#high-level-architecture)
4. [Component Architecture](#component-architecture)
5. [Data Architecture](#data-architecture)
6. [API Architecture](#api-architecture)
7. [Processing Pipeline](#processing-pipeline)
8. [Security Architecture](#security-architecture)
9. [Deployment Architecture](#deployment-architecture)

---

## System Overview

Matjenin is a multi-tenant vector database and Retrieval-Augmented Generation (RAG) platform that combines semantic search with large language models. It enables developers to build AI-powered applications with:

- Intelligent document retrieval
- Real-time streaming responses
- Transparent AI reasoning
- Multi-tenant data isolation

### Core Capabilities

| Capability | Description |
|------------|-------------|
| Vector Storage & Search | Store and query high-dimensional embeddings with HNSW indexing |
| Multi-Tenant Architecture | Complete data isolation with tenant-specific limits |
| Document Processing | Automatic chunking, embedding generation, and metadata extraction |
| RAG Chat Interface | Conversational AI that answers questions based on documents |
| Real-time Streaming | Token-by-token streaming with chain-of-thought visualization |
| Multi-Provider Support | OpenAI, Anthropic, Google, Groq, DeepSeek, and more |

---

## Technology Stack

### Core Framework

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Node.js | 18+ |
| Web Framework | Next.js | 16.x |
| UI Library | React | 19.x |
| Language | TypeScript | 5.9.x |
| Styling | Tailwind CSS | 4.x |

### Backend Services

| Component | Technology |
|-----------|------------|
| API Layer | tRPC v11 |
| Validation | Zod |
| Database ORM | Prisma 7.4 |
| Primary Database | SQL Server |
| Vector Database | Weaviate |
| Message Queue | BullMQ + Redis |
| gRPC Server | @grpc/grpc-js |

### AI & ML

| Component | Technology |
|-----------|------------|
| AI SDK | Vercel AI SDK |
| Embeddings | Transformers.js (Xenova/all-MiniLM-L6-v2) |
| LLM Providers | OpenAI, Anthropic, Google, Groq, DeepSeek, Cohere |

### UI Components

| Component | Technology |
|-----------|------------|
| Base UI | Radix UI |
| Icons | Lucide React |
| Animations | Framer Motion |
| Charts | Custom (Dashboard) |

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web App<br/>Next.js/React]
        Mobile[Mobile App<br/>React Native]
        ChatUI[Chat UI]
        API[API Client]
    end

    subgraph "API Gateway"
        Next[Next.js Server]
        tRPC[tRPC Router]
        REST[REST API]
        WS[WebSocket]
        gRPC[gRPC Gateway]
    end

    subgraph "Service Layer"
        DocSvc[Document Service]
        EmbedSvc[Embedding Service]
        LLMSvc[LLM Service]
        QueueSvc[Queue Service]
    end

    subgraph "SDK Layer"
        DB[(DB SDK)]
        Vector[(Vector SDK)]
        LLM[(LLM SDK)]
        Queue[(Queue SDK)]
    end

    subgraph "Data Layer"
        SQL[(SQL Server)]
        Weaviate[(Weaviate)]
        Redis[(Redis)]
    end

    Web --> Next
    Mobile --> Next
    ChatUI --> Next
    API --> Next

    Next --> tRPC
    Next --> REST
    Next --> WS
    Next --> gRPC

    tRPC --> DocSvc
    tRPC --> EmbedSvc
    tRPC --> LLMSvc
    tRPC --> QueueSvc

    DocSvc --> DB
    EmbedSvc --> Vector
    LLMSvc --> LLM
    QueueSvc --> Queue

    DB --> SQL
    Vector --> Weaviate
    Queue --> Redis

    LLMSvc --> LLM SDK
    LLM SDK --> OpenAI
    LLM SDK --> Anthropic
    LLM SDK --> Google
    LLM SDK --> Groq
    LLM SDK --> DeepSeek
```

---

## Component Architecture

### Frontend Component Hierarchy

```mermaid
graph TD
    App[App Router] --> Layout[Root Layout]
    
    Layout --> Chat[Chat Page]
    Layout --> Dashboard[Dashboard Page]
    Layout --> Docs[Documents Page]
    
    Chat --> ChatComponents[Chat Components]
    Dashboard --> DashboardComponents[Dashboard Components]
    Docs --> DocComponents[Document Components]
    
    subgraph "Chat Components"
        Message[Message]
        Reasoning[Reasoning]
        Sources[Sources]
        Input[Prompt Input]
    end
    
    subgraph "Dashboard Components"
        Charts[Charts]
        Stats[Stat Cards]
        Table[Data Table]
    end
    
    subgraph "Document Components"
        Upload[Upload]
        List[Document List]
        Viewer[Document Viewer]
    end
    
    subgraph "UI Components (Radix)"
        Button[Button]
        Dialog[Dialog]
        Input[Input]
        Dropdown[Dropdown]
    end
    
    Message --> Reasoning
    Message --> Sources
    Message --> Button
    Upload --> Dialog
    List --> Table
    Viewer --> Input
```

### Application Routes Structure

```mermaid
graph LR
    subgraph "App Router"
        Home[/] --> Landing[Landing Page]
        Home --> ChatRoute[/chat]
        Home --> DashboardRoute[/dashboard]
        Home --> DocumentsRoute[/documents]
        Home --> ApiRoute[/api]
        
        ChatRoute --> Conversation[Conversation ID]
        DashboardRoute --> Stats[Stats Page]
        DocumentsRoute --> DocID[Document ID]
        
        ApiRoute --> TRPC[/api/trpc]
        ApiRoute --> Query[/api/query]
        ApiRoute --> Stream[/api/query/stream]
        ApiRoute --> Upload[/api/documents]
    end
```

### SDK Module Organization

```mermaid
graph TD
    SDK[sdk/] --> Cache[cache/]
    SDK --> DB[db/]
    SDK --> LLM[llm/]
    SDK --> ML[ml/]
    SDK --> Models[models/]
    SDK --> Queue[queue/]
    SDK --> Vector[vector/]
    SDK --> Skills[skills/]
    SDK --> Proto[proto/]
    
    DB --> Prisma[prisma.ts]
    DB --> Hybrid[hybrid-queries.ts]
    DB --> Schema[prisma/schema.prisma]
    
    LLM --> AISDK[ai-sdk.ts]
    
    Models --> Providers[providers/]
    Providers --> OpenAI[openai.ts]
    Providers --> Anthropic[anthropic.ts]
    Providers --> Google[google.ts]
    Providers --> Groq[groq.ts]
    Providers --> DeepSeek[deepseek.ts]
    
    Vector --> Index[index.ts]
    Vector --> Pinecone[pinecone.ts]
    
    Queue --> BullMQ[index.ts]
    
    Proto --> AIService[ai-service.proto]
    Proto --> MSSQL[ms-sql.proto]
```

---

## Data Architecture

### Entity Relationship Diagram

```mermaid
erDiagram
    Tenant ||--o{ User : has
    Tenant ||--o{ Document : owns
    Tenant ||--o{ ApiKey : has
    Tenant ||--o{ Job : schedules
    User ||--o{ Session : creates
    User ||--o{ Conversation : participates
    Document ||--o{ DocumentChunk : contains
    Document ||--o{ Job : triggers
    Conversation ||--o{ Message : contains

    Tenant {
        string id PK
        string name
        string slug
        string plan
        boolean isActive
        int maxUsers
        int maxDocuments
        int maxStorageMb
        int rateLimitRpm
        int rateLimitRph
    }

    User {
        string id PK
        string tenantId FK
        string email
        string passwordHash
        string role
    }

    Session {
        string id PK
        string userId FK
        string tenantId FK
        string token
        datetime expiresAt
    }

    ApiKey {
        string id PK
        string tenantId FK
        string keyHash
        json permissions
    }

    Document {
        string id PK
        string tenantId FK
        string title
        string content
        string status
        int chunkCount
    }

    DocumentChunk {
        string id PK
        string tenantId FK
        string documentId FK
        string content
        int chunkIndex
        json embedding
        string embeddingId
    }

    Conversation {
        string id PK
        string tenantId FK
        string userId FK
        string title
        datetime createdAt
    }

    Message {
        string id PK
        string conversationId FK
        string role
        string content
        json sources
        datetime createdAt
    }

    Job {
        string id PK
        string tenantId FK
        string documentId FK
        string type
        string status
        int progress
    }
```

### Multi-Tenant Data Isolation Flow

```mermaid
sequenceDiagram
    participant Client
    participant tRPC as tRPC Middleware
    participant Service as Service Layer
    participant DB as Database
    participant Vector as Vector DB

    Client->>tRPC: Request with JWT/apiKey
    tRPC->>tRPC: Extract tenantId from token
    tRPC->>Service: Forward with tenant context
    
    Service->>DB: Query with tenantId filter
    DB-->>Service: Tenant-specific data
    
    Service->>Vector: Search with tenant namespace
    Vector-->>Service: Tenant-specific vectors
    
    Service-->>tRPC: Filtered response
    tRPC-->>Client: Response
```

---

## API Architecture

### tRPC Router Structure

```mermaid
graph TD
    Router[appRouter] --> DocumentRouter[documentRouter]
    Router --> QueryRouter[queryRouter]
    Router --> DashboardRouter[dashboardRouter]
    Router --> HealthRouter[healthRouter]
    
    DocumentRouter --> create[create mutation]
    DocumentRouter --> list[list query]
    DocumentRouter --> get[get query]
    DocumentRouter --> delete[delete mutation]
    
    QueryRouter --> search[search query]
    QueryRouter --> searchOnly[searchOnly query]
    QueryRouter --> createConversation[createConversation mutation]
    QueryRouter --> listConversations[listConversations query]
    QueryRouter --> getMessages[getMessages query]
    
    DashboardRouter --> stats[stats query]
    DashboardRouter --> usage[usage query]
    
    HealthRouter --> check[check query]
```

### Middleware Pipeline

```mermaid
graph LR
    Request[Incoming Request] --> Auth[Authentication Middleware]
    Auth --> RateLimit[Rate Limiting Middleware]
    RateLimit --> Tenant[Tenant Context Middleware]
    Tenant --> Logging[Logging Middleware]
    Logging --> Handler[Route Handler]
    Handler --> Response[Response]
```

### API Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant tRPC
    participant Middleware
    participant Router
    participant Service
    
    Client->>tRPC: tRPC call (e.g., query.search)
    tRPC->>Middleware: Pass through middleware chain
    Middleware->>Middleware: Validate auth, rate limit, tenant
    Middleware->>Router: Invoke procedure
    Router->>Service: Call service method
    Service-->>Router: Return result
    Router-->>Middleware: Pass response
    Middleware-->>tRPC: Log, etc.
    tRPC-->>Client: Type-safe response
```

---

## Processing Pipeline

### Document Processing Flow

```mermaid
graph LR
    Upload[Document Upload] --> Queue[BullMQ Queue]
    Queue --> Worker[Background Worker]
    Worker --> Parse[Parse Content]
    Parse --> Chunk[Chunk Text]
    Chunk --> Embed[Generate Embeddings]
    Embed --> StoreSQL[Store in SQL]
    Embed --> StoreVector[Store in Weaviate]
    StoreSQL --> Complete[Mark Document Complete]
    StoreVector --> Complete
```

### RAG Query Flow

```mermaid
sequenceDiagram
    participant User
    participant API as tRPC API
    participant RAG as RAG Pipeline
    participant Embed as Embedding Service
    participant Vector as Weaviate
    participant SQL as SQL Server
    participant LLM as LLM Provider

    User->>API: Send query
    API->>RAG: process(query, tenantId)
    RAG->>Embed: generateEmbedding(query)
    Embed-->>RAG: query vector
    
    RAG->>Vector: vectorSearch(tenant, vector, topK)
    Vector-->>RAG: chunk IDs + scores
    
    RAG->>SQL: getMetadata(chunk IDs)
    SQL-->>RAG: chunk metadata
    
    RAG->>LLM: generate(prompt with context)
    LLM-->>RAG: streamed answer
    
    RAG-->>API: stream response with sources
    API-->>User: real-time chunks + citations
```

### Background Job Processing

```mermaid
graph TD
    subgraph "Queue System (BullMQ + Redis)"
        DocQueue[Document Processing Queue]
        EmbedQueue[Embedding Queue]
        IndexQueue[Indexing Queue]
    end
    
    subgraph "Workers"
        DocWorker[Document Worker]
        EmbedWorker[Embedding Worker]
        IndexWorker[Indexing Worker]
    end
    
    subgraph "Storage"
        SQL[(SQL Server)]
        Vector[(Weaviate)]
    end
    
    Upload[Document Upload] -->|Add job| DocQueue
    DocQueue --> DocWorker
    DocWorker -->|Chunk| EmbedQueue
    EmbedQueue --> EmbedWorker
    EmbedWorker -->|Generate vectors| IndexQueue
    EmbedWorker -->|Store metadata| SQL
    IndexQueue --> IndexWorker
    IndexWorker -->|Store vectors| Vector
```

---

## Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Login as Login Endpoint
    participant Auth as Auth Service
    participant DB as Database
    participant Session as Session Store

    User->>Login: POST /api/auth/login (credentials)
    Login->>Auth: validate credentials
    Auth->>DB: find user by email
    DB-->>Auth: user record
    Auth->>Auth: verify password
    
    alt valid credentials
        Auth->>Session: create session (JWT)
        Session-->>Auth: session token
        Auth-->>Login: return token
        Login-->>User: 200 OK + token
    else invalid
        Auth-->>Login: error
        Login-->>User: 401 Unauthorized
    end
```

### Security Layers

```mermaid
graph TD
    subgraph "Perimeter Security"
        RateLimit[Rate Limiting]
        IPFilter[IP Filtering]
        WAF[WAF]
    end
    
    subgraph "Application Security"
        Auth[Authentication]
        RBAC[Role-Based Access Control]
        Tenant[Tenant Isolation]
        Validation[Input Validation]
    end
    
    subgraph "Data Security"
        Encryption[Encryption at Rest]
        Audit[Audit Logging]
        Backup[Backup & Recovery]
    end
    
    Request[Request] --> RateLimit
    RateLimit --> IPFilter
    IPFilter --> WAF
    WAF --> Auth
    Auth --> RBAC
    RBAC --> Tenant
    Tenant --> Validation
    Validation --> Handler[Route Handler]
    Handler --> Audit
    Audit --> DB[(Database)]
```

---

## Deployment Architecture

### Infrastructure Components

```mermaid
graph TD
    subgraph "Load Balancer"
        LB[Load Balancer<br/>Nginx / Cloud LB]
    end
    
    subgraph "Next.js Cluster"
        Next1[Next.js Instance 1]
        Next2[Next.js Instance 2]
        NextN[Next.js Instance N]
    end
    
    subgraph "Data Services"
        SQL[SQL Server<br/>Primary]
        SQLReplica[SQL Server<br/>Replica]
        Weaviate[Weaviate Cluster]
        Redis[Redis Cluster<br/>with Sentinel]
    end
    
    subgraph "Monitoring"
        Logs[Log Aggregator]
        Metrics[Metrics Server]
        Alerts[Alerting]
    end
    
    Client[Client] --> LB
    LB --> Next1
    LB --> Next2
    LB --> NextN
    
    Next1 --> SQL
    Next2 --> SQL
    NextN --> SQL
    
    Next1 --> Weaviate
    Next2 --> Weaviate
    NextN --> Weaviate
    
    Next1 --> Redis
    Next2 --> Redis
    NextN --> Redis
    
    SQL --> SQLReplica
    SQL --> Logs
    Weaviate --> Logs
    Redis --> Logs
    
    Logs --> Metrics
    Metrics --> Alerts
```

### Docker Services

```mermaid
graph LR
    subgraph "docker-compose.yml"
        SQLService[SQL Server<br/>mcr.microsoft.com/mssql/server:2022-latest]
        RedisService[Redis<br/>redis:7-alpine]
        WeaviateService[Weaviate<br/>semitechnologies/weaviate:latest]
        NextService[Next.js App<br/>Built from Dockerfile]
    end
    
    NextService --> SQLService
    NextService --> RedisService
    NextService --> WeaviateService
```

---

## Development Guidelines

### Project Structure

```mermaid
graph TD
    Root[/] --> App[app/]
    Root --> Components[components/]
    Root --> SDK[sdk/]
    Root --> Server[server/]
    Root --> Lib[lib/]
    Root --> Types[types/]
    
    App --> API[api/]
    App --> Chat[chat/]
    App --> Dashboard[dashboard/]
    App --> Documents[documents/]
    
    Components --> AI[ai-elements/]
    Components --> UI[ui/]
    
    SDK --> DB[db/]
    SDK --> LLM[llm/]
    SDK --> Vector[vector/]
    SDK --> Queue[queue/]
    
    Server --> TRPC[trpc/]
    TRPC --> Routers[routers/]
```

### Adding New Features Workflow

```mermaid
graph LR
    Step1[1. Define Types in types/ with Zod] --> Step2[2. Create tRPC Router in server/trpc/routers/]
    Step2 --> Step3[3. Implement Business Logic in sdk/]
    Step3 --> Step4[4. Build UI Components in components/]
    Step4 --> Step5[5. Add Tests]
```

---

## Appendix

### Glossary

| Term | Definition |
|------|------------|
| **RAG** | Retrieval-Augmented Generation - AI technique combining LLM with document search |
| **HNSW** | Hierarchical Navigable Small World - Vector indexing algorithm |
| **Embedding** | Numerical vector representation of text for semantic search |
| **Chunk** | Segment of document text for vector storage |
| **Tenant** | Isolated customer/account in multi-tenant system |

### Performance Considerations

- **Vector Search**: Use Weaviate with HNSW index for sub-100ms queries
- **Document Processing**: Process in background with BullMQ for non-blocking uploads
- **LLM Streaming**: Use Vercel AI SDK for efficient token streaming
- **Caching**: Implement Redis caching for frequently accessed data

### Monitoring & Observability

- **OpenTelemetry** integration for distributed tracing
- **Prisma Studio** for database inspection
- **BullMQ Dashboard** for job queue monitoring

---

- * *Last Updated: 17th February 2026*
- * *Version: 1.0.15*
