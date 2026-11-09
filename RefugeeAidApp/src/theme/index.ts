import { colors, darkColors, C } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

export { C } from './colors';

export interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  isDark: boolean;
}

export const lightTheme: Theme = { colors, typography, spacing, isDark: false };
export const darkTheme:  Theme = { colors: darkColors, typography, spacing, isDark: true };

export { colors, darkColors, typography, spacing };

export const getTheme = (isDark: boolean): Theme =>
  isDark ? darkTheme : lightTheme;

// ── Warm shadows — never colored glow ────────────────────────────────────────
export const shadows = {
  card: {
    shadowColor:   '#2C2620',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius:  12,
    elevation:     2,
  },
  fab: {
    shadowColor:   '#2C2620',
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius:  16,
    elevation:     4,
  },
  small: {
    shadowColor:   '#2C2620',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius:  6,
    elevation:     1,
  },
  none: {},
};

// ── Border radius ─────────────────────────────────────────────────────────────
export const borderRadius = {
  none: 0,
  sm:   8,
  md:   14,
  lg:   20,
  xl:   24,
  full: 999,
};

// ── Spacing (4px base grid) ──────────────────────────────────────────────────
export const SPACE = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  '2xl':32,
  '3xl':40,
  '4xl':48,
  '5xl':64,
};
