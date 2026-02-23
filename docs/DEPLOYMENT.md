# 🏗 DEPLOYMENT ARCHITECTURE

## Overview

Matjenin AI requires a **hybrid deployment strategy** due to architectural constraints:

- **Vercel**: Next.js application (API routes, UI, tRPC)
- **Railway/Fly.io**: Worker + gRPC server
- **External Services**: SQL Server, Redis, Weaviate

---

## 🚫 What CANNOT Run on Vercel

### 1. BullMQ Worker (`app/worker/index.ts`)
**Why**: Requires long-running process, Vercel has 60s max execution time
**Solution**: Deploy to Railway, Fly.io, or AWS ECS

### 2. gRPC Server (`server/grpc/server.ts`)
**Why**: Requires persistent TCP connections, Vercel is HTTP-only
**Solution**: Deploy to Railway, Fly.io, or dedicated EC2

### 3. OpenTelemetry Instrumentation
**Why**: Heavy overhead for serverless, cold start issues
**Solution**: Remove or use lightweight alternatives

---

## ✅ Deployment Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                         VERCEL                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js 16 App                                      │  │
│  │  - API Routes (tRPC)                                 │  │
│  │  - Server Components                                 │  │
│  │  - UI Pages                                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/WebSocket
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   RAILWAY    │    │   RAILWAY    │    │   UPSTASH    │
│   (Worker)   │    │   (gRPC)     │    │   (Redis)    │
│              │    │              │    │              │
│  BullMQ      │◄───┤  Port 50051  │    │  Managed     │
│  Processor   │    │              │    │  Redis       │
└──────────────┘    └──────────────┘    └──────────────┘
        │                                       │
        │                                       │
        └───────────────┬───────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   AZURE SQL DATABASE  │
            │   or AWS RDS          │
            │   (SQL Server)        │
            └───────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   WEAVIATE CLOUD      │
            │   (Vector Database)   │
            └───────────────────────┘
```

---

## 📋 Step-by-Step Deployment

### 1. Setup External Services

#### Azure SQL Database
```bash
# Create Azure SQL Database
az sql server create --name matjenin-sql --resource-group matjenin-rg --location eastus --admin-user sqladmin --admin-password <password>
az sql db create --resource-group matjenin-rg --server matjenin-sql --name matjenin-ai --service-objective S0

# Get connection string
DATABASE_URL="sqlserver://matjenin-sql.database.windows.net:1433;database=matjenin-ai;user=sqladmin;password=<password>;encrypt=true"
```

#### Upstash Redis
```bash
# Sign up at https://upstash.com
# Create Redis database
# Copy connection string
REDIS_URL="rediss://default:<password>@<endpoint>.upstash.io:6379"
```

#### Weaviate Cloud
```bash
# Sign up at https://console.weaviate.cloud
# Create cluster
# Copy endpoint
WEAVIATE_URL="https://<cluster-id>.weaviate.network"
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Set environment variables
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
vercel env add WEAVIATE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add OPENAI_API_KEY production

# Deploy
vercel --prod
```

### 3. Deploy Worker to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create new project
railway init

# Add environment variables
railway variables set DATABASE_URL="<connection-string>"
railway variables set REDIS_URL="<redis-url>"
railway variables set WEAVIATE_URL="<weaviate-url>"

# Deploy worker
railway up --dockerfile Dockerfile.worker
```

### 4. Deploy gRPC to Railway

```bash
# Create another Railway service
railway service create grpc-server

# Add environment variables
railway variables set DATABASE_URL="<connection-string>"
railway variables set GRPC_PORT="50051"

# Deploy
railway up --dockerfile Dockerfile.grpc
```

---

## 🔐 Environment Variables

### Vercel (Next.js App)
```env
DATABASE_URL=<Azure SQL connection string>
REDIS_URL=<Upstash Redis URL>
WEAVIATE_URL=<Weaviate Cloud URL>
NEXTAUTH_SECRET=<random-32-char-string>
NEXTAUTH_URL=https://your-domain.vercel.app
OPENAI_API_KEY=<your-key>
ANTHROPIC_API_KEY=<your-key>
```

### Railway Worker
```env
DATABASE_URL=<same as Vercel>
REDIS_URL=<same as Vercel>
WEAVIATE_URL=<same as Vercel>
NODE_ENV=production
```

### Railway gRPC
```env
DATABASE_URL=<same as Vercel>
GRPC_HOST=0.0.0.0
GRPC_PORT=50051
NODE_ENV=production
```

---

## 🔄 Database Migrations

### Production Migration Strategy

```bash
# 1. Generate migration locally
npx prisma migrate dev --name initial

# 2. Push to production (Railway worker)
railway run npx prisma migrate deploy

# 3. Verify
railway run npx prisma db pull
```

### Vercel Build Hook
Add to `vercel.json`:
```json
{
  "buildCommand": "prisma generate && npm run build"
}
```

---

## 📊 Monitoring

### Vercel Analytics
- Enable in Vercel dashboard
- Monitor function execution times
- Track errors

### Railway Logs
```bash
# Worker logs
railway logs --service worker

# gRPC logs
railway logs --service grpc-server
```

### Database Monitoring
- Azure SQL: Use Azure Monitor
- Upstash: Built-in dashboard
- Weaviate: Cloud console

---

## 🚨 Troubleshooting

### Build Fails on Vercel
```bash
# Check Prisma generation
vercel logs --build

# Ensure DATABASE_URL is set
vercel env ls
```

### Worker Not Processing Jobs
```bash
# Check Redis connection
railway run node -e "const Redis = require('ioredis'); const redis = new Redis(process.env.REDIS_URL); redis.ping().then(console.log)"

# Check worker logs
railway logs --service worker --tail
```

### gRPC Connection Refused
```bash
# Check if service is running
railway status --service grpc-server

# Test connection
grpcurl -plaintext <railway-domain>:50051 list
```

---

## 💰 Cost Estimation

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel | Pro | $20 |
| Railway Worker | Hobby | $5 |
| Railway gRPC | Hobby | $5 |
| Azure SQL | Basic | $5 |
| Upstash Redis | Free | $0 |
| Weaviate Cloud | Sandbox | $0 |
| **Total** | | **~$35/month** |

---

## 🎯 Production Checklist

- [ ] Azure SQL Database created
- [ ] Upstash Redis configured
- [ ] Weaviate Cloud cluster created
- [ ] Vercel project linked
- [ ] Environment variables set in Vercel
- [ ] Railway worker deployed
- [ ] Railway gRPC deployed
- [ ] Database migrations run
- [ ] Health checks passing
- [ ] Monitoring enabled
- [ ] Backup strategy configured
- [ ] SSL/TLS enabled
- [ ] Rate limiting configured
- [ ] Error tracking setup (Sentry)

