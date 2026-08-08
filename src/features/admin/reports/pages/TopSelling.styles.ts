import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

export const topSellingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  errorText: {
    ...typography.sm,
    color: colors.danger,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
  },
  loadingText: {
    ...typography.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['6xl'],
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  rankTile: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rankText: {
    ...typography.md,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  rowName: {
    ...typography.md,
    color: colors.textPrimary,
  },
  rowMeta: {
    ...typography.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rowValue: {
    ...typography.md,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
  },
  emptyText: {
    ...typography.md,
    color: colors.textSecondary,
  },
});
