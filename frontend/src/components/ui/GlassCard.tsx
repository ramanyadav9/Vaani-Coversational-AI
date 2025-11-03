import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = false, onClick }: GlassCardProps) {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      className={cn(
        'glass rounded-2xl p-6 shadow-lg shadow-indigo-500/5',
        hover && 'glass-hover cursor-pointer',
        className
      )}
      whileHover={hover ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? 'Interactive card' : undefined}
    >
      {children}
    </Component>
  );
}
