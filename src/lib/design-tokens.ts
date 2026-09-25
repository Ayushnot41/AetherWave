/**
 * AetherWeave Design Tokens
 * 
 * Earth-tone palette designed for rural climate-resilience contexts:
 * - High contrast for outdoor/bright-sunlight readability
 * - WCAG 2.1 AA compliant color combinations
 * - Support for Devanagari and Indic scripts via Atkinson Hyperlegible + Noto Sans Devanagari
 */

export const colors = {
  // Primary earth tones
  terracotta: {
    50: '#FDF2EC',
    100: '#FAE0D0',
    200: '#F5C1A1',
    300: '#E99A6D',
    400: '#D4783F',
    500: '#C2662D',
    600: '#A85424',
    700: '#8B431D',
    800: '#6E3417',
    900: '#4A2310',
  },
  green: {
    50: '#EDF5F0',
    100: '#D4E8DA',
    200: '#A8D1B5',
    300: '#6FB488',
    400: '#3D9460',
    500: '#1B5E3B',
    600: '#174F32',
    700: '#134029',
    800: '#0F3120',
    900: '#0A2116',
  },
  sand: {
    50: '#FAF7F2',
    100: '#F5EFE4',
    200: '#E8DCC8',
    300: '#D9C7A8',
    400: '#C9B18A',
    500: '#B89B6E',
    600: '#9A7F55',
    700: '#7C6443',
    800: '#5E4B33',
    900: '#3F3222',
  },
  amber: {
    50: '#FFF8E6',
    100: '#FEECC0',
    200: '#FCD97A',
    300: '#F5C23A',
    400: '#E8AD14',
    500: '#D4920B',
    600: '#B17A09',
    700: '#8E6207',
    800: '#6B4A06',
    900: '#483204',
  },

  // Semantic
  background: '#FAF7F2',       // sand-50 — warm off-white
  surface: '#FFFFFF',
  surfaceElevated: '#F5EFE4',  // sand-100
  text: {
    primary: '#1A2E1A',         // near-black with green tint
    secondary: '#5E4B33',       // sand-800
    muted: '#7C6443',           // sand-700
    inverse: '#FAF7F2',         // sand-50
  },
  border: '#D9C7A8',            // sand-300
  borderSubtle: '#E8DCC8',      // sand-200

  // Status
  success: '#1B5E3B',           // green-500
  warning: '#D4920B',           // amber-500
  error: '#B91C1C',             // red-700 (high contrast)
  info: '#1E40AF',              // blue-800 (high contrast)

  // Verification states
  verified: '#1B5E3B',
  pending: '#D4920B',
  rejected: '#B91C1C',

  // Risk levels
  riskNone: '#1B5E3B',
  riskElevated: '#D4920B',
  riskCritical: '#B91C1C',
} as const;

export const typography = {
  fontFamily: {
    heading: '"Atkinson Hyperlegible", "Noto Sans Devanagari", system-ui, sans-serif',
    body: '"Atkinson Hyperlegible", "Noto Sans Devanagari", system-ui, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px — minimum for hero/heading in sunlight
  },
  fontWeight: {
    regular: '400',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

export const spacing = {
  tapTarget: '44px',   // WCAG minimum
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

export const animation = {
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
  },
  easing: {
    easeOut: [0.0, 0.0, 0.2, 1] as const,
    easeIn: [0.4, 0.0, 1, 1] as const,
    easeInOut: [0.4, 0.0, 0.2, 1] as const,
    spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
} as const;

export const breakpoints = {
  sm: '375px',
  md: '768px',
  lg: '1024px',
  xl: '1440px',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(26, 46, 26, 0.05)',
  md: '0 4px 6px rgba(26, 46, 26, 0.07)',
  lg: '0 10px 15px rgba(26, 46, 26, 0.1)',
  xl: '0 20px 25px rgba(26, 46, 26, 0.12)',
} as const;

export const radii = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;
