import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

export const paymentBadgeStyles = StyleSheet.create({
  badge: {
    backgroundColor: colors.iconCircle,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  label: {
    ...typography.xs,
    fontWeight: '500' as const,
    color: colors.primary,
  },
});
