import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import type { Agent } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { VoiceWaveformAvatar } from './VoiceWaveformAvatar';

interface AgentCardProps {
  agent: Agent;
  hasActiveCall: boolean;
  onCall?: (agent: Agent) => void;
  index?: number;
}

export const AgentCard = ({ agent, hasActiveCall, onCall, index = 0 }: AgentCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.08,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94], // Smooth ease-out with slight bounce at end
      }}
      whileHover={{
        y: -6,
        scale: 1.02,
        transition: {
          duration: 0.3,
          ease: [0.34, 1.56, 0.64, 1] // Subtle spring effect
        }
      }}
      className="group h-full"
    >
      <GlassCard className="relative overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:shadow-[0_12px_40px_rgba(99,102,241,0.3)] before:absolute before:inset-0 before:bg-gradient-to-br before:from-galaxy-600/0 before:to-galaxy-400/0 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-15 before:pointer-events-none">
        {/* Enhanced ambient glow on hover with smooth fade */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-galaxy-700/0 via-galaxy-600/0 to-galaxy-400/0 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(139, 195, 74, 0.1), transparent 70%)'
          }}
        />

        <motion.div
          className="relative space-y-4 flex flex-col h-full"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.06,
                delayChildren: index * 0.08 + 0.15,
              }
            }
          }}
        >
          {/* Avatar and Status */}
          <motion.div
            className="flex items-start justify-between"
            variants={{
              hidden: { opacity: 0, y: 8, scale: 0.9 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
              }
            }}
          >
            <motion.div
              whileHover={{ scale: 1.08, rotate: 3 }}
              transition={{
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1] // Spring-like ease
              }}
            >
              <VoiceWaveformAvatar isActive={hasActiveCall} size="md" />
            </motion.div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              hasActiveCall
                ? 'bg-teal-500/20 text-galaxy-400 border border-teal-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}>
              {hasActiveCall ? 'On Call' : 'Available'}
            </div>
          </motion.div>

          {/* Agent Info */}
          <motion.div
            className="space-y-2"
            variants={{
              hidden: { opacity: 0, y: 8, scale: 0.95 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
              }
            }}
          >
            <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-md bg-galaxy-500/20 text-galaxy-400 text-xs font-medium">
                {agent.category}
              </span>
              <span className="text-xs text-white/60">
                {agent.language}
              </span>
            </div>
            <p className="text-sm text-white/70 line-clamp-2">
              {agent.description}
            </p>
          </motion.div>

          {/* Mini Stats */}
          <motion.div
            className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10"
            variants={{
              hidden: { opacity: 0, y: 8, scale: 0.95 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
              }
            }}
          >
            <div>
              <div className="text-xs text-white/60 mb-1">Success Rate</div>
              <motion.div
                layout
                className="text-lg font-bold font-mono text-galaxy-400"
              >
                {agent.successRate}%
              </motion.div>
            </div>
            <div>
              <div className="text-xs text-white/60 mb-1">Total Calls</div>
              <motion.div
                layout
                className="text-lg font-bold font-mono text-white"
              >
                {agent.totalCalls}
              </motion.div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            onClick={() => onCall?.(agent)}
            className="w-full mt-4 px-4 py-3 rounded-xl bg-galaxy-600/20 text-galaxy-400 font-medium flex items-center justify-center gap-2 border border-galaxy-500/30 relative overflow-hidden group/btn transition-all duration-300 hover:bg-galaxy-600/30 hover:border-galaxy-500/50 hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.5)]"
            variants={{
              hidden: { opacity: 0, y: 8, scale: 0.95 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
              }
            }}
            whileHover={{
              scale: 1.03,
              y: -2,
              transition: {
                duration: 0.25,
                ease: [0.34, 1.56, 0.64, 1]
              }
            }}
            whileTap={{ scale: 0.97 }}
            aria-label={`Initiate call with ${agent.name}`}
          >
            {/* Enhanced shimmer effect on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-galaxy-500/30 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
            <Phone className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Initiate Call</span>
          </motion.button>
        </motion.div>
      </GlassCard>
    </motion.div>
  );
};
