/**
 * Database utilities for Prisma
 */

import { PrismaClient } from '@prisma/client';

// Re-export PrismaClient
export { PrismaClient };

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Get or create Prisma client instance
 * Uses singleton pattern in development
 */
export function getPrismaClient(): PrismaClient {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  if (nodeEnv === 'development') {
    if (!global.prisma) {
      global.prisma = new PrismaClient();
    }
    return global.prisma;
  }
  
  return new PrismaClient();
}

/**
 * Create Prisma client with custom datasource
 * For multi-tenant with per-tenant databases
 */
export function createPrismaClient(databaseUrl: string): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  } as any);
}

/**
 * Disconnect Prisma client
 */
export async function disconnectPrisma(): Promise<void> {
  await getPrismaClient().$disconnect();
}

