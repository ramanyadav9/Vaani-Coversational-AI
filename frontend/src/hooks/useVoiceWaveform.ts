import { useState, useEffect } from 'react';

export function useVoiceWaveform(isActive: boolean, barCount: number = 7) {
  const [waveformData, setWaveformData] = useState<number[]>([]);

  useEffect(() => {
    // Initialize waveform with random heights
    const initialData = Array.from({ length: barCount }, () =>
      isActive ? Math.random() * 60 + 40 : 20
    );
    setWaveformData(initialData);

    if (!isActive) return;

    // Animate waveform when active
    const interval = setInterval(() => {
      setWaveformData(prev =>
        prev.map(() => Math.random() * 60 + 40)
      );
    }, 150);

    return () => clearInterval(interval);
  }, [isActive, barCount]);

  return waveformData;
}
