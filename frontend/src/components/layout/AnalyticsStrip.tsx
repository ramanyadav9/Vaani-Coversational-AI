import { motion } from 'framer-motion';
import { Phone, TrendingUp, Clock, Award } from 'lucide-react';
import { useCallAnalytics } from '../../hooks/useCallAnalytics';
import { Stat } from '../ui/Stat';
import { formatDuration } from '../../lib/utils';

export function AnalyticsStrip() {
  const { analytics, isLoading } = useCallAnalytics();

  if (isLoading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 backdrop-blur-xl z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="animate-pulse"
              >
                <div className="h-4 bg-white/10 rounded w-20 mb-2" />
                <div className="h-8 bg-white/10 rounded w-16" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 backdrop-blur-xl z-40 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.3)]"
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
              }
            }
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <Stat
              label="Calls Today"
              value={analytics.callsToday}
              trend={analytics.trend.calls}
              icon={<Phone className="w-4 h-4" />}
              mono
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <Stat
              label="Success Rate"
              value={`${analytics.successRate}%`}
              trend={analytics.trend.success}
              icon={<TrendingUp className="w-4 h-4" />}
              mono
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <Stat
              label="Avg Duration"
              value={formatDuration(analytics.avgDuration)}
              trend={analytics.trend.duration}
              icon={<Clock className="w-4 h-4" />}
              mono
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <Stat
              label="Top Agent"
              value={analytics.topAgent.name}
              icon={<Award className="w-4 h-4" />}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
