// ============================================
// TRPC CONTEXT
// Context definition for tRPC with authentication
// ============================================

import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import type { inferAsyncReturnType } from '@trpc/server';
import { getConfig } from '@/sdk';

/**
 * Extended request with custom properties
 */
export interface CreateNextContextOptions {
  req: Request;
  resHeaders: Headers;
}

/**
 * Create context for tRPC procedures
 * This runs for every request and provides:
 * - Authentication info
 * - Tenant isolation
 * - Request metadata
 */
export async function createContext(opts: FetchCreateContextFnOptions | CreateNextContextOptions) {
  const config = getConfig();
  
  // Extract headers
  const headers = opts.req.headers;
  
  // Get tenant ID from header (multi-tenancy)
  const tenantId = headers.get('x-tenant-id') || 'default-tenant';
  
  // Get user ID from header (if authenticated)
  const userId = headers.get('x-user-id') || null;
  
  // Get user role from header
  const userRole = (headers.get('x-user-role') as 'admin' | 'member') || 'member';
  
  // Get authorization header for JWT verification
  const authorization = headers.get('authorization');
  
  // Get client IP for rate limiting
  const ip = headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || headers.get('x-real-ip') 
    || 'unknown';

  return {
    // Tenant isolation - CRITICAL for multi-tenancy
    tenantId,
    
    // Authentication
    userId,
    userRole,
    isAuthenticated: !!userId,
    isAdmin: userRole === 'admin',
    
    // Request metadata
    ip,
    authorization,
    
    // Headers for downstream use
    headers,
    
    // Config reference
    config,
    
    // Timestamp for audit
    requestTimestamp: new Date(),
  };
}

/**
 * Type-safe context return type
 */
export type Context = inferAsyncReturnType<typeof createContext>;

/**
 * Helper to assert context properties exist
 * Use in protected procedures
 */
export function assertContext(context: Context): asserts context is Context & {
  tenantId: string;
  userId: string;
  userRole: 'admin' | 'member';
} {
  if (!context.tenantId) {
    throw new Error('Tenant ID is required');
  }
  if (!context.userId) {
    throw new Error('User must be authenticated');
  }
}

