/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Virtual Galaxy Brand Colors - Primary Green/Lime
        galaxy: {
          50: '#f0f9f4',
          100: '#daf2e4',
          200: '#b5e4ca',
          300: '#7fcfa0',
          400: '#8BC34A', // Primary brand color
          500: '#9CCC65', // Primary brand color
          600: '#7CB342', // Primary brand color
          700: '#689F38', // Primary brand color
          800: '#558b2f',
          900: '#33691e',
        },
        // Virtual Galaxy Accent Colors - Red/Orange
        'galaxy-accent': {
          400: '#FF5722', // Secondary accent
          500: '#F44336', // Secondary accent
          600: '#E64A19', // Secondary accent
          700: '#d84315',
        },
        // Keep for compatibility
        indigo: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
        },
        purple: {
          950: '#1e1b4b',
        },
        slate: {
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(to bottom right, #020617, #0d1b1a, #1a2c1e)',
        'galaxy-gradient': 'linear-gradient(to bottom right, #689F38, #7CB342, #8BC34A)',
        'galaxy-radial': 'radial-gradient(circle at 50% 0%, rgba(139, 195, 74, 0.15), transparent 70%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        ping: {
          '75%, 100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
}
