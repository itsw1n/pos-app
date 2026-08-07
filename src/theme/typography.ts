export const typography = {
  xs: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 14 },
  sm: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 16 },
  md: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 18 },
  lg: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 22 },
  xl: { fontFamily: 'Inter_500Medium', fontSize: 18, lineHeight: 24 },
  '2xl': { fontFamily: 'Inter_600SemiBold', fontSize: 20, lineHeight: 28 },
  '3xl': { fontFamily: 'Inter_600SemiBold', fontSize: 24, lineHeight: 32 },
  '4xl': { fontFamily: 'Inter_600SemiBold', fontSize: 32, lineHeight: 40 },
} as const;

export type TypographyName = keyof typeof typography;
