import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export const transactionHistoryScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    marginHorizontal: spacing['2xl'],
    marginVertical: spacing.md,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing['2xl'],
    marginBottom: spacing.lg,
    ...shadows.resting,
  },
  summaryBlock: {
    flex: 1,
  },
  summaryLabel: {
    ...typography.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.lg,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  summaryCount: {
    ...typography.lg,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: spacing['2xl'],
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
  },
  emptyText: {
    ...typography.md,
    color: colors.textSecondary,
  },

  /* ---- transaction card ---- */
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.resting,
  },
  cardVoided: {
    backgroundColor: colors.dangerSurface,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    opacity: 0.8,
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  txnId: {
    ...typography.sm,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  itemCount: {
    ...typography.xs,
    color: colors.textSecondary,
  },
  row1Right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemDate: {
    ...typography.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  itemSummary: {
    ...typography.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  row4: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTotal: {
    ...typography.lg,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  itemTotalVoided: {
    color: colors.textSecondary,
  },
  voidBadge: {
    backgroundColor: colors.dangerSurface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  voidBadgeText: {
    ...typography.xs,
    fontWeight: '600' as const,
    color: colors.danger,
  },
  voidButton: {
    backgroundColor: colors.dangerSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  voidButtonPressed: {
    backgroundColor: colors.dangerBorder,
  },
  voidButtonText: {
    ...typography.sm,
    fontWeight: '500' as const,
    color: colors.danger,
  },
});
