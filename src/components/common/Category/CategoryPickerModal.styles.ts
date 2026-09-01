import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../../theme';

export const categoryPickerModalStyles = StyleSheet.create({
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
    marginBottom: spacing.md,
  },
  list: {
    maxHeight: 320,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  optionText: {
    ...typography.md,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    fontWeight: '600' as const,
    color: colors.primary,
  },
});
