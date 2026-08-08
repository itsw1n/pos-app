import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

export const appHeaderStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 68,
    paddingHorizontal: spacing['2xl'],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    marginLeft: spacing.md,
  },
  brandName: {
    ...typography.lg,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  pageTitle: {
    ...typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.iconCircle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.md,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
});
