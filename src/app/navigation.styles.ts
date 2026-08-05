import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export const navigationStyles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  placeholderTitle: {
    ...typography['2xl'],
    color: colors.textPrimary,
  },
  placeholderCaption: {
    ...typography.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
