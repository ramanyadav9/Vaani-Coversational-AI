// Core Types for Conversational AI Dashboard

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
