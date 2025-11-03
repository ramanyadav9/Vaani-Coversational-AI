import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  return value;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
  return `${mins}:${secsStr}`;
}

export function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}

export function generateWaveformData(length: number = 50): number[] {
  return Array.from({ length }, () => Math.random() * 100);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'connected':
      return 'bg-teal-500';
    case 'completed':
      return 'bg-green-500';
    case 'failed':
      return 'bg-red-500';
    case 'ringing':
    case 'on-hold':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
}

export function getTrendIcon(trend: number): string {
  // Using Unicode arrows for better cross-platform compatibility
  // Using fullwidth arrows which render better across different fonts
  if (trend > 0) return '\u25B2'; // ▲ Up-pointing triangle
  if (trend < 0) return '\u25BC'; // ▼ Down-pointing triangle
  return '\u25B6'; // ▶ Right-pointing triangle
}

export function getTrendColor(trend: number): string {
  return trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400';
}

export function maskPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  if (cleaned.length < 4) {
    return phoneNumber; // Too short to mask meaningfully
  }

  // Show last 4 digits
  const lastFour = cleaned.slice(-4);

  // Format based on length
  if (cleaned.length === 10) {
    // US format: +1 ****7890
    return `+1 ****${lastFour}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US format with country code: +1 ****7890
    return `+1 ****${lastFour}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    // India format: +91 ****7890
    return `+91 ****${lastFour}`;
  } else {
    // Generic format: +** ****7890
    return `+** ****${lastFour}`;
  }
}

// Date filtering utilities
export function isToday(timestamp: string): boolean {
  const date = new Date(timestamp);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function isYesterday(timestamp: string): boolean {
  const date = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

export function isWithinLastDays(timestamp: string, days: number): boolean {
  const date = new Date(timestamp);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}
