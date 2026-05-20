/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../modules-marketplace/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'mining-glow': 'mining-glow 2s ease-in-out infinite',
        'chain-pulse': 'chain-pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        'mining-glow': {
          '0%, 100%': { boxShadow: '0 0 4px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 16px rgba(59, 130, 246, 0.9)' },
        },
        'chain-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
