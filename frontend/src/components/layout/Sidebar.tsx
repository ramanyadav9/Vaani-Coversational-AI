import { motion } from 'framer-motion';
import { Bot, History, TrendingUp, Menu } from 'lucide-react';
import type { TabType } from '../../types';
import { useState } from 'react';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    { id: 'agents' as TabType, icon: Bot, label: 'AI Agents' },
    { id: 'live' as TabType, icon: TrendingUp, label: 'Live Calls' },
    { id: 'history' as TabType, icon: History, label: 'History' }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden sm:flex flex-col glass border-r border-white/10 transition-all duration-300 fixed left-0 top-[73px] bottom-0 z-40 ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-4 hover:bg-white/5 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="w-5 h-5 text-white/80" />
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white border-l-4 border-galaxy-500'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
              whileHover={{ x: 4 }}
              aria-label={tab.label}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <tab.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{tab.label}</span>
              )}
            </motion.button>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/10 z-50">
        <nav className="flex items-center justify-around px-4 py-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/70'
              }`}
              aria-label={tab.label}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
