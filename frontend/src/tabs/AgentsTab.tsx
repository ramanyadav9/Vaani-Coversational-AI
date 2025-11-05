import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AgentCard } from '../components/agents/AgentCard';
import { CallSheet } from '../components/calls/CallSheet';
import { Pagination } from '../components/common/Pagination';
import type { Agent } from '../types';
import { agentService } from '../services/api';
import { useSearch } from '../contexts/SearchContext';
import { useLiveCalls } from '../contexts/LiveCallsContext';

export function AgentsTab() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | undefined>();
  const [isCallSheetOpen, setIsCallSheetOpen] = useState(false);
  const { searchQuery } = useSearch();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // 12 fits nicely in 3-column grid

  // Fetch agents from backend
  const { data: agents, isLoading, error } = useQuery({
    queryKey: ['agents'],
    queryFn: () => agentService.getAgents(), // Call with no params to get all agents
  });

  // Use global WebSocket connection for real-time live calls
  const { liveCalls } = useLiveCalls();

  // Create a map of agent IDs to active calls
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">AI Agents</h2>
        <p className="text-white/60">
          Manage and deploy your conversational AI agents
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          Failed to load agents. {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Agents Grid */}
      {!isLoading && agents && (
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
                  {searchQuery ? 'No agents match your search' : 'No agents found'}
                </p>
                <p className="text-white/40 text-sm mt-2">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Create an agent to get started'}
                </p>
              </div>
            )}
          </motion.div>

          {/* Pagination */}
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
