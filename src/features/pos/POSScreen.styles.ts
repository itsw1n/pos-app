import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export const posScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['6xl'],
  },
  gridColumn: {
    gap: spacing.md,
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
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.md,
    color: colors.danger,
    margin: spacing.lg,
    textAlign: 'center',
  },
  categoryBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  categoryTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryTabActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  categoryTabText: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  categoryTabTextActive: {
    color: colors.surface,
  },
  productCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.resting,
  },
  productCardPressed: {
    backgroundColor: colors.navActive,
  },
  productCardDisabled: {
    opacity: 0.5,
  },
  productName: {
    ...typography.lg,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  productCategory: {
    ...typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  productPrice: {
    ...typography.xl,
    color: colors.primary,
  },
  cartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  cartBarInfo: {
    flex: 1,
  },
  cartBarText: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  cartBarTotal: {
    ...typography.xl,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  cartBarButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBarButtonPressed: {
    backgroundColor: colors.secondary,
  },
  cartBarButtonText: {
    ...typography.md,
    color: colors.surface,
  },
});
