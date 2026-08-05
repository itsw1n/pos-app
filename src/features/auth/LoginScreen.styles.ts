import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

export const loginScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    ...typography['2xl'],
    marginBottom: spacing['3xl'],
    textAlign: 'center',
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    ...typography.sm,
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.secondary,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  buttonText: {
    ...typography.xl,
    color: colors.surface,
  },
});
