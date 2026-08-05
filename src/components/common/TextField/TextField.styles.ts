import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

export const textFieldStyles = StyleSheet.create({
  root: {
    width: '100%',
  },
  label: {
    ...typography.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.md,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    ...typography.sm,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
