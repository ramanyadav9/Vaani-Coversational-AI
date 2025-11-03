import { motion } from 'framer-motion';
import { Search, X, Mic } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import logo from '../../assets/image.png';

export function Header() {
  const [isListening, setIsListening] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const { setSearchQuery } = useSearch();

  // Debounced search: wait 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setLocalSearch('');
    setSearchQuery('');
  }, [setSearchQuery]);

  return (
    <header className="glass border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Virtual Galaxy"
              className="h-10 object-contain"
            />
            <h1 className="text-2xl font-bold gradient-text hidden sm:block">
              Conversational AI
            </h1>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            {/* Global Search */}
            <div className="relative flex-1 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search agents by name..."
                className="w-full pl-10 pr-10 py-2 input-glass"
                aria-label="Search agents"
              />
              {localSearch && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-white/60 hover:text-white/80" />
                </button>
              )}
            </div>

            {/* Voice Mic Button */}
            <motion.button
              onClick={() => setIsListening(!isListening)}
              className={`p-3 rounded-full transition-all duration-200 ${
                isListening
                  ? 'bg-indigo-600/30 pulse-glow'
                  : 'bg-indigo-600/20 hover:bg-indigo-600/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'text-indigo-300' : 'text-white/80'}`} />
              {isListening && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-indigo-400/20"
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}
