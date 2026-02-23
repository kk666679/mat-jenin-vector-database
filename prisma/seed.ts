/**
 * Prisma Database Seed Script
 * 
 * Run with: npx tsx prisma/seed.ts
 * Or: npx prisma db seed (if configured in package.json)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed data for development/testing
 */
async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...');
    await prisma.usageMetric.deleteMany();
    await prisma.rateLimitLog.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.job.deleteMany();
    await prisma.documentChunk.deleteMany();
    await prisma.document.deleteMany();
    await prisma.apiKey.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
  }

  // Create tenants
  console.log('🏢 Creating tenants...');
  const tenants = await Promise.all([
    prisma.tenant.create({
      data: {
        name: 'Demo Organization',
        slug: 'demo-org',
        plan: 'enterprise',
        maxUsers: 100,
        maxDocuments: 10000,
        maxStorageMb: 10000,
        rateLimitRpm: 1000,
        rateLimitRph: 50000,
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'Starter Company',
        slug: 'starter-co',
        plan: 'free',
        maxUsers: 5,
        maxDocuments: 100,
        maxStorageMb: 1000,
        rateLimitRpm: 60,
        rateLimitRph: 1000,
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'Pro Business',
        slug: 'pro-business',
        plan: 'pro',
        maxUsers: 25,
        maxDocuments: 2500,
        maxStorageMb: 5000,
        rateLimitRpm: 300,
        rateLimitRph: 15000,
      },
    }),
  ]);

  console.log(`✅ Created ${tenants.length} tenants`);

  // Create users
  console.log('👥 Creating users...');
  const users = await Promise.all([
    // Demo Org users
    prisma.user.create({
      data: {
        email: 'admin@demo-org.com',
        passwordHash: '$2a$10$xVfYjKn0mK5xK5xK5xK5xO5xK5xK5xK5xK5xK5xK5xK5xK5xK5xK', // "password123" hashed
        name: 'Admin User',
        role: 'admin',
        tenantId: tenants[0].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'member@demo-org.com',
        passwordHash: '$2a$10$xVfYjKn0mK5xK5xK5xK5xO5xK5xK5xK5xK5xK5xK5xK5xK5xK',
        name: 'John Doe',
        role: 'member',
        tenantId: tenants[0].id,
      },
    }),
    // Starter Co users
    prisma.user.create({
      data: {
        email: 'owner@starter-co.com',
        passwordHash: '$2a$10$xVfYjKn0mK5xK5xK5xK5xO5xK5xK5xK5xK5xK5xK5xK5xK5xK',
        name: 'Starter Owner',
        role: 'admin',
        tenantId: tenants[1].id,
      },
    }),
    // Pro Business users
    prisma.user.create({
      data: {
        email: 'admin@pro-business.com',
        passwordHash: '$2a$10$xVfYjKn0mK5xK5xK5xK5xO5xK5xK5xK5xK5xK5xK5xK5xK5xK',
        name: 'Pro Admin',
        role: 'admin',
        tenantId: tenants[2].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'user@pro-business.com',
        passwordHash: '$2a$10$xVfYjKn0mK5xK5xK5xK5xO5xK5xK5xK5xK5xK5xK5xK5xK5xK',
        name: 'Pro User',
        role: 'member',
        tenantId: tenants[2].id,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create API keys
  console.log('🔑 Creating API keys...');
  const apiKeys = await Promise.all([
    prisma.apiKey.create({
      data: {
        tenantId: tenants[0].id,
        name: 'Production API Key',
        keyHash: 'sk-prod-xxxxx',
        prefix: 'sk-prod',
        permissions: JSON.stringify(['read:documents', 'write:documents', 'read:queries']),
        isActive: true,
      },
    }),
    prisma.apiKey.create({
      data: {
        tenantId: tenants[0].id,
        name: 'Development API Key',
        keyHash: 'sk-dev-xxxxx',
        prefix: 'sk-dev',
        permissions: JSON.stringify(['read:documents', 'read:queries']),
        isActive: true,
      },
    }),
    prisma.apiKey.create({
      data: {
        tenantId: tenants[1].id,
        name: 'Starter API Key',
        keyHash: 'sk-starter-xxxxx',
        prefix: 'sk-starter',
        permissions: JSON.stringify(['read:documents']),
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${apiKeys.length} API keys`);

  // Create documents with chunks
  console.log('📄 Creating documents...');
  
  const sampleDocuments = [
    {
      tenantId: tenants[0].id,
      userId: users[0].id,
      title: 'Getting Started Guide',
      content: `# Getting Started Guide

Welcome to our platform! This guide will help you get up and running quickly.

## Installation

1. Clone the repository
2. Install dependencies with npm install
3. Configure your environment variables
4. Run the development server

## Configuration

Create a .env file with the following variables:

- DATABASE_URL
- REDIS_URL
- OPENAI_API_KEY

## Next Steps

- Read the API documentation
- Explore the dashboard
- Set up your first document processing pipeline`,
      status: 'completed',
      chunkCount: 3,
    },
    {
      tenantId: tenants[0].id,
      userId: users[0].id,
      title: 'API Reference',
      content: `# API Reference

## Authentication

All API requests require authentication using API keys.

### Headers

Include your API key in the Authorization header:

Authorization: Bearer YOUR_API_KEY

## Endpoints

### Documents

- GET /api/documents - List all documents
- POST /api/documents - Create new document
- GET /api/documents/:id - Get document by ID
- DELETE /api/documents/:id - Delete document

### Queries

- POST /api/query - Execute RAG query
- POST /api/query/stream - Stream RAG query results`,
      status: 'completed',
      chunkCount: 2,
    },
    {
      tenantId: tenants[0].id,
      userId: users[1].id,
      title: 'Architecture Overview',
      content: `# Architecture Overview

## System Components

### Frontend
- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS

### Backend
- tRPC for API
- Prisma ORM
- Redis for caching
- SQL Server for storage

### AI/ML
- OpenAI/Anthropic integration
- Vector embeddings
- RAG pipeline`,
      status: 'completed',
      chunkCount: 3,
    },
    {
      tenantId: tenants[2].id,
      userId: users[3].id,
      title: 'Enterprise Features',
      content: `# Enterprise Features

## Multi-Tenant Isolation

Our platform provides robust multi-tenant isolation:

- Database-level isolation
- API key permissions
- Role-based access control

## Rate Limiting

Enterprise plans include:
- Higher RPM limits
- Custom rate limiting rules
- Priority support

## SLA

Enterprise customers receive:
- 99.9% uptime guarantee
- 24/7 support
- Dedicated account manager`,
      status: 'completed',
      chunkCount: 3,
    },
  ];

  const documents = await Promise.all(
    sampleDocuments.map((doc) => prisma.document.create({ data: doc }))
  );

  console.log(`✅ Created ${documents.length} documents`);

  // Create document chunks
  console.log('📝 Creating document chunks...');
  const chunks = [];

  for (const doc of documents) {
    // Split content into chunks (simple split by paragraphs)
    const content = doc.content || ''; const paragraphs = content.split('\n\n').filter((p: string) => p.trim().length > 0);
    
    for (let i = 0; i < paragraphs.length; i++) {
      const chunk = await prisma.documentChunk.create({
        data: {
          tenantId: doc.tenantId,
          documentId: doc.id,
          content: paragraphs[i] ?? '',
          chunkIndex: i,
          // Store as JSON string for database fallback
          embedding: null,
        },
      });
      chunks.push(chunk);
    }
  }

  console.log(`✅ Created ${chunks.length} document chunks`);

  // Create conversations and messages
  console.log('💬 Creating conversations...');
  const conversation1 = await prisma.conversation.create({
    data: {
      tenantId: tenants[0].id,
      userId: users[1].id,
      title: 'Getting Help with API',
    },
  });

  await Promise.all([
    prisma.message.create({
      data: {
        conversationId: conversation1.id,
        role: 'user',
        content: 'How do I authenticate with the API?',
      },
    }),
    prisma.message.create({
      data: {
        conversationId: conversation1.id,
        role: 'assistant',
        content: 'You can authenticate using API keys. Include your key in the Authorization header.',
        sources: JSON.stringify([{ documentTitle: 'API Reference', chunkContent: 'Authentication section' }]),
        tokensUsed: 150,
      },
    }),
  ]);

  const conversation2 = await prisma.conversation.create({
    data: {
      tenantId: tenants[0].id,
      userId: users[1].id,
      title: 'Document Processing',
    },
  });

  await Promise.all([
    prisma.message.create({
      data: {
        conversationId: conversation2.id,
        role: 'user',
        content: 'What file formats are supported?',
      },
    }),
    prisma.message.create({
      data: {
        conversationId: conversation2.id,
        role: 'assistant',
        content: 'We support PDF, TXT, Markdown, and DOCX formats.',
        tokensUsed: 75,
      },
    }),
  ]);

  console.log('✅ Created conversations and messages');

  // Create usage metrics
  console.log('📊 Creating usage metrics...');
  const now = new Date();
  const usageMetrics = [];

  for (const tenant of tenants) {
    // Daily metrics for the past 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      usageMetrics.push(
        prisma.usageMetric.create({
          data: {
            tenantId: tenant.id,
            metricType: 'api_requests',
            value: Math.floor(Math.random() * 1000) + 100,
            period: 'daily',
            periodStart: date,
          },
        }),
        prisma.usageMetric.create({
          data: {
            tenantId: tenant.id,
            metricType: 'documents_processed',
            value: Math.floor(Math.random() * 50) + 5,
            period: 'daily',
            periodStart: date,
          },
        }),
        prisma.usageMetric.create({
          data: {
            tenantId: tenant.id,
            metricType: 'tokens_used',
            value: Math.floor(Math.random() * 50000) + 5000,
            period: 'daily',
            periodStart: date,
          },
        })
      );
    }
  }

  await Promise.all(usageMetrics);
  console.log('✅ Created usage metrics');

  // Create audit logs
  console.log('📋 Creating audit logs...');
  const auditLogs = [];

  for (const user of users.slice(0, 3)) {
    const firstDoc = documents[0];
    if (!firstDoc) continue;
    
    auditLogs.push(
      prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          action: 'login',
          entityType: 'user',
          entityId: user.id,
          details: JSON.stringify({ method: 'password', ipAddress: '192.168.1.1' }),
        },
      }),
      prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          action: 'create',
          entityType: 'document',
          entityId: firstDoc.id,
          details: JSON.stringify({ title: firstDoc.title }),
        },
      })
    );
  }

  await Promise.all(auditLogs);
  console.log('✅ Created audit logs');

  console.log('🎉 Database seed completed successfully!');
}

/**
 * Run seed script
 */
main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

