import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export const inventoryManagementStyles = StyleSheet.create({
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.resting,
  },
  bannerIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.iconCircle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  alertText: {
    ...typography.sm,
    color: colors.warning,
    flex: 1,
  },
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  exportSpinner: {
    marginLeft: spacing.sm,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchBar: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
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
