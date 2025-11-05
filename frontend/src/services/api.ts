import axios from 'axios';
import type { Agent, Conversation } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Backend agent structure from ElevenLabs
interface BackendAgent {
  agent_id: string;
  name: string;
  tags?: string[];
  created_at_unix_secs: number;
  last_call_time_unix_secs: number | null;
  archived: boolean;
  category?: string;
  voiceGender?: string;
  voiceLanguage?: string;
  description?: string;
}

// Transform backend agent to frontend format
function transformAgent(backendAgent: BackendAgent, totalCalls: number = 0, successRate: number = 0): Agent {
  return {
    id: backendAgent.agent_id,
    name: backendAgent.name,
    category: (backendAgent.category as any) || 'Custom',
    isActive: !backendAgent.archived,
    successRate: successRate,
    totalCalls: totalCalls,
    description: backendAgent.description || `AI agent for ${backendAgent.category || 'general'} tasks`,
    voiceType: (backendAgent.voiceGender as any) || 'neutral',
    language: backendAgent.voiceLanguage || 'English (US)',
    createdAt: new Date(backendAgent.created_at_unix_secs * 1000).toISOString(),
  };
}

export const agentService = {
  async getAgents(limit?: number, page?: number): Promise<Agent[]> {
    try {
      // Add pagination params if provided
      const params: any = {};
      if (limit) params.limit = limit;
      if (page) params.page = page;

      // Fetch agents first - ALWAYS show all agents!
      const agentsResponse = await api.get<{ agents: BackendAgent[] }>('/agents', { params });
      const agents = agentsResponse.data.agents;

      // Try to fetch today's conversations for stats (but don't block if it fails)
      let conversations: BackendConversation[] = [];
      try {
        const conversationsResponse = await api.get<{ conversations: BackendConversation[] }>('/conversations', {
          params: { dateFilter: 'today' } // Only today's conversations for fast stats
        });
        conversations = conversationsResponse.data.conversations || [];
        console.log(`Loaded ${conversations.length} conversations for agent stats calculation`);
      } catch (error) {
        console.warn('Failed to fetch conversations for stats, showing agents without stats:', error);
        conversations = [];
      }

      // Calculate stats for each agent
      return agents.map(agent => {
        const agentConversations = conversations.filter(
          conv => conv.agent_id === agent.agent_id
        );

        const totalCalls = agentConversations.length;

        // Count successful calls based on various success indicators
        const successfulCalls = agentConversations.filter(conv => {
          // Check multiple possible success indicators
          const isSuccessful =
            conv.analysis?.call_successful === true ||
            conv.analysis?.call_successful === 'success' ||
            conv.status === 'done';

          return isSuccessful;
        }).length;

        // Calculate success rate with proper rounding
        const successRate = totalCalls > 0
          ? Math.round((successfulCalls / totalCalls) * 100 * 10) / 10
          : 0;

        return transformAgent(agent, totalCalls, successRate);
      });
    } catch (error) {
      console.error('Failed to fetch agents with stats:', error);
      // Fallback: return agents without stats
      const response = await api.get<{ agents: BackendAgent[] }>('/agents');
      return response.data.agents.map(agent => transformAgent(agent, 0, 0));
    }
  },

  async getPhoneConfig() {
    const response = await api.get('/agents/phone-config');
    return response.data;
  },
};

interface CallRequest {
  agent_id: string;
  to_number: string;
  language?: 'English' | 'Hindi' | string;  // Language override for agent
  custom_variables?: Record<string, string | number | boolean>;  // All dynamic variables
}

interface CallResponse {
  success: boolean;
  data?: {
    conversation_id?: string;
    [key: string]: any;
  };
  conversation_id?: string;
  message?: string;
  error?: string;
  details?: string;
}

export const callService = {
  async initiateCall(data: CallRequest): Promise<CallResponse> {
    const response = await api.post<CallResponse>('/call', data);
    return response.data;
  },
};

