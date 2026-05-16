/**
 * MedTrustX Design System — Shadow & Elevation Tokens
 */

export const shadows = {
  none:      'none',
  sm:        '0 1px 2px rgba(0,0,0,0.3)',
  DEFAULT:   '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.24)',
  md:        '0 4px 6px rgba(0,0,0,0.3)',
  lg:        '0 10px 15px rgba(0,0,0,0.3)',
  xl:        '0 20px 25px rgba(0,0,0,0.35)',
  '2xl':     '0 25px 50px rgba(0,0,0,0.4)',
  glass:     '0 8px 32px rgba(0,0,0,0.37)',
  'glass-sm': '0 4px 16px rgba(0,0,0,0.25)',
  card:      '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.24)',
  'card-hover': '0 14px 28px rgba(0,0,0,0.4), 0 10px 10px rgba(0,0,0,0.3)',
  glow: {
    teal:      '0 0 20px rgba(0,163,137,0.15)',
    primary:   '0 0 20px rgba(26,48,87,0.25)',
    emergency: '0 0 20px rgba(220,38,38,0.2)',
  },
} as const;

export const elevation = {
  /** z-index layering system */
  base:           0,
  dropdown:       60,
  sticky:         30,
  sidebar:        40,
  topbar:         50,
  modalBackdrop:  70,
  modal:          80,
  toast:          90,
  tooltip:        100,
} as const;
