/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Horizon Fintech Primary - Deep Navy/Indigo
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d9e0ff',
          300: '#b8c4ff',
          400: '#8e9cff',
          500: '#6366f1', // Indigo Base
          600: '#5850ec', // Brand Indigo
          700: '#4c43d6',
          800: '#3f38b1',
          900: '#1e1b4b', // Deep Navy
          950: '#0f0e2b',
        },
        // Accent - Vibrant Teal/Emerald
        accent: {
          50: '#f0fdf9',
          100: '#ccfbf0',
          200: '#99f6e1',
          300: '#5eead0',
          400: '#2dd4bb',
          500: '#10b9a2',
          600: '#0d9484',
          700: '#0f766b',
          800: '#115e56',
          900: '#134e48',
        },
        // Neutral Slate
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.2)',
        'card': '0 2px 4px 0 rgba(0,0,0,0.02), 0 1px 0 0 rgba(0,0,0,0.01)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'primary-glow': '0 0 20px rgba(99, 102, 241, 0.25)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
      }
    },
  },
  plugins: [],
}
