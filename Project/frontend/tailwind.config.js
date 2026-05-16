/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── MedTrustX Design Tokens ────────────────────────── */
        primary: {
          DEFAULT: 'var(--mt-navy)',
          50:  '#E8EDF5', 100: '#C5D0E6', 200: '#9FB2D4',
          300: '#7994C1', 400: '#5C7DB4', 500: '#3F66A6',
          600: '#1A3057', 700: '#152848', 800: '#101F39',
          900: '#0B162A', 950: '#060D1A',
        },
        teal: {
          DEFAULT: 'var(--mt-teal)',
          50:  '#E6F7F4', 100: '#B3E8DE', 200: '#80D9C8',
          300: '#4DCAB2', 400: '#26BFA2', 500: '#00A389',
          600: '#008F78', 700: '#007A67', 800: '#006556',
          900: '#005045',
        },
        clinical:  { DEFAULT: '#059669', light: '#34d399', dark: '#047857' },
        emergency: { DEFAULT: '#dc2626', light: '#f87171', dark: '#991b1b' },
        warning:   { DEFAULT: '#D97706', light: '#FBBF24', dark: '#92400E' },
        success:   { DEFAULT: '#15803D', light: '#4ade80', dark: '#166534' },
        surface: {
          dark: '#0A0F1E',
          DEFAULT: '#111827',
          light: '#1F2937',
          elevated: '#283548',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          hover:   'rgba(255,255,255,0.16)',
          focus:   'rgba(0,163,137,0.5)',
        },
        /* Legacy brand alias for existing components */
        brand: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe',
          300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1',
          600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '120': '30rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glow-teal': '0 0 20px rgba(0,163,137,0.15)',
        'glow-primary': '0 0 20px rgba(26,48,87,0.25)',
        'glow-emergency': '0 0 20px rgba(220,38,38,0.2)',
        'glass': '0 8px 32px rgba(0,0,0,0.37)',
        'glass-sm': '0 4px 16px rgba(0,0,0,0.25)',
        'card': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.24)',
        'card-hover': '0 14px 28px rgba(0,0,0,0.4), 0 10px 10px rgba(0,0,0,0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.15s ease-in',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'shake': 'shake 0.5s ease-in-out',
        'spin-slow': 'spin 2s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        slideIn:   { '0%': { transform: 'translateX(-100%)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        slideUp:   { '0%': { transform: 'translateY(10px)', opacity: '0' },  '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeIn:    { '0%': { opacity: '0' },                                 '100%': { opacity: '1' } },
        fadeOut:   { '0%': { opacity: '1' },                                 '100%': { opacity: '0' } },
        scaleIn:   { '0%': { transform: 'scale(0.95)', opacity: '0' },       '100%': { transform: 'scale(1)', opacity: '1' } },
        shake:     { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-4px)' }, '75%': { transform: 'translateX(4px)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      zIndex: {
        'sidebar': '40',
        'topbar': '50',
        'dropdown': '60',
        'modal-backdrop': '70',
        'modal': '80',
        'toast': '90',
        'tooltip': '100',
      },
    },
  },
  plugins: [],
};
