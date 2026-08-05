import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export const addEditProductScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['6xl'],
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.resting,
  },
  fieldSpacing: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
  },
  toggleOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleOptionLeft: {
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    marginRight: spacing.xs,
  },
  toggleOptionRight: {
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    marginLeft: spacing.xs,
  },
  toggleOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  toggleOptionText: {
    ...typography.md,
    color: colors.textSecondary,
  },
  toggleOptionTextActive: {
    color: colors.surface,
    fontWeight: '600' as const,
  },
  errorText: {
    ...typography.sm,
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  submitButton: {
    marginBottom: spacing.sm,
  },
});
