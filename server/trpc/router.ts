// ============================================
// ROOT ROUTER
// Main application router combining all sub-routers
// ============================================

import { router, publicProcedure } from './trpc';
import { documentRouter } from './routers/document';
import { queryRouter } from './routers/query';
import { dashboardRouter } from './routers/dashboard';
import { webhookRouter } from './routers/webhook';

/**
 * Main application router
 * Combines all sub-routers and exports type-safe procedures
 */
export const appRouter = router({
  // Document management
  document: documentRouter,
  
  // RAG queries and conversations
  query: queryRouter,
  
  // Dashboard statistics and overview
  dashboard: dashboardRouter,
  
  // Webhook management
  webhook: webhookRouter,
  
  // Health check (no auth required)
  health: router({
    check: publicProcedure.query(() => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
      };
    }),
  }),
});

/**
 * Export type definition of API
 * This allows TypeScript to infer types for:
 * - Frontend client (createTRPCReact)
 * - Server-side proxy client (createTRPCProxyClient)
 * - Input/output inference (inferRouterInputs, inferRouterOutputs)
 */
export type AppRouter = typeof appRouter;

// Re-export routers for convenience
export { documentRouter, queryRouter, dashboardRouter };

