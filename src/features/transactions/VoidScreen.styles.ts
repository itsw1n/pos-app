import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export const voidScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['6xl'],
  },
  warningBanner: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.resting,
  },
  warningTitle: {
    ...typography.lg,
    fontWeight: '600' as const,
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  warningText: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
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
    ...typography.md,
    color: colors.textPrimary,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.resting,
  },
  inputLabel: {
    ...typography.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 96,
    textAlignVertical: 'top',
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    ...typography.lg,
  },
  hintText: {
    ...typography.sm,
    color: colors.warning,
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.sm,
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: colors.danger,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  confirmButtonPressed: {
    backgroundColor: colors.textPrimary,
  },
  confirmButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  confirmButtonText: {
    ...typography.lg,
    color: colors.surface,
  },
});
