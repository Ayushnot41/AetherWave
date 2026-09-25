/**
 * AetherWeave Design Tokens
 * 
 * Institutional Indian Government & Earth-Resilience Design System
 * Supports both legacy components and new institutional directive screens.
 */

// Institutional tokens per directive
export const tokens = {
  colors: {
    paper: '#EEECE3',          // Ledger-paper off-white — base background
    ink: '#1C2B36',            // Deep navy-charcoal — primary text
    authority: '#153350',      // Authority blue — headers, nav, primary buttons, seal
    alertOchre: '#B96A28',     // Heat/risk states ONLY — never decorative
    verifiedForest: '#33573C', // Confirmed/minted/paid states ONLY — never decorative
    slate: '#767E70',          // Secondary text, borders, dividers
  },
  fonts: {
    display: "'Source Serif 4', Georgia, serif",
    body: "'Mukta', 'Noto Sans Devanagari', sans-serif",
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  touch: {
    minTarget: '56px',     // Primary actions — larger than WCAG 44px floor
    minTargetA11y: '44px', // Minimum for all interactive elements
  },
  borders: {
    hairline: '1px solid',
    rule: '2px solid',
  },
  motion: {
    spring: { type: 'spring' as const, stiffness: 120, damping: 20, mass: 0.8 },
    reduced: { duration: 0 },
  },
} as const;

export type DesignTokens = typeof tokens;

// Legacy color palette for backward compatibility across existing screens
export const colors = {
  // Institutional mapping
  paper: '#EEECE3',
  ink: '#1C2B36',
  authority: '#153350',
  alertOchre: '#B96A28',
  verifiedForest: '#33573C',

  // Terracotta / Ochre tones
  terracotta: {
    50: '#FDF2EC',
    100: '#FAE0D0',
    200: '#F5C1A1',
    300: '#E99A6D',
    400: '#D4783F',
    500: '#B96A28', // alert-ochre
    600: '#A85424',
    700: '#8B431D',
    800: '#6E3417',
    900: '#4A2310',
  },
  // Forest / Green tones
  green: {
    50: '#EDF5F0',
    100: '#D4E8DA',
    200: '#A8D1B5',
    300: '#6FB488',
    400: '#3D9460',
    500: '#33573C', // verified-forest
    600: '#174F32',
    700: '#134029',
    800: '#0F3120',
    900: '#0A2116',
  },
  // Sand / Paper tones
  sand: {
    50: '#EEECE3', // paper
    100: '#EAE6DB',
    200: '#E2DDD0',
    300: '#D9D3C3',
    400: '#C9B18A',
    500: '#B89B6E',
    600: '#9A7F55',
    700: '#767E70', // slate
    800: '#4A5245',
    900: '#1C2B36', // ink
  },
  amber: {
    50: '#FFF8E6',
    100: '#FEECC0',
    200: '#FCD97A',
    300: '#F5C23A',
    400: '#E8AD14',
    500: '#B96A28', // alert-ochre
    600: '#B17A09',
    700: '#8E6207',
    800: '#6B4A06',
    900: '#483204',
  },

  // Semantic
  background: '#EEECE3',
  surface: '#FFFFFF',
  surfaceElevated: '#EAE6DB',
  text: {
    primary: '#1C2B36',
    secondary: '#767E70',
    muted: '#767E70',
    inverse: '#EEECE3',
  },
  border: '#D9D3C3',
  borderSubtle: '#E2DDD0',

  // Status
  success: '#33573C',
  warning: '#B96A28',
  error: '#B91C1C',
  info: '#153350',

  // Verification states
  verified: '#33573C',
  pending: '#B96A28',
  rejected: '#B91C1C',

  // Risk levels
  riskNone: '#33573C',
  riskElevated: '#B96A28',
  riskCritical: '#B91C1C',
} as const;

export const typography = {
  fontFamily: {
    heading: '"Source Serif 4", Georgia, serif',
    body: '"Mukta", "Noto Sans Devanagari", sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
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
  tapTarget: '56px',
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
    spring: { type: 'spring' as const, stiffness: 120, damping: 20 },
  },
} as const;

export const breakpoints = {
  sm: '375px',
  md: '768px',
  lg: '1024px',
  xl: '1440px',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(28, 43, 54, 0.05)',
  md: '0 4px 6px rgba(28, 43, 54, 0.07)',
  lg: '0 10px 15px rgba(28, 43, 54, 0.1)',
  xl: '0 20px 25px rgba(28, 43, 54, 0.12)',
} as const;

export const radii = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
} as const;
