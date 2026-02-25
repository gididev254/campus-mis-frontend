'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

/**
 * QueryContext Provider
 *
 * Provides React Query client to the application with optimized caching configuration.
 *
 * Cache Configuration:
 * - staleTime: Data remains fresh for 5 minutes (no refetch during this time)
 * - gcTime: Cached data is garbage collected after 30 minutes of inactivity
 * - refetchOnWindowFocus: Automatically refetch when window regains focus
 * - retry: Failed requests are retried once
 * - retryDelay: Wait 1 second before retrying failed requests
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data remains fresh for 5 minutes - no refetch during this time
            staleTime: 5 * 60 * 1000, // 5 minutes

            // Cache data for 30 minutes before garbage collection
            gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime in v4)

            // Refetch when window regains focus (user returns to tab)
            refetchOnWindowFocus: true,

            // Retry failed requests once
            retry: 1,

            // Wait 1 second before retrying
            retryDelay: 1000,

            // Don't refetch on remount if data is fresh
            refetchOnMount: false,

            // Don't refetch on reconnect if data is fresh
            refetchOnReconnect: false,
          },
          mutations: {
            // Retry mutations once
            retry: 1,

            // Wait 1 second before retrying
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools for development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
