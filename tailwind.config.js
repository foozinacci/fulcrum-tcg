/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fulcrum: {
          dark: '#0a0814',
          panel: '#15102a',
          card: '#1c1636',
          border: '#2e2554',
          gold: '#f3c669',
          goldLight: '#ffe596',
          sol: '#eab308',
          solGlow: '#fef08a',
          umbra: '#a855f7',
          umbraGlow: '#e9d5ff',
          aether: '#06b6d4',
          nexus: '#ef4444'
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Trajan Pro', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-sol': 'glowSol 2s ease-in-out infinite alternate',
        'glow-umbra': 'glowUmbra 2s ease-in-out infinite alternate',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        glowSol: {
          '0%': { boxShadow: '0 0 5px rgba(234, 179, 8, 0.4)' },
          '100%': { boxShadow: '0 0 20px rgba(234, 179, 8, 0.9), 0 0 30px rgba(243, 198, 105, 0.6)' },
        },
        glowUmbra: {
          '0%': { boxShadow: '0 0 5px rgba(168, 85, 247, 0.4)' },
          '100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.9), 0 0 30px rgba(192, 132, 252, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
