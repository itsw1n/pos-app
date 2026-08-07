import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export const cartScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['6xl'],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography['2xl'],
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  emptyButtonPressed: {
    backgroundColor: colors.secondary,
  },
  emptyButtonText: {
    ...typography.md,
    color: colors.surface,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.resting,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.lg,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonPressed: {
    backgroundColor: colors.disabled,
  },
  qtyButtonText: {
    ...typography.lg,
    color: colors.textPrimary,
  },
  qtyValue: {
    ...typography.lg,
    color: colors.textPrimary,
    marginHorizontal: spacing.sm,
    minWidth: 24,
    textAlign: 'center',
  },
  itemTotal: {
    ...typography.xl,
    color: colors.primary,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: {
    ...typography.lg,
    color: colors.textSecondary,
  },
  totalValue: {
    ...typography['3xl'],
    color: colors.textPrimary,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  checkoutButtonPressed: {
    backgroundColor: colors.secondary,
  },
  checkoutButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  checkoutButtonText: {
    ...typography.lg,
    color: colors.surface,
  },
});
