/**
 * MedTrustX Design System — Typography Tokens
 */

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, Fira Code, monospace',
    display: 'Inter, system-ui, sans-serif',
  },

  fontSize: {
    '2xs': '0.625rem',   // 10px
    xs:    '0.75rem',     // 12px
    sm:    '0.875rem',    // 14px
    base:  '1rem',        // 16px
    lg:    '1.125rem',    // 18px
    xl:    '1.25rem',     // 20px
    '2xl': '1.5rem',      // 24px
    '3xl': '1.875rem',    // 30px
    '4xl': '2.25rem',     // 36px
  },

  fontWeight: {
    light:    300,
    normal:   400,
    medium:   500,
    semibold: 600,
    bold:     700,
    extrabold: 800,
  },

  lineHeight: {
    tight:  1.25,
    snug:   1.375,
    normal: 1.5,
    relaxed: 1.625,
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight:   '-0.025em',
    normal:  '0em',
    wide:    '0.025em',
    wider:   '0.05em',
    widest:  '0.1em',
  },
} as const;

export type TypographyToken = typeof typography;
