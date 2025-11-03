import { motion } from 'framer-motion';
import { useVoiceWaveform } from '../../hooks/useVoiceWaveform';
import type { VoiceWaveformProps } from '../../types';

export function VoiceWaveformAvatar({ isActive, barCount = 7, size = 'md' }: VoiceWaveformProps) {
  const waveformData = useVoiceWaveform(isActive, barCount);

  const sizeMap = {
    sm: { width: 48, height: 48, barWidth: 3 },
    md: { width: 64, height: 64, barWidth: 4 },
    lg: { width: 80, height: 80, barWidth: 5 }
  };

  const { width, height, barWidth } = sizeMap[size];
  const gap = 2;

  return (
    <div
      className={`relative rounded-full flex items-center justify-center ${
        isActive ? 'bg-galaxy-600/20 pulse-glow' : 'bg-galaxy-600/10'
      }`}
      style={{ width, height }}
      aria-label={isActive ? 'Active voice waveform' : 'Inactive voice waveform'}
    >
      <svg
        width={width * 0.6}
        height={height * 0.6}
        viewBox={`0 0 ${barCount * (barWidth + gap)} 40`}
        className="overflow-visible"
      >
        {waveformData.map((height, index) => (
          <motion.rect
            key={index}
            x={index * (barWidth + gap)}
            y={20 - height / 2}
            width={barWidth}
            height={height}
            rx={barWidth / 2}
            className="fill-galaxy-500"
            initial={{ height: 8 }}
            animate={{
              height: isActive ? [height * 0.5, height, height * 0.7] : 8,
            }}
            transition={{
              duration: 0.5,
              delay: index * 0.05,
              repeat: isActive ? Infinity : 0,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
          />
        ))}
      </svg>
    </div>
  );
}
