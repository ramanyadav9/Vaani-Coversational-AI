import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { Agent, AgentCategory } from '../../types';
import { AgentCard } from './AgentCard';

interface SpecializedAgentsListProps {
  category: AgentCategory;
  activeCallAgentIds: string[];
  onSelectAgent: (agent: Agent) => void;
  onBack: () => void;
}

export const SpecializedAgentsList: React.FC<SpecializedAgentsListProps> = ({
  category,
  activeCallAgentIds,
  onSelectAgent,
  onBack,
}) => {
  console.log(`[SpecializedAgentsList] Category: ${category.name}, Agent count: ${category.agents.length}`);
  console.log('[SpecializedAgentsList] Agents:', category.agents.map(a => a.name));

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Categories</span>
      </button>

      {/* Title */}
      <div className="text-center">
        <div className="text-4xl mb-3">{category.icon}</div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {category.displayName}
        </h2>
        <p className="text-gray-400">
          Select an agent to initiate a call
        </p>
      </div>

      {/* Agents Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {category.agents.map((agent, index) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            hasActiveCall={activeCallAgentIds.includes(agent.id)}
            onCall={onSelectAgent}
            index={index}
          />
        ))}
      </motion.div>

      {/* Empty State */}
      {category.agents.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <p>No specialized agents available.</p>
          <button
            onClick={onBack}
            className="mt-4 text-purple-400 hover:text-purple-300 transition-colors"
          >
            Go back to categories
          </button>
        </div>
      )}
    </div>
  );
};
