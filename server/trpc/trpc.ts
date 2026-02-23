// ============================================
// TRPC INITIALIZATION
// Base procedure setup and middleware
// ============================================

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { type Context } from './context';

/**
 * Initialize tRPC with context type
 */
const t = initTRPC.context<Context>().create({
  /**
   * Use superjson for:
   * - Date serialization
   * - BigInt serialization
   * - Circular reference handling
   * - Proper type inference
   */
  transformer: superjson,
  
  /**
   * Error formatter for consistent error responses
   */
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Don't leak internal error details in production
        zodError: 
          error.cause instanceof Error && process.env.NODE_ENV === 'development'
            ? error.cause.message
            : null,
      },
    };
  },
});

/**
 * Base tRPC router
 * Use this as the foundation for all routers
 */
export const router = t.router;

/**
 * Base procedure
 * All procedures (query, mutation) should derive from this
 */
export const publicProcedure = t.procedure;

/**
 * Middleware: Logging
 * Logs all procedure calls in development
 */
const loggingMiddleware = t.middleware(({ path, type, next }) => {
  const start = Date.now();
  
  return next().then((result) => {
    const duration = Date.now() - start;
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[tRPC] ${type} ${path} - ${duration}ms`);
    }
    
    return result;
  });
});

/**
 * Public procedure with logging
 */
export const publicProcedureWithLogging = t.procedure.use(loggingMiddleware);

/**
 * Middleware: Tenant Isolation
 * Ensures all queries are scoped to the tenant
 * CRITICAL: This must be applied to ALL procedures
 */
const tenantMiddleware = t.middleware(async ({ ctx, next }) => {
  // Tenant ID should always be present
  if (!ctx.tenantId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Tenant ID is required',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      // Ensure tenantId is guaranteed in downstream
      tenantId: ctx.tenantId,
    },
  });
});

/**
 * Protected procedure requiring authentication
 * Use for: User-specific data, mutations
 */
const isAuthedMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      // Ensure userId is guaranteed in downstream
      userId: ctx.userId,
      userRole: ctx.userRole,
      isAuthenticated: true,
      isAdmin: ctx.isAdmin,
    },
  });
});

/**
 * Protected procedure requiring admin role
 * Use for: Admin-only operations, tenant management
 */
const isAdminMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  if (!ctx.isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      userRole: ctx.userRole,
      isAuthenticated: true,
      isAdmin: true,
    },
  });
});

/**
 * Rate limiting middleware placeholder
 * Integrate with upstash/redis in production
 */
const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  // TODO: Implement rate limiting using Redis
  // Example with upstash:
  // const { remaining } = await redis.incr(`ratelimit:${ctx.tenantId}:${path}`);
  // if (remaining === 0) {
  //   throw new TRPCError({
  //     code: 'TOO_MANY_REQUESTS',
  //     message: 'Rate limit exceeded',
  //   });
  // }
  
  return next({ ctx });
});

/**
 * Public procedure with tenant isolation
 * Use for: Public read-only data
 */
export const tenantProcedure = t.procedure
  .use(loggingMiddleware)
  .use(tenantMiddleware);

/**
 * Protected procedure (requires authentication)
 * Use for: User-specific operations
 */
export const protectedProcedure = t.procedure
  .use(loggingMiddleware)
  .use(tenantMiddleware)
  .use(isAuthedMiddleware);

/**
 * Admin procedure (requires admin role)
 * Use for: Administrative operations
 */
export const adminProcedure = t.procedure
  .use(loggingMiddleware)
  .use(tenantMiddleware)
  .use(isAuthedMiddleware)
  .use(isAdminMiddleware);

/**
 * Rate-limited public procedure
 */
export const rateLimitedPublicProcedure = t.procedure
  .use(loggingMiddleware)
  .use(tenantMiddleware)
  .use(rateLimitMiddleware);

/**
 * Rate-limited protected procedure
 */
export const rateLimitedProtectedProcedure = t.procedure
  .use(loggingMiddleware)
  .use(tenantMiddleware)
  .use(isAuthedMiddleware)
  .use(rateLimitMiddleware);

// Re-export for convenience
export { TRPCError };

