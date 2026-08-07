import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export const transactionHistoryScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  topBarTitle: {
    ...typography.xl,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  searchBar: {
    marginHorizontal: spacing['2xl'],
    marginBottom: spacing.md,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.md,
  },
  filterTab: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    fontWeight: '600' as const,
    color: colors.surface,
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
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.resting,
  },
  itemCardVoided: {
    backgroundColor: colors.dangerSurface,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    opacity: 0.85,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  itemId: {
    ...typography.sm,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  modeBadge: {
    backgroundColor: colors.iconCircle,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  modeBadgeText: {
    ...typography.xs,
    color: colors.primary,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  itemDate: {
    ...typography.xs,
    color: colors.textSecondary,
  },
  itemCount: {
    ...typography.xs,
    color: colors.textSecondary,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTotal: {
    ...typography.lg,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  itemTotalVoided: {
    color: colors.textSecondary,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  voidedBadge: {
    backgroundColor: colors.dangerSurface,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  voidedBadgeText: {
    ...typography.sm,
    fontWeight: '600' as const,
    color: colors.danger,
  },
  voidButton: {
    backgroundColor: colors.dangerSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  voidButtonPressed: {
    backgroundColor: colors.dangerBorder,
  },
  voidButtonText: {
    ...typography.sm,
    color: colors.danger,
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