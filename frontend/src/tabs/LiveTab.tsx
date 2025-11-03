import { motion } from 'framer-motion';
import { Phone, Clock, RefreshCw } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { GlassCard } from '../components/ui/GlassCard';
import { liveCallsService } from '../services/api';
import { formatDuration, maskPhoneNumber } from '../lib/utils';
import type { LiveCall } from '../types';

export function LiveTab() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch live calls from backend
  const { data: liveCalls = [], isLoading, error, refetch } = useQuery({
    queryKey: ['liveCalls'],
    queryFn: liveCallsService.getLiveCalls,
    refetchInterval: 1000, // Refresh every 1 second for real-time updates
    refetchOnWindowFocus: true, // Refetch when tab gets focus
  });

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success('Call list refreshed');
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Active Calls</h2>
          <p className="text-white/60">
            Monitor and manage ongoing conversations in real-time
          </p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium
                     transition-all duration-200 flex items-center gap-2 disabled:opacity-50
                     disabled:cursor-not-allowed"
          aria-label="Refresh call list"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          Failed to load active calls. {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* No Active Calls */}
      {!isLoading && liveCalls.length === 0 && (
        <GlassCard>
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <Phone className="w-10 h-10 text-white/40" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Active Calls
            </h3>
            <p className="text-white/60 max-w-md mx-auto">
              Active calls will appear here when agents are connected. Start a call from the Agents tab to see it here.
            </p>
          </div>
        </GlassCard>
      )}

      {/* Active Calls List */}
      {!isLoading && liveCalls.length > 0 && (
        <div className="grid gap-4">
          {liveCalls.map((call, index) => (
            <ActiveCallCard
              key={call.id}
              call={call}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {!isLoading && liveCalls.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>{liveCalls.length} {liveCalls.length === 1 ? 'call' : 'calls'} in progress</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface ActiveCallCardProps {
  call: LiveCall;
  index: number;
}

function ActiveCallCard({
  call,
  index
}: ActiveCallCardProps) {
  // Real-time duration counter
  const [currentDuration, setCurrentDuration] = useState(call.duration);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - call.startTime.getTime()) / 1000);
      setCurrentDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [call.startTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <GlassCard className="relative overflow-hidden">
        {/* Subtle Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-galaxy-600/5 to-galaxy-400/5" />

        <div className="relative p-6 flex items-center justify-between gap-6">
          {/* Left: Status & Agent Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Pulsing Status Indicator */}
            <div className="relative flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping opacity-75" />
            </div>

            {/* Agent & Phone Info */}
            <div className="min-w-0 flex-1">
              <h4 className="text-lg font-semibold text-white mb-1">
                {call.agentName}
              </h4>
              <p className="text-sm text-white/60 font-mono">
                {maskPhoneNumber(call.phoneNumber)}
              </p>
            </div>
          </div>

          {/* Right: Duration */}
          <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10">
            <Clock className="w-4 h-4 text-white/60" />
            <div className="text-right">
              <p className="text-xs text-white/60 mb-0.5">Duration</p>
              <p className="font-mono font-bold text-white text-lg">
                {formatDuration(currentDuration)}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
