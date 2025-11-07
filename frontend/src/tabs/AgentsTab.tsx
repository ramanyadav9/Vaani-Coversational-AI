import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AgentCard } from '../components/agents/AgentCard';
import { CategorySelector } from '../components/agents/CategorySelector';
import { VoiceVariantSelector } from '../components/agents/VoiceVariantSelector';
import { SpecializedAgentsList } from '../components/agents/SpecializedAgentsList';
import { CallSheet } from '../components/calls/CallSheet';
import { Pagination } from '../components/common/Pagination';
import { LoadingScreen } from '../components/common/LoadingScreen';
import type { Agent, AgentCategory, VoiceVariant } from '../types';
import { agentService } from '../services/api';
import { groupAgentsByCategory } from '../utils/agentGrouping';
import { useSearch } from '../contexts/SearchContext';
import { useLiveCalls } from '../contexts/LiveCallsContext';

type ViewMode = 'categories' | 'voices' | 'specialized';

export function AgentsTab() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | undefined>();
  const [isCallSheetOpen, setIsCallSheetOpen] = useState(false);
  const { searchQuery } = useSearch();

  // Navigation state
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory | null>(null);

  // Pagination state (for flat view if needed)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // 12 fits nicely in 3-column grid

  // Fetch agents from backend
  const { data: agents, isLoading, error } = useQuery({
    queryKey: ['agents'],
    queryFn: () => agentService.getAgents(), // Call with no params to get all agents
  });

  // Use global WebSocket connection for real-time live calls
  const { liveCalls } = useLiveCalls();

  // Group agents by category
  const groupedAgents = useMemo(() => {
    if (!agents) return null;
    return groupAgentsByCategory(agents);
  }, [agents]);

  // Create a list of active call agent IDs
  const activeCallAgentIds = useMemo(() => {
    return liveCalls.map(call => {
      const agent = agents?.find(a =>
        a.id === call.agentId || a.name === call.agentName
      );
      return agent?.id || '';
    }).filter(Boolean);
  }, [liveCalls, agents]);

  // Create a map of agent IDs to active calls (for legacy support)
  const agentCallMap = useMemo(() => {
    const map = new Map<string, boolean>();
    liveCalls.forEach(call => {
      // Match by agent ID or agent name
      const agent = agents?.find(a =>
        a.id === call.agentId || a.name === call.agentName
      );
      if (agent) {
        map.set(agent.id, true);
      }
    });
    return map;
  }, [liveCalls, agents]);

  // Filter agents based on search query
  const filteredAgents = useMemo(() => {
    if (!agents) return [];
    if (!searchQuery.trim()) return agents;

    const query = searchQuery.toLowerCase();
    return agents.filter((agent) =>
      agent.name.toLowerCase().includes(query)
    );
  }, [agents, searchQuery]);

  // Calculate paginated agents
  const paginatedAgents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAgents.slice(startIndex, endIndex);
  }, [filteredAgents, currentPage, itemsPerPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handle items per page change with page adjustment
  const handleItemsPerPageChange = (newSize: number) => {
    setItemsPerPage(newSize);
    // Adjust current page to keep viewing similar content
    const newTotalPages = Math.ceil(filteredAgents.length / newSize);
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages || 1);
    }
  };

  const handleInitiateCall = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsCallSheetOpen(true);
  };

  // Navigation handlers
  const handleSelectCategory = (category: AgentCategory) => {
    console.log(`[AgentsTab] Selected category: ${category.name}, Display mode: ${category.displayMode}`);
    setSelectedCategory(category);

    // Determine view mode based on category display mode
    if (category.displayMode === 'voice-only' || category.displayMode === 'hybrid') {
      setViewMode('voices');
    } else {
      setViewMode('specialized');
    }
  };

  const handleSelectVoice = (variant: VoiceVariant) => {
    // Find the agent by variant's agent ID
    const agent = agents?.find(a => a.id === variant.agentId);
    if (agent) {
      handleInitiateCall(agent);
    }
  };

  const handleBackToCategories = () => {
    setViewMode('categories');
    setSelectedCategory(null);
  };

  // Reset view when search is active
  useEffect(() => {
    if (searchQuery.trim()) {
      setViewMode('categories');
      setSelectedCategory(null);
    }
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">AI Agents</h2>
        <p className="text-white/60">
          {searchQuery.trim()
            ? 'Search results'
            : 'Browse agents by category or search for specific agents'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          Failed to load agents. {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {/* Loading State */}
      {isLoading && <LoadingScreen message="Loading AI agents..." />}

      {/* Main Content */}
      {!isLoading && agents && groupedAgents && (
        <>
          {/* Show search results if search is active */}
          {searchQuery.trim() ? (
            <>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
                layout
              >
                {filteredAgents.length > 0 ? (
                  paginatedAgents.map((agent, index) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      hasActiveCall={agentCallMap.get(agent.id) || false}
                      onCall={handleInitiateCall}
                      index={index}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-white/60 text-lg">
                      No agents match your search
                    </p>
                    <p className="text-white/40 text-sm mt-2">
                      Try a different search term
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Pagination for search results */}
              {filteredAgents.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredAgents.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  pageSizeOptions={[12, 24, 48, 96]}
                  itemLabel="agents"
                />
              )}
            </>
          ) : (
            /* Category-based navigation when no search */
            <AnimatePresence mode="wait">
              {viewMode === 'categories' && (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CategorySelector
                    categories={groupedAgents.categories}
                    onSelectCategory={handleSelectCategory}
                  />
                </motion.div>
              )}

              {viewMode === 'voices' && selectedCategory && (
                <motion.div
                  key="voices"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <VoiceVariantSelector
                    category={selectedCategory}
                    onSelectVoice={handleSelectVoice}
                    onSelectAgent={handleInitiateCall}
                    onBack={handleBackToCategories}
                    activeCallAgentIds={activeCallAgentIds}
                  />
                </motion.div>
              )}

              {viewMode === 'specialized' && selectedCategory && (
                <motion.div
                  key="specialized"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <SpecializedAgentsList
                    category={selectedCategory}
                    activeCallAgentIds={activeCallAgentIds}
                    onSelectAgent={handleInitiateCall}
                    onBack={handleBackToCategories}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </>
      )}

      {/* Call Sheet */}
      <CallSheet
        isOpen={isCallSheetOpen}
        onClose={() => setIsCallSheetOpen(false)}
        agent={selectedAgent}
      />
    </div>
  );
}
