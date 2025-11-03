import { motion } from 'framer-motion';

/**
 * AnimatedBackground Component
 * Creates a dynamic gradient mesh background with floating orbs
 * Multiple layers with different speeds for parallax depth effect
 * Performance-optimized with will-change and GPU acceleration
 */
const AnimatedBackground = () => {
  // Define color palette for orbs - Purple to Rose with Orange accents
  const orbColors = [
    'rgba(168, 85, 247, 0.4)',   // Purple (#a855f7)
    'rgba(244, 63, 94, 0.4)',    // Rose (#f43f5e)
    'rgba(249, 115, 22, 0.3)',   // Orange (#f97316)
    'rgba(217, 70, 239, 0.4)',   // Fuchsia
    'rgba(251, 146, 60, 0.3)',   // Orange lighter
  ];

  // Generate random animation values for natural movement
  const generateRandomPath = () => ({
    x: [
      0,
      Math.random() * 200 - 100,
      Math.random() * 100 - 50,
      0
    ],
    y: [
      0,
      Math.random() * 200 - 100,
      Math.random() * 100 - 50,
      0
    ],
  });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Base gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-rose-500 to-orange-500 opacity-90" />

      {/* Animated floating orbs */}
      {orbColors.map((color, i) => {
        const size = Math.random() * 300 + 200; // Random size between 200-500px
        const duration = Math.random() * 15 + 15; // Random duration between 15-30s
        const delay = i * 2; // Stagger animations

        return (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: size,
              height: size,
              background: `radial-gradient(circle, ${color}, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              willChange: 'transform',
            }}
            animate={generateRandomPath()}
            transition={{
              duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay,
            }}
          />
        );
      })}

      {/* Additional layer of smaller orbs for depth */}
      {[...Array(3)].map((_, i) => {
        const size = Math.random() * 150 + 100;
        const duration = Math.random() * 20 + 10;

        return (
          <motion.div
            key={`small-${i}`}
            className="absolute rounded-full blur-2xl opacity-30"
            style={{
              width: size,
              height: size,
              background: `radial-gradient(circle, ${orbColors[i]}, transparent)`,
              right: `${Math.random() * 50}%`,
              bottom: `${Math.random() * 50}%`,
              willChange: 'transform',
            }}
            animate={{
              x: [0, Math.random() * 150 - 75, 0],
              y: [0, Math.random() * 150 - 75, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: i * 3,
            }}
          />
        );
      })}

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
    </div>
  );
};

export default AnimatedBackground;
