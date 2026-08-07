import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

export const buttonStyles = StyleSheet.create({
  root: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variantPrimary: {
    backgroundColor: colors.primary,
  },
  variantSecondary: {
    backgroundColor: colors.secondary,
  },
  variantOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  variantDanger: {
    backgroundColor: colors.danger,
  },
  sizeSmall: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  sizeMedium: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  sizeLarge: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    ...typography.md,
    fontWeight: '600' as const,
  },
  labelSmall: {
    ...typography.sm,
    fontWeight: '600' as const,
  },
  labelMedium: {
    ...typography.md,
    fontWeight: '600' as const,
  },
  labelLarge: {
    ...typography.lg,
    fontWeight: '600' as const,
  },
  labelPrimary: {
    color: colors.surface,
  },
  labelSecondary: {
    color: colors.surface,
  },
  labelOutline: {
    color: colors.primary,
  },
  labelDanger: {
    color: colors.surface,
  },
});
