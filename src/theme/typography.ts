export const typography = {
  xs: { fontSize: 10, fontWeight: '400' as const, lineHeight: 14 },
  sm: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  md: { fontSize: 14, fontWeight: '400' as const, lineHeight: 18 },
  lg: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  xl: { fontSize: 18, fontWeight: '500' as const, lineHeight: 24 },
  '2xl': { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  '3xl': { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  '4xl': { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
} as const;

export type TypographyName = keyof typeof typography;