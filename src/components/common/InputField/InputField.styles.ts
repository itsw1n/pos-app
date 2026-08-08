import { Platform, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

// React Native Web renders browser inputs with their default focus ring
// (orange in Chrome). Our custom focus border already signals focus, so the
// browser ring is suppressed on web only. RN 0.86's `outlineStyle` type only
// allows 'solid'|'dotted'|'dashed', so the ring is instead cleared via a zero
// outline width + transparent color, which is the CSS-equivalent of
// `outline-style: none`. Native (iOS/Android) styles are untouched.
const webOnlyOutlineReset =
  Platform.OS === 'web' ? { outlineWidth: 0, outlineColor: 'transparent' } : {};

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
    backgroundColor: 'transparent',
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: 'auto',
    minHeight: undefined,
    ...webOnlyOutlineReset,
  },
  inputMultiline: {
    ...typography.md,
    color: colors.textPrimary,
    backgroundColor: 'transparent',
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
    ...webOnlyOutlineReset,
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
