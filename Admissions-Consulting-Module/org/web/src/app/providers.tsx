// src/app/providers.tsx
'use client'; // <-- VERY IMPORTANT: This makes it a Client Component

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react'; // Import React for useState

export function Providers({ children }: { children: React.ReactNode }) {
  // Use useState to ensure QueryClient is only created once per component instance
  // and survives Hot Module Reloads.
  const [queryClient] = React.useState(() => new QueryClient({
    // Optional: configure default options for all queries/mutations
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // Default stale time for all queries (e.g., 5 minutes)
        // You can override this in individual useQuery calls
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}