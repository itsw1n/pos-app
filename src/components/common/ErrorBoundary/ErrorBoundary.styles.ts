import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../../theme';

export const errorBoundaryStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    backgroundColor: colors.background,
  },
  title: {
    ...typography.xl,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    ...shadows.active,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    ...typography.md,
    fontWeight: '600' as const,
    color: colors.surface,
  },
});
