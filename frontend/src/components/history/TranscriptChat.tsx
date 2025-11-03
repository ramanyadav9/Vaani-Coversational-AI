import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import type { TranscriptMessage } from '../../types';
import { formatTime } from '../../lib/utils';

interface TranscriptChatProps {
  messages: TranscriptMessage[];
}

export function TranscriptChat({ messages }: TranscriptChatProps) {
  return (
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* Avatar */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'agent'
                ? 'bg-indigo-600/20 text-indigo-400'
                : 'bg-gray-600/20 text-gray-400'
            }`}
          >
            {message.role === 'agent' ? (
              <Bot className="w-4 h-4" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>

          {/* Message Bubble */}
          <div className="flex-1 max-w-[80%]">
            <div
              className={`px-4 py-3 rounded-2xl ${
                message.role === 'agent'
                  ? 'bg-indigo-600/20 text-white rounded-tl-none'
                  : 'bg-gray-600/20 text-white rounded-tr-none'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
            <div
              className={`mt-1 text-xs font-mono text-white/40 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              {formatTime(message.timestamp)}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
