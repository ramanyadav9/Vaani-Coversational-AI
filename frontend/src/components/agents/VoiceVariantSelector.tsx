import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, Globe, User, UserCircle2 } from 'lucide-react';
import type { Agent, VoiceVariant, AgentCategory } from '../../types';
import { getUniqueVoiceVariants, getVoiceVariantLabel } from '../../utils/agentGrouping';
import { AgentCard } from './AgentCard';

interface VoiceVariantSelectorProps {
  category: AgentCategory;
  onSelectVoice: (variant: VoiceVariant) => void;
  onSelectAgent?: (agent: Agent) => void; // For specialized agents in hybrid mode
  onBack: () => void;
  activeCallAgentIds?: string[]; // For hybrid mode
}

/**
 * Get language flag emoji based on language name
 */
const getLanguageFlag = (language: string): string => {
  const flags: Record<string, string> = {
    'English': '🇺🇸',
    'British': '🇬🇧',
    'Hindi': '🇮🇳',
  };
  return flags[language] || '🌐';
};

/**
 * Get gender icon component from lucide-react
 */
const getGenderIcon = (gender: 'male' | 'female') => {
  return gender === 'male' ? User : UserCircle2;
};

export const VoiceVariantSelector: React.FC<VoiceVariantSelectorProps> = ({
  category,
  onSelectVoice,
  onSelectAgent,
  onBack,
  activeCallAgentIds = [],
}) => {
  const voiceVariants = getUniqueVoiceVariants(
    category.voiceVariantAgents || category.agents
  );

  const isHybridMode = category.displayMode === 'hybrid';
  const specializedAgents = category.specializedAgents || [];

  console.log(`[VoiceVariantSelector] Category: ${category.name}, Display Mode: ${category.displayMode}`);
  console.log(`[VoiceVariantSelector] Voice Variants: ${voiceVariants.length}, Specialized: ${specializedAgents.length}`);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to Categories</span>
      </button>

      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {category.displayName}
        </h2>
        <p className="text-gray-400">
          {isHybridMode
            ? 'Select a voice variant or choose a specialized agent'
            : 'Select a voice variant to continue'}
        </p>
      </div>

      {/* Voice Variants Section */}
      {voiceVariants.length > 0 && (
        <div className="space-y-3">
          {isHybridMode && (
            <div className="flex items-center gap-2 text-purple-400 font-semibold">
              <Mic size={18} />
              <h3 className="text-base">Voice Variants</h3>
              <span className="text-sm text-gray-500">({voiceVariants.length})</span>
            </div>
          )}

          {/* Voice Variants Grid - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {voiceVariants.map((variant, index) => {
              const GenderIcon = getGenderIcon(variant.gender);
              return (
                <motion.button
                  key={`${variant.language}_${variant.gender}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectVoice(variant)}
                  className="group relative"
                >
                  <div className="relative bg-gradient-to-br from-purple-500/15 to-pink-500/15 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-purple-400/50 transition-all duration-300 overflow-hidden">
                    {/* Background Gradient Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all duration-500" />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Language Flag & Gender Icon Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-3xl transform group-hover:scale-110 transition-transform">
                          {getLanguageFlag(variant.language)}
                        </div>
                        <div className="transform group-hover:scale-110 transition-transform">
                          <GenderIcon className="w-7 h-7 text-purple-400" />
                        </div>
                      </div>

                      {/* Language & Gender Text */}
                      <div className="text-center space-y-1">
                        <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                          <Globe size={14} className="text-purple-400" />
                          {variant.language}
                        </h3>
                        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                          <Mic size={12} />
                          <span className="capitalize">{variant.gender} Voice</span>
                        </div>
                      </div>
                    </div>

                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Specialized Agents Section (Hybrid Mode) */}
      {isHybridMode && specializedAgents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {/* Section Divider */}
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-sm text-gray-500 bg-[#0a0118]">OR</span>
            </div>
          </div>

          {/* Specialized Agents Header */}
          <div className="flex items-center gap-2 text-pink-400 font-semibold">
            <span className="text-xl">{category.icon}</span>
            <h3 className="text-base">Specialized Agents</h3>
            <span className="text-sm text-gray-500">({specializedAgents.length})</span>
          </div>

          {/* Specialized Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specializedAgents.map((agent, index) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                hasActiveCall={activeCallAgentIds.includes(agent.id)}
                onCall={onSelectAgent || (() => {})}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {voiceVariants.length === 0 && specializedAgents.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg mb-2">No agents available for this category.</p>
          <p className="text-sm text-gray-600 mb-6">
            This category doesn't have any active agents at the moment.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
          >
            Go back to categories
          </button>
        </div>
      )}
    </div>
  );
};
