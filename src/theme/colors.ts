export const colors = {
  primary: '#364C35',
  secondary: '#4D644B',
  navActive: '#ADC5AB',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  success: '#4CAF72',
  warning: '#F5A623',
  danger: '#E8614A',
  dangerSurface: '#FEF0F0',
  dangerBorder: '#FECACA',
  disabled: '#C2C5C5',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  border: '#E0E0E0',
  iconCircle: '#E8F0E3',
} as const;

export type ColorName = keyof typeof colors;