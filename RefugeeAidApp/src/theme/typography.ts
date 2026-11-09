import { TextStyle } from 'react-native';

// Type scale — Inter body, Plus Jakarta Sans headings (system fallback for now)
export const typography = {
  fontFamily: {
    regular:  'System',
    medium:   'System',
    semiBold: 'System',
    bold:     'System',
  },
  fontSize: {
    xs:    12,
    sm:    14,
    base:  16,
    lg:    18,
    xl:    22,
    '2xl': 28,
    '3xl': 32,
  },
  fontWeight: {
    normal:   '400' as const,
    medium:   '500' as const,
    semibold: '600' as const,
    bold:     '700' as const,
    extrabold:'800' as const,
  },
  lineHeight: {
    xs:    16,
    sm:    20,
    base:  24,
    lg:    28,
    xl:    28,
    '2xl': 36,
    '3xl': 38,
  },
  styles: {
    display: { fontSize: 28, fontWeight: '700', lineHeight: 36 } as TextStyle,
    h1:      { fontSize: 22, fontWeight: '600', lineHeight: 28 } as TextStyle,
    h2:      { fontSize: 18, fontWeight: '600', lineHeight: 24 } as TextStyle,
    body:    { fontSize: 16, fontWeight: '400', lineHeight: 24 } as TextStyle,
    bodySm:  { fontSize: 14, fontWeight: '400', lineHeight: 20 } as TextStyle,
    caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 } as TextStyle,
  },
};
