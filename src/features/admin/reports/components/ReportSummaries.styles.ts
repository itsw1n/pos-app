import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export const reportSummariesStyles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadows.resting,
  },
  cardTitle: {
    ...typography.lg,
    marginBottom: spacing.md,
    color: colors.textPrimary,
    fontWeight: '600',
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginVertical: spacing.md,
    backgroundColor: colors.border,
  },
  sectionLabel: {
    ...typography.sm,
    marginBottom: spacing.sm,
    color: colors.textSecondary,
    fontWeight: '600',
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
    color: colors.textPrimary,
    fontWeight: '600',
  },
  stockBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
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
