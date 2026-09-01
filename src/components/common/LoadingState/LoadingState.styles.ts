import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export const loadingStateStyles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  message: {
    ...typography.md,
    marginTop: spacing.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
