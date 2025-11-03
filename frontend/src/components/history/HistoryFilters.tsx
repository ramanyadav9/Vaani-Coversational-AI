import { Search, X, Calendar, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export type DateFilterType = 'all' | 'today' | 'yesterday' | 'last7days' | 'last30days';

interface HistoryFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedAgent: string;
  onAgentChange: (agent: string) => void;
  dateFilter: DateFilterType;
  onDateFilterChange: (filter: DateFilterType) => void;
  availableAgents: string[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function HistoryFilters({
  searchQuery,
  onSearchChange,
  selectedAgent,
  onAgentChange,
  dateFilter,
  onDateFilterChange,
  availableAgents,
  onClearFilters,
  hasActiveFilters,
}: HistoryFiltersProps) {
  const dateFilterOptions: { value: DateFilterType; label: string }[] = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mb-6"
    >
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/60">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all filters
          </button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by agent, phone, or ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Agent Filter */}
        <div className="relative">
          <select
            value={selectedAgent}
            onChange={(e) => onAgentChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
          >
            <option value="all" className="bg-gray-900">
              All Agents
            </option>
            {availableAgents.map((agent) => (
              <option key={agent} value={agent} className="bg-gray-900">
                {agent}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          <select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value as DateFilterType)}
            className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
          >
            {dateFilterOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-gray-900">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <div className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs text-indigo-300 flex items-center gap-1">
              <span>Search: {searchQuery}</span>
              <button
                onClick={() => onSearchChange('')}
                className="hover:text-indigo-100 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {selectedAgent !== 'all' && (
            <div className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs text-indigo-300 flex items-center gap-1">
              <span>Agent: {selectedAgent}</span>
              <button
                onClick={() => onAgentChange('all')}
                className="hover:text-indigo-100 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {dateFilter !== 'all' && (
            <div className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs text-indigo-300 flex items-center gap-1">
              <span>
                {dateFilterOptions.find((opt) => opt.value === dateFilter)?.label}
              </span>
              <button
                onClick={() => onDateFilterChange('all')}
                className="hover:text-indigo-100 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
