// ─── Refugee Aid — Warm Design System ─────────────────────────────────────────
// Light mode is the default. Warm linen palette — NOT navy/black/neon.
// Three semantic accents only: amber (action), teal (identity/trust), sage (progress).

// ── Semantic design tokens (flat, use these everywhere) ──────────────────────
export const C = {
  // Backgrounds
  bg:           '#FAF6F0', // warm linen — screen background
  surface:      '#FFFFFF', // cards, inputs, sheets
  surfaceAlt:   '#F2EBDF', // input fill, chip bg, secondary surface

  // Borders & dividers
  border:       '#E8DECF',

  // Text
  textPrimary:  '#2C2620', // headings, primary body (warm near-black)
  textSecondary:'#6E6358', // descriptions, helper text
  textMuted:    '#A89D8E', // placeholders, timestamps, disabled

  // Amber — primary action (buttons, active nav, key CTAs)
  primary:      '#B5651D',
  primaryMuted: '#F3DCB8', // tint behind primary icons / active-tab pill

  // Teal — identity / trust / chat assistant FAB
  secondary:    '#2B6E6B',
  secondaryMuted: '#D9EAE8',

  // Sage — progress / approved / success
  sage:         '#5C8A52',
  sageMuted:    '#E1ECDB',

  // Error — warm brick (not clinical red)
  error:        '#B3492E',
  errorMuted:   '#F4DCD3',

  // Utility
  white:        '#FFFFFF',
  black:        '#2C2620',
  transparent:  'transparent',
} as const;

// ── Legacy shape kept for backward compat with theme.colors.primary[500] etc ─
export const colors = {
  primary: {
    50:  '#FEF3E2',
    100: '#F3DCB8',
    200: '#E8C49E',
    300: '#D9A476',
    400: '#C97B48',
    500: '#B5651D', // amber
    600: '#9A5518',
    700: '#7D4412',
    800: '#60330D',
    900: '#452408',
  },
  secondary: {
    50:  '#E6F2F1',
    100: '#D9EAE8',
    200: '#B2D5D4',
    300: '#7BBAB8',
    400: '#499E9B',
    500: '#2B6E6B', // teal
    600: '#245C59',
    700: '#1C4A47',
    800: '#143836',
    900: '#0D2624',
  },
  success: {
    50:  '#E1ECDB',
    100: '#C3D9B7',
    200: '#A5C593',
    300: '#87B270',
    400: '#6F9E5B',
    500: '#5C8A52', // sage
    600: '#4D7344',
    700: '#3E5C37',
    800: '#30452A',
    900: '#212E1C',
  },
  warning: {
    50:  '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  error: {
    50:  '#F4DCD3',
    100: '#EAB9A7',
    200: '#DF967B',
    300: '#D4734F',
    400: '#C95C38',
    500: '#B3492E', // warm brick
    600: '#963D26',
    700: '#79311E',
    800: '#5C2516',
    900: '#3F190E',
  },
  info: {
    50:  '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  gray: {
    50:  '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Flat tokens matching the theme system
  background:   '#FAF6F0',
  surface:      '#FFFFFF',
  surfaceAlt:   '#F2EBDF',
  text: {
    primary:     '#2C2620',
    secondary:   '#6E6358',
    disabled:    '#A89D8E',
    inverse:     '#FFFFFF',
    placeholder: '#A89D8E',
  },
  border:       '#E8DECF',
  borderFocus:  '#2B6E6B',
  divider:      '#F2EBDF',
  shadow:       '#2C2620',
  transparent:  'transparent',
  glow: {
    primary:    'rgba(181,101,29,0.10)',
    accent:     'rgba(43,110,107,0.10)',
    success:    'rgba(92,138,82,0.10)',
    warning:    'rgba(245,158,11,0.10)',
    error:      'rgba(179,73,46,0.10)',
    info:       'rgba(59,130,246,0.10)',
  },
};

// Dark mode — same warm family, never navy/blue-black
export const darkColors = {
  ...colors,
  background:   '#211C17', // warm espresso
  surface:      '#2D2620',
  surfaceAlt:   '#3A3028',
  text: {
    primary:    '#F2ECE3',
    secondary:  '#C4B8A8',
    disabled:   '#7A6D60',
    inverse:    '#2C2620',
    placeholder:'#7A6D60',
  },
  border:       '#4A3D30',
  borderFocus:  '#3E9E9A',
  divider:      '#3A3028',
  shadow:       '#000000',
  gray: {
    ...colors.gray,
    50:  '#3A3028',
    100: '#4A3D30',
    200: '#6B5D4E',
    300: '#8C7D6E',
    400: '#A89D8E',
    500: '#C4B8A8',
    600: '#D6CEC3',
    700: '#E8E4DE',
    800: '#F2ECE3',
    900: '#FAF6F0',
  },
};
