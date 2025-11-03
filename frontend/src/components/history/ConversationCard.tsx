import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Phone, Clock, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Conversation } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { TranscriptChat } from './TranscriptChat';
import { formatDuration, formatDate, formatTime, getStatusColor } from '../../lib/utils';
import { conversationService } from '../../services/api';

interface ConversationCardProps {
  conversation: Conversation;
  index?: number;
}

export function ConversationCard({ conversation, index = 0 }: ConversationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fullConversation, setFullConversation] = useState<Conversation | null>(null);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  // Fetch full conversation details when expanded
  useEffect(() => {
    if (isExpanded && !fullConversation && conversation.transcript.length === 0) {
      setIsLoadingTranscript(true);
      setTranscriptError(null);

      conversationService
        .getConversationById(conversation.id)
        .then((fullConv) => {
          console.log('Fetched full conversation:', fullConv);
          setFullConversation(fullConv);
          setIsLoadingTranscript(false);
        })
        .catch((error) => {
          console.error('Failed to fetch conversation details:', error);
          setTranscriptError('Failed to load transcript');
          setIsLoadingTranscript(false);
        });
    }
  }, [isExpanded, conversation.id, conversation.transcript.length, fullConversation]);

  // Use full conversation if available, otherwise use the original
  const displayConversation = fullConversation || conversation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <GlassCard>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white">{conversation.agentName}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.status)} bg-opacity-20 border border-current`}>
                {conversation.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>{conversation.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(conversation.duration)}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/80">{formatDate(conversation.timestamp)}</div>
            <div className="text-xs text-white/60">{formatTime(conversation.timestamp)}</div>
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center gap-2 transition-all duration-200"
          aria-expanded={isExpanded}
          aria-controls={`transcript-${conversation.id}`}
        >
          <span className="text-sm font-medium">
            {isExpanded ? 'Hide Transcript' : 'Show Transcript'}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Transcript */}
        <motion.div
          id={`transcript-${conversation.id}`}
          initial={false}
          animate={{
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-white/10">
              {isLoadingTranscript ? (
                <div className="flex items-center justify-center py-8 text-white/60">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>Loading transcript...</span>
                </div>
              ) : transcriptError ? (
                <div className="py-8 text-center text-red-400">
                  {transcriptError}
                </div>
              ) : displayConversation.transcript.length > 0 ? (
                <TranscriptChat messages={displayConversation.transcript} />
              ) : (
                <div className="py-8 text-center text-white/40">
                  No transcript available for this conversation
                </div>
              )}
            </div>
          )}
        </motion.div>
      </GlassCard>
    </motion.div>
  );
}
