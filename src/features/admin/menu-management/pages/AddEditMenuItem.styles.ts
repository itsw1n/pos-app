import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export const addEditMenuItemStyles = StyleSheet.create({
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
  topBarSpacer: {
    width: 22,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['6xl'],
  },
  keyboardView: {
    flex: 1,
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
  categoryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  categoryPickerActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  categoryPickerText: {
    ...typography.md,
    color: colors.textPrimary,
  },
  categoryPickerPlaceholder: {
    ...typography.md,
    color: colors.textSecondary,
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadows.resting,
  },
  availabilityTextBlock: {
    flex: 1,
    marginRight: spacing.md,
  },
  availabilityTitle: {
    ...typography.md,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  availabilityCaption: {
    ...typography.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.sm,
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.active,
  },
  saveButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  saveButtonText: {
    ...typography.lg,
    fontWeight: '600' as const,
    color: colors.surface,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.full,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    ...typography.lg,
    fontWeight: '600' as const,
    color: colors.danger,
  },
});