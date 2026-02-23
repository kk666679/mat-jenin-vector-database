/**
 * Database package for Matjenin AI
 * Provides Prisma client and database utilities
 * 
 * To use:
 * 1. Run `pnpm install` to install dependencies
 * 2. Run `npx prisma generate` to generate Prisma client
 * 3. Run `npx prisma db push` to create database tables
 */

// Re-export Prisma client
export { PrismaClient } from '@prisma/client';

// Re-export Prisma types (requires running npx prisma generate first)
// Note: Uncomment these after running npx prisma generate
// export type {
//   Tenant,
//   User,
//   Session,
//   ApiKey,
//   Document,
//   DocumentChunk,
//   Job,
//   RateLimitLog,
//   AuditLog,
//   UsageMetric,
//   Conversation,
//   Message,
// } from '@prisma/client';

// Database utilities
export * from './prisma';

