import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';

// Create a client with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds - data is fresh for 30s
      gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5min (formerly cacheTime)
      refetchOnWindowFocus: false, // Prevent refetch when switching windows
      refetchOnMount: true, // Refetch when component mounts if stale
      refetchOnReconnect: true, // Refetch when connection restored
      retry: 1, // Retry failed requests once
      retryDelay: 1000, // Wait 1s before retry
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <div className="dark">
        <App />
      </div>
    </QueryClientProvider>
  </StrictMode>
);
