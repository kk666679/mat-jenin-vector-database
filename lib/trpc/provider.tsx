// ============================================
// TRPC Provider Component
// Wraps the application with tRPC and React Query providers
// ============================================

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { trpc, createTRPCReactHooks } from './client';

/**
 * Props for TRPCProvider
 */
interface TRPCProviderProps {
  children: ReactNode;
  /**
   * Optional: Pass a pre-configured QueryClient
   * Useful for SSR hydration
   */
  queryClient?: QueryClient;
  /**
   * Optional: Enable React Query devtools in development
   * @default true
   */
  enableDevtools?: boolean;
}

/**
 * TRPC Provider Component
 * 
 * Usage in layout.tsx (App Router):
 * 
 * ```tsx
 * import { TRPCProvider } from '@/lib/trpc/provider';
 * 
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html>
 *       <body>
 *         <TRPCProvider>
 *           {children}
 *         </TRPCProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function TRPCProvider({ 
  children, 
  queryClient: externalQueryClient,
  enableDevtools = process.env.NODE_ENV === 'development',
}: TRPCProviderProps) {
  const [queryClient] = useState(
    () =>
      externalQueryClient ||
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default query options
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            // Default mutation options
            retry: 0,
          },
        },
      })
  );

  const [trpcClient] = useState(() => createTRPCReactHooks());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* React Query Devtools can be conditionally rendered here */}
        {enableDevtools && process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtoolsPanel />
        )}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

/**
 * Simple devtools panel placeholder
 * For full devtools, use @tanstack/react-query-devtools
 */
function ReactQueryDevtoolsPanel() {
  // This is a placeholder - install @tanstack/react-query-devtools for full functionality
  return null;
}

export { trpc };
export type { AppRouter } from '@/server/trpc/router';

