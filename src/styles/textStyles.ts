import { StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

export const textStyles = StyleSheet.create({
  h1: { ...typography['4xl'], color: colors.textPrimary },
  h2: { ...typography['3xl'], color: colors.textPrimary },
  h3: { ...typography['2xl'], color: colors.textPrimary },
  body: { ...typography.md, color: colors.textPrimary },
  caption: { ...typography.sm, color: colors.textSecondary },
  label: { ...typography.sm, color: colors.textSecondary },
  error: { ...typography.sm, color: colors.danger },
  success: { ...typography.sm, color: colors.success },
});
