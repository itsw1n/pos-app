import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

export const stockBadgeStyles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  ok: {
    backgroundColor: colors.success,
  },
  low: {
    backgroundColor: colors.warning,
  },
  critical: {
    backgroundColor: colors.danger,
  },
  label: {
    ...typography.sm,
    fontWeight: '600' as const,
    color: colors.surface,
  },
});
