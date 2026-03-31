/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f172a', // Slate 900
          dark: '#000000',    // Black
          light: '#334155',   // Slate 700
        },
        accent: {
          DEFAULT: '#e2e8f0', // Very subtle slate for highlights
        },
        background: '#f8fafc', // Very clean white-slate
        surface: '#ffffff',
        text: {
          dark: '#020617', // Slate 950
          muted: '#64748b', // Slate 500
        }
      },
      boxShadow: {
        'soft': '0 4px 30px rgba(0, 0, 0, 0.03)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slideIn 0.25s ease-out forwards',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'shimmer': 'shimmer 1.4s infinite linear',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      }
    },
  },
  plugins: [],
}
