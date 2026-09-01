import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export const errorStateStyles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  title: {
    ...typography.xl,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    ...typography.md,
    marginTop: spacing.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.lg,
  },
});