// Backend conversation structure from ElevenLabs
interface BackendConversation {
  conversation_id: string;
  agent_id: string;
  agent_name?: string; // Included in list response
  status: string;
  start_time_unix_secs?: number; // Direct field in list response
  call_duration_secs?: number; // Direct field in list response
  direction?: string;
  metadata?: {
    caller_number?: string;
    start_time_unix_secs?: number;
    call_duration_secs?: number;
    phone_call?: {
      external_number?: string;
    };
  };
  analysis?: {
    call_successful?: string | boolean;
    transcript_summary?: string;
    transcript?: Array<{
      role: string;
      message: string;
    }>;
  };
  transcript?: Array<{
    role: string;
    message: string;
  }>;
}

// Transform backend conversation to frontend format
function transformConversation(backendConv: BackendConversation, agentName?: string): Conversation {
  // Get phone number from metadata or phone_call.external_number
  const phoneNumber = backendConv.metadata?.caller_number
    || backendConv.metadata?.phone_call?.external_number
    || 'Unknown';

  // Get start time from direct field or metadata
  const startTimeUnix = backendConv.start_time_unix_secs || backendConv.metadata?.start_time_unix_secs;
  const startTime = startTimeUnix
    ? new Date(startTimeUnix * 1000).toISOString()
    : new Date().toISOString();

  // Get duration from direct field or metadata
  const duration = backendConv.call_duration_secs || backendConv.metadata?.call_duration_secs || 0;

  // Map status
  let status: 'active' | 'completed' | 'failed' = 'completed';
  if (backendConv.status === 'done') status = 'completed';
  else if (backendConv.status === 'failed') status = 'failed';
  else if (backendConv.status === 'in_progress') status = 'active';

  // Transform transcript from both possible locations
  const transcriptSource = backendConv.transcript || backendConv.analysis?.transcript || [];
  console.log('Transcript transformation:', {
    conversationId: backendConv.conversation_id,
    hasTranscript: !!backendConv.transcript,
    hasAnalysisTranscript: !!backendConv.analysis?.transcript,
    transcriptLength: transcriptSource.length,
    firstMessage: transcriptSource[0],
  });

  const transcript = transcriptSource.map((msg, idx) => ({
    id: `msg-${idx}`,
    role: msg.role as 'agent' | 'user',
    content: msg.message,
    timestamp: startTime,
  }));

  console.log('Transformed transcript:', {
    conversationId: backendConv.conversation_id,
    transcriptLength: transcript.length,
    firstTransformed: transcript[0],
  });

  // Determine sentiment from call_successful field
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (backendConv.analysis?.call_successful === 'success' || backendConv.analysis?.call_successful === true) {
    sentiment = 'positive';
  } else if (backendConv.analysis?.call_successful === 'failed' || backendConv.analysis?.call_successful === false) {
    sentiment = 'negative';
  }

  return {
    id: backendConv.conversation_id,
    agentId: backendConv.agent_id,
    agentName: agentName || backendConv.agent_name || 'AI Agent',
    phoneNumber: phoneNumber,
    status: status,
    duration: duration,
    timestamp: startTime,
    transcript: transcript,
    sentiment: sentiment,
  };
}

export const conversationService = {
  async getConversations(dateFilter?: string): Promise<Conversation[]> {
    try {
      // Add date filter query parameter if provided
      const params = dateFilter ? { dateFilter } : {};
      const response = await api.get<{
        conversations: BackendConversation[];
        total?: number;
        filtered?: number;
      }>('/conversations', { params });

      console.log(`Conversations response: ${response.data.conversations.length} conversations${dateFilter ? ` (filter: ${dateFilter})` : ''}`);

      // Backend already includes agent_name in the response, so we can use it directly
      return response.data.conversations.map(conv => transformConversation(conv));
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      throw error;
    }
  },

  async getConversationById(conversationId: string): Promise<Conversation> {
    try {
      const response = await api.get<BackendConversation>(`/conversations/${conversationId}`);
      console.log('Single conversation response:', response.data);

      // For single conversation, we need to fetch agent name separately
      // since the detailed endpoint doesn't include it
      let agentName: string | undefined;
      try {
        const agentsResponse = await api.get<{ agents: BackendAgent[] }>('/agents');
        const agent = agentsResponse.data.agents.find(a => a.agent_id === response.data.agent_id);
        agentName = agent?.name;
      } catch (agentError) {
        console.error('Failed to fetch agent name:', agentError);
      }

      return transformConversation(response.data, agentName);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      throw error;
    }
  },
};

