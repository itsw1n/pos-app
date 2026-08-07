import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

export const dateFilterPickerStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    maxWidth: 220,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chipText: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  chipTextFlex: {
    flexShrink: 1,
  },
  chipTextActive: {
    fontWeight: '600' as const,
    color: colors.surface,
  },
  chipClear: {
    marginLeft: spacing.sm,
  },
});
