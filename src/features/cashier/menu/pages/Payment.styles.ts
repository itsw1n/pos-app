import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export const paymentStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  topBarTitle: {
    ...typography.xl,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  topBarBalance: {
    width: 22,
  },
  scrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.xl,
    paddingBottom: 32,
  },
  totalSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  totalLabel: {
    ...typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  totalValue: {
    ...typography['4xl'],
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  sectionLabel: {
    ...typography.xs,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  methodList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.resting,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.iconCircle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionLabel: {
    flex: 1,
    ...typography.md,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  selectIndicator: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashSection: {
    marginBottom: spacing.lg,
  },
  amountGroup: {
    marginBottom: spacing.lg,
  },
  amountLabel: {
    ...typography.xs,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  changeLabel: {
    ...typography.xs,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  changeValue: {
    ...typography.xl,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  changeNegative: {
    color: colors.danger,
  },
  hint: {
    backgroundColor: colors.navActive,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hintText: {
    flex: 1,
    ...typography.sm,
    color: colors.primary,
  },
  errorText: {
    ...typography.sm,
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    ...shadows.active,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  confirmButtonText: {
    ...typography.lg,
    fontWeight: '600' as const,
    color: colors.surface,
  },
});