// Live calls service
export const liveCallsService = {
  async getLiveCalls() {
    try {
      // Get conversations with status 'in_progress' or 'active'
      const response = await api.get<{ conversations: BackendConversation[] }>('/conversations');

      // Log all conversations for debugging
      console.log('All conversations from backend:', response.data.conversations.map(c => ({
        id: c.conversation_id,
        status: c.status,
        agent: c.agent_name
      })));

      // Log all unique status values to help debug
      const uniqueStatuses = [...new Set(response.data.conversations.map(c => c.status))];
      console.log('Live calls - Unique status values found:', uniqueStatuses);

      const now = Date.now();
      const MAX_CALL_DURATION_MS = 15 * 60 * 1000; // 15 minutes in milliseconds (reduced from 2 hours)

      const activeCalls = response.data.conversations
        .filter(conv => {
          // Use WHITELIST approach: only show calls with truly active statuses
          // "initiated" status is a TRANSITIONAL state - call is being connected, not failed
          // We must INCLUDE "initiated" to avoid auto-closing calls immediately after answering
          const isActive = conv.status === 'in_progress'
            || conv.status === 'active'
            || conv.status === 'ongoing'
            || conv.status === 'in-progress'
            || conv.status === 'initiated';  // CRITICAL: Include initiated - call is connecting

          // For backwards compatibility, also exclude known ended statuses
          const isEnded = conv.status === 'done'
            || conv.status === 'completed'
            || conv.status === 'failed'
            || conv.status === 'cancelled'
            || conv.status === 'terminated';
            // REMOVED 'initiated' - it's NOT an ended state, it means call is connecting

          // Only show calls that are truly active (not ended, not initiated-only)
          const shouldShow = isActive && !isEnded;

          if (shouldShow) {
            console.log('Live call found (truly active):', {
              id: conv.conversation_id,
              status: conv.status,
              agent: conv.agent_name,
            });
          } else {
            console.log('Excluding call:', {
              id: conv.conversation_id,
              status: conv.status,
              reason: isEnded ? 'ended/failed/initiated' : 'unknown status',
              agent: conv.agent_name,
            });
          }

          return shouldShow;
        })
        .map(conv => {
          // Get phone number from metadata or phone_call.external_number
          const phoneNumber = conv.metadata?.caller_number
            || conv.metadata?.phone_call?.external_number
            || 'Unknown';

          // Get start time from direct field or metadata
          const startTimeUnix = conv.start_time_unix_secs || conv.metadata?.start_time_unix_secs;
          const startTime = startTimeUnix
            ? new Date(startTimeUnix * 1000)
            : new Date();

          const duration = Math.floor((now - startTime.getTime()) / 1000);

          return {
            id: conv.conversation_id,
            conversationId: conv.conversation_id,
            agentId: conv.agent_id,
            agentName: conv.agent_name || 'AI Agent', // Use agent_name from backend response
            phoneNumber: phoneNumber,
            status: 'connected' as const,
            duration: duration,
            startTime: startTime,
          };
        })
        // Filter out stale calls (calls that have been "active" for more than 15 minutes)
        // This helps clean up calls that may have ended but backend status didn't update
        .filter(call => {
          const callAge = now - call.startTime.getTime();
          if (callAge > MAX_CALL_DURATION_MS) {
            console.log(`Filtering out stale call ${call.conversationId} - active for ${Math.floor(callAge / 1000 / 60)} minutes`);
            return false;
          }
          return true;
        });

      console.log('Live calls - Active calls found:', activeCalls.length);
      return activeCalls;
    } catch (error) {
      console.error('Failed to fetch live calls:', error);
      return [];
    }
  },
};
