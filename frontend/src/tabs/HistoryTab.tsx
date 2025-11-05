import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ConversationCard } from '../components/history/ConversationCard';
import { HistoryFilters } from '../components/history/HistoryFilters';
import { Pagination } from '../components/common/Pagination';
import type { DateFilterType } from '../components/history/HistoryFilters';
import { conversationService } from '../services/api';
import { isToday, isYesterday, isWithinLastDays } from '../lib/utils';
import type { Conversation } from '../types';

export function HistoryTab() {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State for initial load optimization
  const [loadAllConversations, setLoadAllConversations] = useState(false);

  // Fetch conversations from backend - smart lazy loading
  // Initially load TODAY only for fast initial render
  // Load all when user requests via date filter or "Load All" button
  const shouldLoadAll = loadAllConversations || dateFilter === 'all' || dateFilter === 'last7days' || dateFilter === 'last30days';
  const apiDateFilter = shouldLoadAll ? undefined : (dateFilter !== 'all' ? dateFilter : 'today');

  const { data: conversations, isLoading, error, refetch } = useQuery({
    queryKey: ['conversations', apiDateFilter || 'today'], // Normalize undefined to 'today' for cache key consistency
    queryFn: () => conversationService.getConversations(apiDateFilter),
    // No auto-refresh for history - it's past data that doesn't change frequently
    // Users can manually refresh if needed
    refetchOnWindowFocus: false,
    staleTime: 60000, // Consider data fresh for 1 minute
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

  // Calculate paginated conversations
  const paginatedConversations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredConversations.slice(startIndex, endIndex);
  }, [filteredConversations, currentPage, itemsPerPage]);

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedAgent, dateFilter]);

  // Handle items per page change with page adjustment
  const handleItemsPerPageChange = (newSize: number) => {
    setItemsPerPage(newSize);
    // Adjust current page to keep viewing similar content
    const newTotalPages = Math.ceil(filteredConversations.length / newSize);
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages || 1);
    }
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== '' || selectedAgent !== 'all' || dateFilter !== 'all';

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedAgent('all');
    setDateFilter('all');
  };

  // Manual refresh handler
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success('History refreshed');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Call History</h2>
          <p className="text-white/60">
            {!loadAllConversations && dateFilter === 'all'
              ? "Showing today's conversations only (for fast loading)"
              : "Review past conversations and transcripts"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Load All Button - shown only when showing today by default */}
          {!loadAllConversations && dateFilter === 'all' && (
            <button
              onClick={() => setLoadAllConversations(true)}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-galaxy-600/20 hover:bg-galaxy-600/30 border border-galaxy-500/30 text-galaxy-400 font-medium
                         transition-all duration-200 flex items-center gap-2 disabled:opacity-50
                         disabled:cursor-not-allowed"
              aria-label="Load all conversations"
            >
              <span>Load All History</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing || isLoading}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium
                       transition-all duration-200 flex items-center gap-2 disabled:opacity-50
                       disabled:cursor-not-allowed"
            aria-label="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
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
        <div className="relative space-y-4">
          {/* Refreshing Overlay */}
          {isRefreshing && (
            <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-galaxy-400 animate-spin" />
                <p className="text-white font-medium">Refreshing history...</p>
              </div>
            </div>
          )}

          {filteredConversations.length > 0 ? (
            <>
              {/* Results count */}
              {hasActiveFilters && (
                <div className="text-sm text-white/60">
                  Showing {filteredConversations.length} of {conversations.length} conversation
                  {conversations.length !== 1 ? 's' : ''}
                </div>
              )}

              {/* Paginated conversations */}
              {paginatedConversations.map((conversation, index) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  index={index}
                />
              ))}

              {/* Pagination */}
              {filteredConversations.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredConversations.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  pageSizeOptions={[10, 25, 50, 100]}
                  itemLabel="conversations"
                />
              )}
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
