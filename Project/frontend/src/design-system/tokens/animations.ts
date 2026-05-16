/**
 * MedTrustX Design System — Animation Tokens
 * Used with framer-motion and CSS transitions.
 */

export const transitions = {
  duration: {
    instant:  0,
    fast:     100,
    normal:   200,
    slow:     300,
    slower:   500,
  },
  easing: {
    ease:      'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
    easeIn:    'cubic-bezier(0.42, 0, 1.0, 1.0)',
    easeOut:   'cubic-bezier(0, 0, 0.58, 1.0)',
    easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1.0)',
    spring:    'cubic-bezier(0.16, 1, 0.3, 1)',
    bounceIn:  'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

/** Framer-motion animation presets */
export const motionPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit:    { opacity: 0 },
    transition: { duration: 0.2 },
  },
  slideUp: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: 12 },
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  slideDown: {
    initial: { opacity: 0, y: -12 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -12 },
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit:    { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -24 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -24 },
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  staggerChildren: {
    animate: { transition: { staggerChildren: 0.05 } },
  },
} as const;
