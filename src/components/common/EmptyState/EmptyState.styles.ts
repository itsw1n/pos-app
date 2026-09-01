import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export const emptyStateStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  title: {
    ...typography.lg,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    ...typography.md,
    marginTop: spacing.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
