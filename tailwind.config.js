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
        charcoal: {
          950: '#060608',
          900: '#0A0A0E',
          850: '#101017',
          800: '#161620',
          750: '#1D1D2B',
          700: '#252536',
          600: '#34344D',
        },
        gold: {
          50: '#FFFDF0',
          100: '#FFF9C2',
          200: '#FFF185',
          300: '#FFE647',
          400: '#F5CE13',
          500: '#D4AF37', // metallic gold
          600: '#B8860B',
          700: '#926600',
          800: '#6B4700',
          900: '#4D3100',
        },
        electric: {
          orange: '#FF5722',
          amber: '#F59E0B',
          cyan: '#06B6D4',
          emerald: '#10B981',
          rose: '#F43F5E',
          violet: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Cabinet Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.35)',
        'orange-glow': '0 0 25px -5px rgba(255, 87, 34, 0.4)',
        'emerald-glow': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-reverse': 'float-reverse 5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'radar': 'radar 2s infinite ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        radar: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
