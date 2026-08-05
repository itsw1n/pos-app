import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export const receiptScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  receiptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.resting,
  },
  receiptHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  receiptBrand: {
    ...typography['2xl'],
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  receiptMeta: {
    ...typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  receiptId: {
    ...typography.xs,
    color: colors.textSecondary,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  itemName: {
    ...typography.md,
    color: colors.textPrimary,
    flex: 1,
  },
  itemQty: {
    ...typography.md,
    color: colors.textSecondary,
    marginHorizontal: spacing.sm,
  },
  itemSubtotal: {
    ...typography.md,
    color: colors.textPrimary,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalLabel: {
    ...typography.md,
    color: colors.textSecondary,
  },
  totalValue: {
    ...typography['3xl'],
    color: colors.primary,
  },
  changeValue: {
    ...typography['2xl'],
    color: colors.success,
  },
  paymentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.navActive,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  paymentBadgeText: {
    ...typography.sm,
    color: colors.primary,
  },
  actions: {
    gap: spacing.md,
  },
  actionButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  actionButtonPressed: {
    backgroundColor: colors.navActive,
  },
  actionButtonText: {
    ...typography.lg,
    color: colors.primary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    backgroundColor: colors.secondary,
  },
  primaryButtonText: {
    ...typography.lg,
    color: colors.surface,
  },
});
