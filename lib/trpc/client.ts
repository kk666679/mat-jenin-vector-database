// ============================================
// TRPC Client Setup for Frontend
// Provides type-safe API calls from React components
// ============================================

import { createTRPCReact, httpBatchLink, loggerLink } from '@trpc/react-query';
import { createTRPCProxyClient, httpBatchLink as httpBatchLinkProxy } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/server/trpc/router';

/**
 * Create tRPC React hooks
 * Use these in your React components:
 * 
 * const trpc = trpc.useUtils();
 * const { data } = trpc.document.list.useQuery({ page: 1 });
 * const mutation = trpc.document.create.useMutation();
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get base URL for API calls
 * Works in browser, server, and mobile
 */
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return '';
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * Create tRPC hooks configuration
 * Call this in your React provider
 */
export function createTRPCReactHooks() {
  return trpc.createClient({
    links: [
      ...(process.env.NODE_ENV === 'development'
        ? [
            loggerLink({
              enabled: (opts) =>
                opts.direction === 'down' && opts.result instanceof Error,
            }),
          ]
        : []),
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
        headers() {
          if (typeof window === 'undefined') {
            return {};
          }
          return {
            'x-tenant-id': localStorage.getItem('tenant-id') || 'default-tenant',
            'x-user-id': localStorage.getItem('user-id') || '',
            'x-user-role': localStorage.getItem('user-role') || 'member',
          };
        },
      }),
    ],
  });
}

/**
 * Create server-side proxy client
 * Use for server components, API routes, server actions
 */
export function createTRPCServerClient() {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLinkProxy({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
        headers() {
          return {
            'x-tenant-id': process.env.DEFAULT_TENANT_ID || 'default-tenant',
            'x-user-id': process.env.SYSTEM_USER_ID || '',
            'x-user-role': 'admin',
          };
        },
      }),
    ],
  });
}

/**
 * Create client with custom base URL
 * Useful for mobile apps, external services, testing
 */
export function createTRPCClientWithUrl(baseUrl: string, headers?: Record<string, string>) {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLinkProxy({
        url: `${baseUrl}/api/trpc`,
        transformer: superjson,
        headers,
      }),
    ],
  });
}

/**
 * Type-safe input/output inference
 * Use these types in your application
 */
export type RouterInputs = AppRouter extends infer R
  ? R extends { procedures: infer P }
    ? {
        [K in keyof P]: P[K] extends { _input: infer I } ? I : never;
      }
    : never
  : never;

export type RouterOutputs = AppRouter extends infer R
  ? R extends { procedures: infer P }
    ? {
        [K in keyof P]: P[K] extends { _output: infer O } ? O : never;
      }
    : never
  : never;

