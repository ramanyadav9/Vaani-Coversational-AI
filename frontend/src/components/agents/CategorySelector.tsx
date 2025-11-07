import React from 'react';
import { motion } from 'framer-motion';
import { Landmark, Heart, Home, Car, Building2, Hotel, Sparkles } from 'lucide-react';
import type { AgentCategory } from '../../types';

// Icon mapping for categories
const getCategoryIconComponent = (categoryName: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'Banking': Landmark,
    'Healthcare': Heart,
    'Real Estate': Home,
    'Traffic': Car,
    'Municipal': Building2,
    'Hospitality': Hotel,
    'Specialized Agents': Sparkles,
  };
  return iconMap[categoryName] || Sparkles;
};

interface CategorySelectorProps {
  categories: AgentCategory[];
  onSelectCategory: (category: AgentCategory) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  onSelectCategory,
}) => {
  // Separate main categories from specialized
  const mainCategories = categories.filter(cat => cat.name !== 'Specialized Agents');
  const specializedCategory = categories.find(cat => cat.name === 'Specialized Agents');

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Select Agent Category</h2>
        <p className="text-gray-400">Choose a category to view available agents</p>
      </div>

      {/* Main Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {mainCategories.map((category, index) => {
          const IconComponent = getCategoryIconComponent(category.name);
          return (
            <motion.button
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectCategory(category)}
              className="relative group"
            >
              {/* Card */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-purple-500/50 transition-all duration-300">
                {/* Icon */}
                <div className="mb-2 group-hover:scale-110 transition-transform flex justify-center">
                  <IconComponent className="w-8 h-8 text-purple-400" />
                </div>

                {/* Category Name */}
                <h3 className="text-lg font-bold text-white mb-1.5">
                  {category.displayName}
                </h3>

                {/* Agent Count */}
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <span className="text-xl font-bold text-purple-400">
                    {category.count}
                  </span>
                  <span className="text-sm">
                    {category.count === 1 ? 'agent' : 'agents'}
                  </span>
                </div>

                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/20 group-hover:to-pink-500/20 rounded-xl transition-all duration-300 pointer-events-none" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Specialized Agents Category */}
      {specializedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: mainCategories.length * 0.1 }}
        >
          <div className="border-t border-white/10 pt-4">
            <button
              onClick={() => onSelectCategory(specializedCategory)}
              className="w-full group"
            >
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-yellow-500/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  {/* Left side */}
                  <div className="flex items-center gap-3">
                    <div className="group-hover:scale-110 transition-transform">
                      <Sparkles className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-white mb-0.5">
                        {specializedCategory.displayName}
                      </h3>
                      <p className="text-xs text-gray-400">
                        Specialized and custom agents
                      </p>
                    </div>
                  </div>

                  {/* Right side - Count */}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-yellow-400">
                      {specializedCategory.count}
                    </span>
                    <span className="text-sm text-gray-400">
                      {specializedCategory.count === 1 ? 'agent' : 'agents'}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
