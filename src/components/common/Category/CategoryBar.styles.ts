import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

export const categoryBarStyles = StyleSheet.create({
  scroll: {
    height: 44,
    flexGrow: 0,
    flexShrink: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  chipTextActive: {
    fontWeight: '600' as const,
    color: colors.surface,
  },
});
