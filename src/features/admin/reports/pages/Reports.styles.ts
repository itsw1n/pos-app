import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export const reportsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['6xl'],
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
  errorText: {
    ...typography.sm,
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  dateFilter: {
    marginBottom: spacing.md,
    paddingHorizontal: 0,
  },
  exportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
  },
  exportSpinner: {
    marginLeft: spacing.sm,
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
  rangeRow: {
    marginBottom: spacing.md,
  },
  rangeText: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
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
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  sectionLabel: {
    ...typography.sm,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
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
  },
  rowValue: {
    ...typography.md,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  stockBadge: {
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.success,
  },
  stockBadgeLow: {
    backgroundColor: colors.warning,
  },
  stockBadgeCritical: {
    backgroundColor: colors.danger,
  },
  stockBadgeText: {
    ...typography.xs,
    color: colors.surface,
  },
});
