/**
 * Prisma Custom Client
 * 
 * Custom Prisma client wrapper with additional utilities
 * and connection management features.
 */

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Get the singleton Prisma client instance
 * In development, uses global to prevent multiple instances
 */
export function getPrismaClient(): PrismaClient {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  if (nodeEnv === 'development') {
    if (!global.prisma) {
      global.prisma = createPrismaClient();
    }
    return global.prisma;
  }
  
  return createPrismaClient();
}

/**
 * Create a new Prisma client instance
 */
export function createPrismaClient(databaseUrl?: string): PrismaClient {
  const url = databaseUrl || process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!url) {
    // Fallback to default without URL (uses env var)
    return new PrismaClient();
  }
  
  return new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  } as any);
}

/**
 * Execute a transaction with retry logic
 */
export async function executeWithRetry<T>(
  fn: (client: PrismaClient) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  const client = getPrismaClient();
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.$transaction(fn as (client: any) => Promise<T>);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Transaction attempt ${attempt} failed:`, error);
      
      // Don't retry on certain errors
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
  }
  
  throw lastError;
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  const client = getPrismaClient();
  const start = Date.now();
  
  try {
    await client.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    
    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Disconnect Prisma client
 */
export async function disconnectPrisma(): Promise<void> {
  const client = getPrismaClient();
  await client.$disconnect();
  
  if (global.prisma) {
    global.prisma = undefined;
  }
}

/**
 * Tenant-aware database client
 * Automatically applies tenant filtering
 */
export class TenantPrismaClient {
  private prisma: PrismaClient;
  private tenantId: string;
  
  constructor(tenantId: string, prismaClient?: PrismaClient) {
    this.prisma = prismaClient || getPrismaClient();
    this.tenantId = tenantId;
  }
  
  /**
   * Get documents for tenant
   */
  get documents() {
    return this.prisma.document.findMany({
      where: { tenantId: this.tenantId },
    });
  }
  
  /**
   * Get document chunks for tenant
   */
  get documentChunks() {
    return this.prisma.documentChunk.findMany({
      where: { tenantId: this.tenantId },
    });
  }
  
  /**
   * Get users for tenant
   */
  get users() {
    return this.prisma.user.findMany({
      where: { tenantId: this.tenantId },
    });
  }
  
  /**
   * Get conversations for tenant
   */
  get conversations() {
    return this.prisma.conversation.findMany({
      where: { tenantId: this.tenantId },
    });
  }
  
  /**
   * Get audit logs for tenant
   */
  get auditLogs() {
    return this.prisma.auditLog.findMany({
      where: { tenantId: this.tenantId },
    });
  }
  
  /**
   * Get usage metrics for tenant
   */
  get usageMetrics() {
    return this.prisma.usageMetric.findMany({
      where: { tenantId: this.tenantId },
    });
  }
  
  /**
   * Execute custom query with tenant filter
   */
  async query<T>(operation: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return operation(this.prisma);
  }
}

/**
 * Create tenant-specific client
 */
export function createTenantClient(tenantId: string): TenantPrismaClient {
  return new TenantPrismaClient(tenantId);
}

// Re-export Prisma types for convenience
export { PrismaClient, Prisma } from '@prisma/client';

