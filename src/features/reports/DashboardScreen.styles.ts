import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export const dashboardScreenStyles = StyleSheet.create({
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
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.resting,
  },
  summaryLabel: {
    ...typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography['2xl'],
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.resting,
  },
  cardTitle: {
    ...typography.lg,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  chart: {
    alignItems: 'center',
  },
  reportsButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reportsButtonPressed: {
    backgroundColor: colors.secondary,
  },
  reportsButtonText: {
    ...typography.lg,
    color: colors.surface,
  },
  lowStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  lowStockInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  topProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  topProductInfo: {
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
    marginTop: spacing.xs,
  },
  rowValue: {
    ...typography.md,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  rowValueLow: {
    color: colors.warning,
  },
  rowValueCritical: {
    color: colors.danger,
  },
  emptyText: {
    ...typography.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
