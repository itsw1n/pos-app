import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../../theme';

export const productCardStyles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.resting,
  },
  pressed: {
    backgroundColor: colors.navActive,
  },
  unavailable: {
    opacity: 0.5,
  },
  name: {
    ...typography.lg,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  price: {
    ...typography.xl,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  availability: {
    ...typography.sm,
  },
  availableText: {
    color: colors.success,
  },
  unavailableText: {
    color: colors.danger,
  },
});
