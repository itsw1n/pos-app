import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../../../theme';

export const cardStyles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.resting,
  },
  title: {
    ...typography.lg,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
});
