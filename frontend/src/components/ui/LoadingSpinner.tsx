import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

/**
 * LoadingSpinner - Reusable loading spinner component
 * 
 * Features:
 * - Three size variants (sm, md, lg)
 * - Optional loading message
 * - Smooth Framer Motion animations
 * - Glassmorphism styling
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-16 h-16 border-4',
    lg: 'w-24 h-24 border-4'
  };

  const containerClasses = {
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-12'
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center ${containerClasses[size]} ${className}`}
    >
      <div 
        className={`${sizeClasses[size]} border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white font-semibold text-lg"
        >
          {message}
        </motion.div>
      )}
    </motion.div>
  );
};
