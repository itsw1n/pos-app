import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export const userManagementStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['6xl'],
  },
  loadingText: {
    ...typography.md,
    color: colors.textSecondary,
  },
  sectionLabel: {
    ...typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.resting,
  },
  roleRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  roleButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  createButton: {
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.sm,
    color: colors.danger,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.resting,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  userName: {
    ...typography.lg,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userMeta: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  statusBadge: {
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  statusBadgeActive: {
    backgroundColor: colors.success,
  },
  statusBadgeInactive: {
    backgroundColor: colors.disabled,
  },
  statusBadgeText: {
    ...typography.xs,
    fontWeight: '500' as const,
    color: colors.surface,
  },
  toggleButton: {
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyText: {
    ...typography.md,
    color: colors.textSecondary,
  },
});
