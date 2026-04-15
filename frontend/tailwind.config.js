/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Stitch "Digital Larder" palette ──
        'primary':                  '#576158',
        'primary-dim':              '#4b554c',
        'primary-fixed':            '#dbe5d9',
        'primary-fixed-dim':        '#cdd7cc',
        'primary-container':        '#dbe5d9',
        'on-primary':               '#f1faee',
        'on-primary-container':     '#4b544b',
        'on-primary-fixed':         '#384239',
        'on-primary-fixed-variant': '#545e55',

        'secondary':                '#6a5d4b',
        'secondary-dim':            '#5d513f',
        'secondary-fixed':          '#f2e0c8',
        'secondary-fixed-dim':      '#e3d2bb',
        'secondary-container':      '#f2e0c8',
        'on-secondary':             '#fff8f2',
        'on-secondary-container':   '#5c503e',
        'on-secondary-fixed':       '#493e2d',
        'on-secondary-fixed-variant':'#665a47',

        'tertiary':                 '#705b44',
        'tertiary-dim':             '#635039',
        'tertiary-fixed':           '#fadec0',
        'tertiary-fixed-dim':       '#ecd0b3',
        'tertiary-container':       '#fadec0',
        'on-tertiary':              '#fff7f3',
        'on-tertiary-container':    '#624e38',
        'on-tertiary-fixed':        '#4e3c27',
        'on-tertiary-fixed-variant':'#6c5841',

        'error':                    '#9f403d',
        'error-dim':                '#4e0309',
        'error-container':          '#fe8983',
        'on-error':                 '#fff7f6',
        'on-error-container':       '#752121',

        'surface':                  '#faf9f7',
        'surface-dim':              '#d6dbd7',
        'surface-bright':           '#faf9f7',
        'surface-variant':          '#e0e3e0',
        'surface-tint':             '#576158',
        'surface-container-lowest': '#ffffff',
        'surface-container-low':    '#f3f4f1',
        'surface-container':        '#edeeeb',
        'surface-container-high':   '#e6e9e6',
        'surface-container-highest':'#e0e3e0',

        'on-surface':               '#2f3331',
        'on-surface-variant':       '#5c605d',
        'on-background':            '#2f3331',
        'outline':                  '#777c79',
        'outline-variant':          '#afb3b0',

        'inverse-surface':          '#0d0e0e',
        'inverse-on-surface':       '#9d9d9b',
        'inverse-primary':          '#ecf6ea',

        'background':               '#faf9f7',

        // Keep old refs for non-revamped pages
        'text-dark':                '#020617',
        'text-muted':               '#64748b',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        sm:      '0.25rem',
        md:      '0.375rem',
        lg:      '0.5rem',
        xl:      '0.75rem',
        '2xl':   '1rem',
        '3xl':   '1.5rem',
        full:    '9999px',
      },
      fontFamily: {
        sans:      ['Manrope', 'sans-serif'],
        headline:  ['Epilogue', 'sans-serif'],
        body:      ['Manrope', 'sans-serif'],
        label:     ['Manrope', 'sans-serif'],
        display:   ['Epilogue', 'sans-serif'],
      },
      boxShadow: {
        'ambient':    '0px 12px 32px rgba(47, 51, 49, 0.06)',
        'ambient-lg': '0px 24px 48px rgba(47, 51, 49, 0.10)',
        'soft':       '0 4px 30px rgba(0, 0, 0, 0.03)',
        'glass':      '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
      },
      animation: {
        'slide-in':  'slideIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in':   'fadeIn 0.25s ease-out forwards',
        'shimmer':   'shimmer 1.4s infinite linear',
        'scale-in':  'scaleIn 0.2s ease-out forwards',
      },
      keyframes: {
        slideIn: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
