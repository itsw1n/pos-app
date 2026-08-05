import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export const transactionHistoryScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['6xl'],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.sm,
    color: colors.danger,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.resting,
  },
  itemCardVoided: {
    opacity: 0.6,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemDate: {
    ...typography.md,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  itemMeta: {
    ...typography.xs,
    color: colors.textSecondary,
  },
  modeBadge: {
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.secondary,
  },
  modeBadgeText: {
    ...typography.xs,
    color: colors.surface,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTotal: {
    ...typography.xl,
    color: colors.textPrimary,
  },
  itemTotalVoided: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  voidedBadge: {
    borderRadius: radius.lg,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.disabled,
  },
  voidedBadgeText: {
    ...typography.sm,
    color: colors.surface,
  },
  voidButton: {
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.danger,
  },
  voidButtonPressed: {
    backgroundColor: colors.textPrimary,
  },
  voidButtonText: {
    ...typography.md,
    color: colors.surface,
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
