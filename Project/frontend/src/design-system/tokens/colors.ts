/**
 * MedTrustX Design System — Color Tokens
 * Centralized color definitions for programmatic use.
 * Tailwind classes should be preferred in JSX; use these tokens
 * for chart libraries, canvas rendering, and dynamic theming.
 */

export const colors = {
  /* ── Brand ────────────────────────────────────────────── */
  primary: {
    DEFAULT: '#1A3057',
    50:  '#E8EDF5',
    100: '#C5D0E6',
    200: '#9FB2D4',
    300: '#7994C1',
    400: '#5C7DB4',
    500: '#3F66A6',
    600: '#1A3057',
    700: '#152848',
    800: '#101F39',
    900: '#0B162A',
  },

  teal: {
    DEFAULT: '#00A389',
    50:  '#E6F7F4',
    100: '#B3E8DE',
    200: '#80D9C8',
    300: '#4DCAB2',
    400: '#26BFA2',
    500: '#00A389',
    600: '#008F78',
    700: '#007A67',
    800: '#006556',
    900: '#005045',
  },

  /* ── Semantic ─────────────────────────────────────────── */
  success:   { DEFAULT: '#15803D', light: '#4ade80', dark: '#166534' },
  warning:   { DEFAULT: '#D97706', light: '#FBBF24', dark: '#92400E' },
  error:     { DEFAULT: '#D94040', light: '#f87171', dark: '#991b1b' },
  info:      { DEFAULT: '#3B82F6', light: '#93C5FD', dark: '#1E40AF' },

  /* ── Clinical ─────────────────────────────────────────── */
  clinical:  { DEFAULT: '#059669', light: '#34d399', dark: '#047857' },
  emergency: { DEFAULT: '#dc2626', light: '#f87171', dark: '#991b1b' },

  /* ── Surface / Dark Theme ─────────────────────────────── */
  surface: {
    dark:     '#0A0F1E',
    DEFAULT:  '#111827',
    light:    '#1F2937',
    elevated: '#283548',
  },

  /* ── Neutral / Text ───────────────────────────────────── */
  text: {
    primary:   '#F9FAFB',
    secondary: '#9CA3AF',
    muted:     '#6B7280',
    disabled:  '#4B5563',
    inverse:   '#111827',
  },

  /* ── Chart Palette ────────────────────────────────────── */
  chart: [
    '#00A389', '#3B82F6', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
  ],
} as const;

export type ColorToken = typeof colors;
