// ============================================
// TRPC API Handler for Next.js App Router
// Handles tRPC requests via HTTP POST
// ============================================

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc/router';
import { createContext } from '@/server/trpc/context';

/**
 * Edge-compatible handler for App Router
 * Uses fetch API - works on Vercel Edge, Node.js, and other runtimes
 */
const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({ req, resHeaders: new Headers() }),
    onError: ({ path, error }) => {
      console.error(`[tRPC] Error on ${path}:`, error);
    },
  });
};

export { handler as GET, handler as POST };

