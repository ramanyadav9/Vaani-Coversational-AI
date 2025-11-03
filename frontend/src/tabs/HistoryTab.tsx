import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ConversationCard } from '../components/history/ConversationCard';
import { HistoryFilters } from '../components/history/HistoryFilters';
import type { DateFilterType } from '../components/history/HistoryFilters';
import { conversationService } from '../services/api';
import { isToday, isYesterday, isWithinLastDays } from '../lib/utils';
import type { Conversation } from '../types';

export function HistoryTab() {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');

  // Fetch conversations from backend
  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: conversationService.getConversations,
    refetchInterval: 3000, // Refresh every 3 seconds for faster status updates
    refetchOnWindowFocus: true, // Refetch when tab gets focus
  });

  // Extract unique agent names for filter dropdown
  const availableAgents = useMemo(() => {
    if (!conversations) return [];
    const agents = new Set(conversations.map((c) => c.agentName));
    return Array.from(agents).sort();
  }, [conversations]);

  // Apply filters to conversations
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];

    return conversations.filter((conversation) => {
      // Search filter - search across agent name, phone number, and conversation ID
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          conversation.agentName.toLowerCase().includes(query) ||
          conversation.phoneNumber.toLowerCase().includes(query) ||
          conversation.id.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }

      // Agent filter
      if (selectedAgent !== 'all' && conversation.agentName !== selectedAgent) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const timestamp = conversation.timestamp;

        switch (dateFilter) {
          case 'today':
            if (!isToday(timestamp)) return false;
            break;
          case 'yesterday':
            if (!isYesterday(timestamp)) return false;
            break;
          case 'last7days':
            if (!isWithinLastDays(timestamp, 7)) return false;
            break;
          case 'last30days':
            if (!isWithinLastDays(timestamp, 30)) return false;
            break;
        }
      }

      return true;
    });
  }, [conversations, searchQuery, selectedAgent, dateFilter]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== '' || selectedAgent !== 'all' || dateFilter !== 'all';

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedAgent('all');
    setDateFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Call History</h2>
        <p className="text-white/60">
          Review past conversations and transcripts
        </p>
      </div>

      {/* Filters */}
      {!isLoading && conversations && conversations.length > 0 && (
        <HistoryFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedAgent={selectedAgent}
          onAgentChange={setSelectedAgent}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          availableAgents={availableAgents}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          Failed to load conversations. {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Conversations List */}
      {!isLoading && conversations && (
        <div className="space-y-4">
          {filteredConversations.length > 0 ? (
            <>
              {/* Results count */}
              {hasActiveFilters && (
                <div className="text-sm text-white/60">
                  Showing {filteredConversations.length} of {conversations.length} conversation
                  {conversations.length !== 1 ? 's' : ''}
                </div>
              )}

              {/* Filtered conversations */}
              {filteredConversations.map((conversation, index) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  index={index}
                />
              ))}
            </>
          ) : conversations.length > 0 ? (
            // No results after filtering
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No conversations match your filters</p>
              <p className="text-white/40 text-sm mt-2">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-galaxy-600/20 hover:bg-galaxy-600/30 border border-galaxy-500/30 rounded-lg text-galaxy-400 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            // No conversations at all
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No conversations yet</p>
              <p className="text-white/40 text-sm mt-2">
                Start a call with an agent to see conversations here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
