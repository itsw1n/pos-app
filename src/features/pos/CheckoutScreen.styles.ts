import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export const checkoutScreenStyles = StyleSheet.create({
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
    paddingTop: spacing.lg,
    paddingBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.resting,
  },
  infoCardCustomer: {
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.navActive,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    ...typography.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    ...typography.md,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  customerInput: {
    ...typography.md,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  editButton: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  editButtonText: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  sectionLabel: {
    ...typography.lg,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  orderItems: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  orderItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadows.resting,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  productImageEmoji: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  productName: {
    ...typography.md,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  productPrice: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  paymentSection: {
    marginBottom: spacing.lg,
  },
  paymentTitle: {
    ...typography.xs,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    ...typography.md,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.md,
    color: colors.textPrimary,
  },
  detailValueSecondary: {
    color: colors.textSecondary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  totalLabel: {
    ...typography.lg,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  totalValue: {
    ...typography.xl,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  processButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.active,
  },
  processButtonText: {
    ...typography.lg,
    fontWeight: '600' as const,
    color: colors.surface,
  },
});