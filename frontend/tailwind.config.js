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
          DEFAULT: '#2D6A4F',
          dark: '#1B4332',
          light: '#40916C',
        },
        accent: {
          DEFAULT: '#F4A261',
          hover: '#E76F51',
        },
        background: '#FAFAF7',
        surface: '#FFFFFF',
        text: {
          dark: '#1A1A1A',
          muted: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.2s ease-in forwards',
        'bounce-soft': 'bounceSoft 2s infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
