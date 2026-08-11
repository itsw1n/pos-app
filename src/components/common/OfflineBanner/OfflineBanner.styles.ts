import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

export const offlineBannerStyles = StyleSheet.create({
  root: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignSelf: 'stretch',
  },
  text: {
    ...typography.sm,
    fontWeight: '600' as const,
    color: colors.surface,
    textAlign: 'center',
  },
});
