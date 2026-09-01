import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export const addCategoryModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadows.modal,
  },
  title: {
    ...typography.xl,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.sm,
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  cancelButtonText: {
    ...typography.md,
    color: colors.textSecondary,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  addButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  addButtonText: {
    ...typography.md,
    fontWeight: '600' as const,
    color: colors.surface,
  },
});
