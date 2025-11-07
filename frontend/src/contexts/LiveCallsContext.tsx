import { createContext, useContext, type ReactNode } from 'react';
import { useLiveCallsWebSocket } from '../hooks/useLiveCallsWebSocket';
import type { LiveCall } from '../types';

/**
 * LiveCalls Context
 *
 * Provides global WebSocket connection for live calls that persists
 * across all tabs and pages. The WebSocket connects once when the app
 * loads and stays connected in the background.
 *
 * Benefits:
 * - Instant live call visibility when switching tabs (no reconnect delay)
 * - Real-time updates regardless of which page you're on
 * - Single persistent connection (efficient)
 */

interface LiveCallsContextType {
  liveCalls: LiveCall[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const LiveCallsContext = createContext<LiveCallsContextType | undefined>(undefined);

interface LiveCallsProviderProps {
  children: ReactNode;
}

export function LiveCallsProvider({ children }: LiveCallsProviderProps) {
  // Initialize WebSocket connection at app level - stays connected always
  const liveCallsState = useLiveCallsWebSocket();

  return (
    <LiveCallsContext.Provider value={liveCallsState}>
      {children}
    </LiveCallsContext.Provider>
  );
}

/**
 * Hook to access live calls from any component
 *
 * Usage:
 * const { liveCalls, isConnected } = useLiveCalls();
 */
export function useLiveCalls() {
  const context = useContext(LiveCallsContext);
  if (context === undefined) {
    throw new Error('useLiveCalls must be used within a LiveCallsProvider');
  }
  return context;
}
