import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../../theme';

export const dateFilterPickerModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.xl,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  monthNavButton: {
    padding: spacing.sm,
  },
  monthNavButtonDisabled: {
    opacity: 0.4,
  },
  monthNavLabel: {
    ...typography.lg,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  hint: {
    ...typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  doneButton: {
    marginTop: spacing.lg,
  },
});
