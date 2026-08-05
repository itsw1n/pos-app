import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

export const inputFieldStyles = StyleSheet.create({
  root: {
    width: '100%',
  },
  label: {
    ...typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  multilineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    minHeight: 96,
  },
  icon: {
    marginRight: spacing.sm,
    opacity: 0.6,
  },
  iconAfter: {
    marginLeft: spacing.sm,
    opacity: 0.6,
  },
  input: {
    ...typography.md,
    color: colors.textPrimary,
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: 'auto',
    minHeight: undefined,
  },
  inputMultiline: {
    ...typography.md,
    color: colors.textPrimary,
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  inputDisabled: {
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.xs,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
