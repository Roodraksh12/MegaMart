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
          DEFAULT: '#0C831F',
          dark: '#096618',
          light: '#1aab31',
        },
        background: '#F6F6F6',
        surface: '#FFFFFF',
        text: {
          dark: '#1C1C1C',
          muted: '#6B7280',
        }
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
