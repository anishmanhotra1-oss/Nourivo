/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0A0A0A',
          card: '#121215',
          surface: '#1A1A20',
          border: '#22242D',
          hover: '#282A36',
        },
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2451D6',
          700: '#1D4ED8',
          800: '#1E40AF',
          950: '#0F172A',
        },
        telemetry: {
          steps: '#10B981',
          water: '#06B6D4',
          sleep: '#8B5CF6',
          calories: '#F59E0B',
        },
      },
      fontFamily: {
        display: ['Outfit', 'Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Roboto Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px -5px rgba(36, 81, 214, 0.45)',
        'glow-lg': '0 0 35px -5px rgba(36, 81, 214, 0.65)',
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.45)',
      },
    },
  },
  plugins: [],
}
