import { motion, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getTrendIcon, getTrendColor } from '../../lib/utils';

interface StatProps {
  label: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
  mono?: boolean;
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const spring = useSpring(0, { damping: 30, stiffness: 100 });

  useEffect(() => {
    spring.set(value);
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [value, spring]);

  return <>{displayValue}</>;
}

export function Stat({ label, value, trend, icon, mono = false }: StatProps) {
  const isNumeric = typeof value === 'number';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="flex flex-col gap-1 group"
    >
      <div className="flex items-center gap-2">
        {icon && (
          <motion.div
            className="text-indigo-400"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        )}
        <span className="text-xs text-white/60 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold text-white ${mono ? 'font-mono' : ''} transition-colors duration-200 group-hover:text-indigo-300`}>
          {isNumeric ? <AnimatedNumber value={value} /> : value}
        </span>
        {trend !== undefined && (
          <motion.span
            className={`text-sm font-medium ${getTrendColor(trend)}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <motion.span
              initial={{ y: trend >= 0 ? 5 : -5 }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {getTrendIcon(trend)}
            </motion.span>{' '}
            {Math.abs(trend)}%
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
