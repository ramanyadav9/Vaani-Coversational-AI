import { motion } from 'framer-motion';
import { Phone, Check } from 'lucide-react';

interface CallProgressAnimationProps {
  status: 'idle' | 'calling' | 'connected' | 'ended';
}

export function CallProgressAnimation({ status }: CallProgressAnimationProps) {
  return (
    <div className="relative w-32 h-32 mx-auto">
      {/* Outer Circle - Pulse Ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-galaxy-600/20 border-2 border-galaxy-600/40"
        animate={{
          scale: status === 'calling' ? [1, 1.2, 1] : 1,
          opacity: status === 'calling' ? [0.4, 0.1, 0.4] : 0.4
        }}
        transition={{
          duration: 2,
          repeat: status === 'calling' ? Infinity : 0,
          ease: 'easeInOut'
        }}
      />

      {/* Middle Circle */}
      <motion.div
        className="absolute inset-4 rounded-full bg-galaxy-600/30 border-2 border-galaxy-600/60"
        animate={{
          scale: status === 'calling' ? [1, 1.15, 1] : 1,
          opacity: status === 'calling' ? [0.5, 0.2, 0.5] : 0.5
        }}
        transition={{
          duration: 2,
          delay: 0.2,
          repeat: status === 'calling' ? Infinity : 0,
          ease: 'easeInOut'
        }}
      />

      {/* Inner Circle with Icon */}
      <motion.div
        className={`absolute inset-8 rounded-full flex items-center justify-center ${
          status === 'connected'
            ? 'bg-gradient-to-br from-green-500 to-teal-400'
            : status === 'ended'
            ? 'bg-gradient-to-br from-gray-500 to-gray-600'
            : 'bg-gradient-to-br from-galaxy-700 to-galaxy-400'
        }`}
        animate={{
          scale: status === 'calling' ? [1, 1.1, 1] : status === 'connected' ? 1.05 : 1
        }}
        transition={{
          duration: 2,
          delay: 0.4,
          repeat: status === 'calling' ? Infinity : 0,
          ease: 'easeInOut'
        }}
      >
        {status === 'calling' && (
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <Phone className="w-10 h-10 text-white" />
          </motion.div>
        )}
        {status === 'connected' && (
          <Phone className="w-10 h-10 text-white" />
        )}
        {status === 'ended' && (
          <Check className="w-10 h-10 text-white" />
        )}
      </motion.div>
    </div>
  );
}
