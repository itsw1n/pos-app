import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export const checkoutScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.resting,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.md,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.lg,
    color: colors.textPrimary,
  },
  summaryTotal: {
    ...typography['2xl'],
    color: colors.primary,
  },
  sectionTitle: {
    ...typography.xl,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  modeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.resting,
  },
  modeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.navActive,
  },
  modeCardPressed: {
    opacity: 0.85,
  },
  modeTitle: {
    ...typography.lg,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  modeSubtitle: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  continueButtonPressed: {
    backgroundColor: colors.secondary,
  },
  continueButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  continueButtonText: {
    ...typography.lg,
    color: colors.surface,
  },
});
