import { Suspense, lazy, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AnalyticsStrip } from './components/layout/AnalyticsStrip';
import { SearchProvider } from './contexts/SearchContext';
import { LiveCallsProvider } from './contexts/LiveCallsContext';
import type { TabType } from './types';
import './index.css';

// Lazy load tab components for performance
const AgentsTab = lazy(() => import('./tabs/AgentsTab').then(m => ({ default: m.AgentsTab })));
const HistoryTab = lazy(() => import('./tabs/HistoryTab').then(m => ({ default: m.HistoryTab })));
const LiveTab = lazy(() => import('./tabs/LiveTab').then(m => ({ default: m.LiveTab })));

// Loading skeleton component
function TabSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 bg-white/5 rounded-xl w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 bg-white/5 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('agents');

  return (
    <SearchProvider>
      <LiveCallsProvider>
        <div className="min-h-screen cosmic-bg text-white">
          {/* Toast Notifications */}
          <Toaster theme="dark" position="top-right" richColors />

        {/* Header */}
        <Header />

        {/* Main Layout */}
        <div className="flex">
          {/* Sidebar */}
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Main Content */}
          <main className="flex-1 p-6 pb-32 sm:pb-28 sm:ml-60 pt-6">
            <div className="max-w-screen-2xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Suspense fallback={<TabSkeleton />}>
                    {activeTab === 'agents' && <AgentsTab />}
                    {activeTab === 'live' && <LiveTab />}
                    {activeTab === 'history' && <HistoryTab />}
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>

        {/* Analytics Strip - positioned fixed at bottom */}
        <AnalyticsStrip />
      </div>
      </LiveCallsProvider>
    </SearchProvider>
  );
}

export default App;
