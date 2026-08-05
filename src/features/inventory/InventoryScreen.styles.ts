import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export const inventoryScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: 0,
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
  },
  errorText: {
    ...typography.sm,
    color: colors.danger,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    margin: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.resting,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.md,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.xl,
    color: colors.textPrimary,
  },
  summaryValueCritical: {
    ...typography.xl,
    color: colors.danger,
  },
  alertBanner: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  alertText: {
    ...typography.sm,
    color: colors.warning,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  filterTabActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterTabText: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.surface,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.resting,
  },
  rowBorder: {
    borderLeftWidth: 4,
  },
  rowOk: {
    borderLeftColor: colors.success,
  },
  rowLow: {
    borderLeftColor: colors.warning,
  },
  rowCritical: {
    borderLeftColor: colors.danger,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemName: {
    ...typography.lg,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  itemCategory: {
    ...typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  badge: {
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  badgeText: {
    ...typography.xs,
    fontWeight: '500' as const,
    color: colors.surface,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statLabel: {
    ...typography.sm,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  statValue: {
    ...typography.lg,
    color: colors.textPrimary,
    marginRight: spacing.md,
  },
  statValueCritical: {
    color: colors.danger,
  },
  statDivider: {
    ...typography.md,
    color: colors.disabled,
    marginRight: spacing.md,
  },
  stockInButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  stockInButtonPressed: {
    backgroundColor: colors.secondary,
  },
  stockInButtonText: {
    ...typography.md,
    color: colors.surface,
  },
});
