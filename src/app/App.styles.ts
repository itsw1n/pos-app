import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export const appStyles = StyleSheet.create({
  gate: {
    flex: 1,
    backgroundColor: colors.background,
  },
  configurationError: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    backgroundColor: colors.background,
  },
  configurationTitle: {
    ...typography.xl,
    color: colors.textPrimary,
  },
  configurationMessage: {
    ...typography.md,
    marginTop: spacing.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
