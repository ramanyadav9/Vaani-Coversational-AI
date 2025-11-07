// Core Types for Conversational AI Dashboard

// Variable classification types
export type VariableClassification =
  | 'user_input_required'    // Must be provided by user (e.g., customer_name for identification)
  | 'user_input_optional'    // Optional user input (e.g., opening_message - can be auto-generated)
  | 'webhook_populated'      // Auto-fetched from webhooks (e.g., emi_amount, loan_id)
  | 'system_managed';        // Managed by system, not exposed to user

export interface AgentVariable {
  source: string[];
  category: string;
  required: boolean;
  userInput: boolean;
  fieldType: 'text' | 'number' | 'textarea' | 'date';
  label: string;
  placeholder: string;
  classification?: VariableClassification;
  webhook_source?: string | null;
}

export interface AgentVariables {
  agent_id: string;
  agent_name: string;
  category: string;
  variables: Record<string, AgentVariable>;
  variable_count: number;
  required_variables: string[];
  user_input_variables: string[];
  user_input_required_vars?: string[];  // Fields requiring user input
  webhook_populated_vars?: string[];    // Fields auto-populated by webhooks
  tool_count?: number;
  webhook_count?: number;
  has_knowledge_base?: boolean;
  first_message?: string;               // Agent's configured first message template
  system_prompt?: string;               // Agent's system prompt (for reference)
}

export interface Agent {
  id: string;
  name: string;
  category: string; // Allow any category from backend
  avatar?: string;
  isActive: boolean;
  successRate: number;
  totalCalls: number;
  description: string;
  voiceType: 'male' | 'female' | 'neutral';
  language: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  agentId: string;
  agentName: string;
  phoneNumber: string;
  status: 'active' | 'completed' | 'failed';
  duration: number; // in seconds
  timestamp: string;
  transcript: TranscriptMessage[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  outcome?: string;
}

export interface TranscriptMessage {
  id: string;
  role: 'agent' | 'user';
  content: string;
  timestamp: string;
}

export interface CallAnalytics {
  callsToday: number;
  successRate: number;
  avgDuration: number; // in seconds
  topAgent: {
    name: string;
    calls: number;
  };
  trend: {
    calls: number; // percentage change
    success: number;
    duration: number;
  };
}

export interface LiveCall {
  id: string;
  conversationId: string; // Used for ending calls
  agentId: string;
  agentName: string;
  phoneNumber: string;
  status: 'ringing' | 'connected' | 'on-hold';
  duration: number;
  startTime: Date; // For real-time duration calculation
}

export type TabType = 'agents' | 'live' | 'history';

export interface VoiceWaveformProps {
  isActive: boolean;
  barCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

export interface CallSheetProps {
  isOpen: boolean;
  onClose: () => void;
  agent?: Agent;
}

// Voice and Category Types for Agent Organization
export interface VoiceVariant {
  language: string; // e.g., "English", "Hindi", "British"
  gender: 'male' | 'female';
  agentId: string;
  agentName: string;
}

export type CategoryDisplayMode = 'voice-only' | 'specialized-only' | 'hybrid';

export interface AgentCategory {
  name: string;
  displayName: string;
  icon: string;
  count: number;
  hasVoiceVariants: boolean;
  displayMode: CategoryDisplayMode; // How to display this category
  agents: Agent[];
  voiceVariantAgents?: Agent[]; // For hybrid mode: agents with voice variants
  specializedAgents?: Agent[]; // For hybrid mode: specialized agents
}

export type CategoryType =
  | 'Banking'
  | 'Healthcare'
  | 'Real Estate'
  | 'Traffic'
  | 'Municipal'
  | 'Hospitality'
  | 'Specialized Agents';

export interface GroupedAgents {
  categories: AgentCategory[];
  totalAgents: number;
}
