import { useQuery } from '@tanstack/react-query';
import type { CallAnalytics } from '../types';
import { conversationService, agentService } from '../services/api';

export function useCallAnalytics() {
  // Fetch conversations and agents
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: conversationService.getConversations,
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: agentService.getAgents,
  });

  // Calculate analytics from real data
  const analytics: CallAnalytics = {
    callsToday: 0,
    successRate: 0,
    avgDuration: 0,
    topAgent: {
      name: 'N/A',
      calls: 0
    },
    trend: {
      calls: 0,
      success: 0,
      duration: 0
    }
  };

  if (conversations.length > 0) {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter today's calls
    const todaysCalls = conversations.filter(conv => {
      const callDate = new Date(conv.timestamp);
      return callDate >= today;
    });

    analytics.callsToday = todaysCalls.length;

    // Calculate success rate (completed calls / total calls)
    const completedCalls = conversations.filter(conv => conv.status === 'completed').length;
    analytics.successRate = conversations.length > 0
      ? Math.round((completedCalls / conversations.length) * 100 * 10) / 10
      : 0;

    // Calculate average duration
    const totalDuration = conversations.reduce((sum, conv) => sum + (conv.duration || 0), 0);
    analytics.avgDuration = conversations.length > 0
      ? Math.round(totalDuration / conversations.length)
      : 0;

    // Find top agent
    if (agents.length > 0) {
      const agentCallCounts = agents.map(agent => ({
        name: agent.name,
        calls: conversations.filter(conv => conv.agentId === agent.id).length
      }));

      const topAgent = agentCallCounts.reduce((prev, current) =>
        current.calls > prev.calls ? current : prev
      );

      if (topAgent.calls > 0) {
        analytics.topAgent = topAgent;
      }
    }
  }

  return {
    analytics,
    isLoading: false // We rely on parent queries for loading states
  };
}
