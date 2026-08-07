import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

export const qtyControlsStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  decrementButton: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incrementButton: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.lg,
    color: colors.textPrimary,
  },
  incrementButtonText: {
    color: colors.surface,
  },
  value: {
    ...typography.md,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
